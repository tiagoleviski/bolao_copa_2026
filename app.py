# app.py
# app.py
import streamlit as st
import pandas as pd
from datetime import datetime, timedelta, timezone
from src.database import (get_supabase_client, listar_partidas_com_times, salvar_aposta,
                          buscar_apostas_usuario, atualizar_resultado_real, buscar_perfil_usuario,
                          buscar_todos_paises, buscar_todas_previsoes,
                          salvar_previsoes_fase, salvar_posicao_especifica,
                          buscar_jogadores, buscar_aposta_artilheiro, salvar_aposta_artilheiro)
from src.auth import registrar_usuario, logar_usuario, solicitar_recuperacao_senha, resetar_senha_com_codigo

# 1. CONFIGURAÇÃO DA PÁGINA
st.set_page_config(page_title="Bolão Copa 2026", page_icon="🏆", layout="wide")

# 2. INICIALIZAÇÃO DO ESTADO
if "user" not in st.session_state:
    st.session_state.user = None
if "reset_mode" not in st.session_state:
    st.session_state.reset_mode = False
if "esperando_codigo" not in st.session_state:
    st.session_state.esperando_codigo = False

ADMIN_EMAILS = ["tiagoleviski@gmail.com"]
PRAZO_PREVISOES = datetime(2026, 6, 10, 19, 0, 0, tzinfo=timezone.utc)  # 10/06 às 16:00 BRT

# --- FUNÇÕES DE APOIO ---
def eh_admin():
    user = st.session_state.get("user")
    if user and hasattr(user, 'email'):
        return user.email in ADMIN_EMAILS
    return False

# --- PÁGINAS DO SISTEMA ---

def salvar_se_completo(user_id, partida_id):
    g_a = st.session_state.get(f"a_{partida_id}")
    g_b = st.session_state.get(f"b_{partida_id}")
    if g_a is not None and g_b is not None:
        salvar_aposta(user_id, partida_id, g_a, g_b)

def pagina_reset_senha():
    st.markdown("<h1 style='text-align: center;'>🔑 Recuperar Senha</h1>", unsafe_allow_html=True)
    _, col_meio, _ = st.columns([1, 1, 1])
    with col_meio:
        email_recup = st.text_input("Digite seu e-mail cadastrado")
        if st.button("Enviar Código de Recuperação", use_container_width=True):
            sucesso, msg = solicitar_recuperacao_senha(email_recup)
            if sucesso:
                st.success("Verifique o código no seu e-mail.")
                st.session_state.esperando_codigo = True
            else: st.error(msg)

        if st.session_state.get("esperando_codigo"):
            with st.form("form_final_reset"):
                codigo = st.text_input("Código de 6 dígitos")
                nova_senha = st.text_input("Nova Senha", type="password")
                if st.form_submit_button("Confirmar Nova Senha", use_container_width=True):
                    sucesso, msg = resetar_senha_com_codigo(email_recup, codigo, nova_senha)
                    if sucesso:
                        st.success(msg)
                        st.session_state.reset_mode = False
                        st.session_state.esperando_codigo = False
                        st.rerun()
                    else: st.error(msg)
        
        if st.button("Voltar para Login", use_container_width=True):
            st.session_state.reset_mode = False
            st.rerun()

def render_previsao_classificados(user_id, num_rodada, agora, fuso_rio, todos_paises, todas_previsoes):
    abertas = agora < PRAZO_PREVISOES.astimezone(fuso_rio)
    prazo_brt = PRAZO_PREVISOES.astimezone(fuso_rio)

    def texto_countdown():
        if abertas:
            tr = prazo_brt - agora
            return f"⏳ Previsões fecham em {tr.days}d {tr.seconds//3600:02d}h {(tr.seconds//60)%60:02d}m — {prazo_brt.strftime('%d/%m às %H:%M')} BRT"
        return "🔒 Previsões encerradas."

    id_por_nome = {p['nome']: p['id'] for p in todos_paises}

    config_fases = {
        4: ('Segunda Fase',     32, None),
        5: ('Oitavas de Final', 16, 'Segunda Fase'),
        6: ('Quartas de Final',  8, 'Oitavas de Final'),
        7: ('Semifinal',         4, 'Quartas de Final'),
    }

    if num_rodada in config_fases:
        fase_nome, limite, fase_anterior = config_fases[num_rodada]
        st.subheader(f"🏅 Quem avança para a {fase_nome}?")
        st.caption(texto_countdown())

        if fase_anterior:
            ids_prev = todas_previsoes.get(fase_anterior, set())
            paises_elegiveis = sorted([p for p in todos_paises if p['id'] in ids_prev], key=lambda x: x['nome'])
            if not paises_elegiveis:
                st.info("⚠️ Selecione primeiro os times classificados na aba anterior.")
                st.divider()
                return
        else:
            paises_elegiveis = sorted(todos_paises, key=lambda x: x['nome'])

        selecionados_ids = todas_previsoes.get(fase_nome, set())
        nomes_elegiveis = [p['nome'] for p in paises_elegiveis]
        nomes_selecionados = [p['nome'] for p in paises_elegiveis if p['id'] in selecionados_ids]
        widget_key = f"prev_{fase_nome}_{user_id}"
        n = len(st.session_state.get(widget_key, nomes_selecionados))
        cor = "green" if n == limite else "orange"
        st.markdown(f":{cor}[**{n} / {limite} times selecionados**]")

        if abertas:
            def _auto_salvar(uid=user_id, fase=fase_nome, id_map=id_por_nome):
                novos_nomes = st.session_state.get(f"prev_{fase}_{uid}", [])
                salvar_previsoes_fase(uid, [id_map[nm] for nm in novos_nomes if nm in id_map], fase)

            st.multiselect(
                "Times classificados:",
                options=nomes_elegiveis,
                default=nomes_selecionados,
                max_selections=limite,
                key=widget_key,
                label_visibility="collapsed",
                on_change=_auto_salvar,
            )
        else:
            if nomes_selecionados:
                cols = st.columns(4)
                for j, nome in enumerate(nomes_selecionados):
                    cols[j % 4].write(f"✅ {nome}")
            else:
                st.info("Nenhuma previsão registrada.")
        st.divider()

    elif num_rodada in (8, 9):
        semi_ids = todas_previsoes.get('Semifinal', set())
        semi_paises = sorted([p for p in todos_paises if p['id'] in semi_ids], key=lambda x: x['nome'])
        semi_nomes = [p['nome'] for p in semi_paises]
        id_por_nome_s = {p['nome']: p['id'] for p in semi_paises}

        if num_rodada == 9:
            st.subheader("🏆 Previsão da Final")
            pos_a, pos_b = 'Campeão', 'Vice-Campeão'
            label_a, label_b = "🥇 Campeão", "🥈 Vice-Campeão"
        else:
            st.subheader("🥉 Previsão da Disputa pelo 3º Lugar")
            pos_a, pos_b = '3º Lugar', '4º Lugar'
            label_a, label_b = "🥉 3º Lugar", "4️⃣ 4º Lugar"

        st.caption(texto_countdown())

        if not semi_paises:
            st.info("⚠️ Selecione primeiro os 4 semifinalistas na aba Semifinal.")
            st.divider()
            return

        # Nomes já selecionados em cada uma das 4 posições
        todas_pos = ['Campeão', 'Vice-Campeão', '3º Lugar', '4º Lugar']
        pos_selecionado = {
            pos: next((p['nome'] for p in semi_paises if p['id'] in todas_previsoes.get(pos, set())), None)
            for pos in todas_pos
        }

        def opcoes_para(posicao):
            excluidos = {v for k, v in pos_selecionado.items() if k != posicao and v is not None}
            return ["— selecione —"] + [n for n in semi_nomes if n not in excluidos]

        def _auto_salvar_pos(uid=user_id, pos=pos_a, id_map=id_por_nome_s):
            key = f"sel_{pos}_{uid}"
            valor = st.session_state.get(key, "— selecione —")
            pais_id = id_map.get(valor) if valor != "— selecione —" else None
            salvar_posicao_especifica(uid, pais_id, pos)

        def _auto_salvar_pos_b(uid=user_id, pos=pos_b, id_map=id_por_nome_s):
            key = f"sel_{pos}_{uid}"
            valor = st.session_state.get(key, "— selecione —")
            pais_id = id_map.get(valor) if valor != "— selecione —" else None
            salvar_posicao_especifica(uid, pais_id, pos)

        opcoes_a = opcoes_para(pos_a)
        opcoes_b = opcoes_para(pos_b)
        nome_a = pos_selecionado[pos_a]
        nome_b = pos_selecionado[pos_b]
        idx_a = opcoes_a.index(nome_a) if nome_a in opcoes_a else 0
        idx_b = opcoes_b.index(nome_b) if nome_b in opcoes_b else 0

        col1, col2 = st.columns(2)
        with col1:
            st.selectbox(label_a, opcoes_a, index=idx_a, disabled=not abertas,
                         key=f"sel_{pos_a}_{user_id}", on_change=_auto_salvar_pos)
        with col2:
            st.selectbox(label_b, opcoes_b, index=idx_b, disabled=not abertas,
                         key=f"sel_{pos_b}_{user_id}", on_change=_auto_salvar_pos_b)
        st.divider()


def pagina_apostas():
    st.title("🏆 Meus Palpites")
    user_id = st.session_state.user.id
    fuso_utc, fuso_rio = timezone.utc, timezone(timedelta(hours=-3))
    agora = datetime.now(fuso_rio)

    partidas = listar_partidas_com_times()
    apostas_existentes = buscar_apostas_usuario(user_id)
    todos_paises = buscar_todos_paises()
    todas_previsoes = buscar_todas_previsoes(user_id)

    organizado = {}
    for p in partidas:
        g, r = p.get('grupo', 'Sem Grupo'), p.get('rodada', 0)
        if r not in organizado: organizado[r] = {}
        if g not in organizado[r]: organizado[r][g] = []
        organizado[r][g].append(p)

    formatar_rodada = {
        1: "1ª Rodada", 2: "2ª Rodada", 3: "3ª Rodada",
        4: "Segunda Fase", 5: "Oitavas de Final", 6: "Quartas de Final",
        7: "Semifinal", 8: "Disputa do 3º Lugar", 9: "Final"
    }
    rodadas_ids = sorted(organizado.keys())
    abas = st.tabs([formatar_rodada.get(r, f"{r}ª Rodada") for r in rodadas_ids])

    for i, num_rodada in enumerate(rodadas_ids):
        with abas[i]:
            render_previsao_classificados(user_id, num_rodada, agora, fuso_rio, todos_paises, todas_previsoes)

            if num_rodada == 9:
                col_jogo, col_art = st.columns([3, 2])
                ctx_jogo = col_jogo
            else:
                col_art = None
                ctx_jogo = st.container()

            with ctx_jogo:
                for grupo in sorted(organizado[num_rodada].keys()):
                    if num_rodada <= 3:
                        st.header(f"📂 {grupo}")
                    for p in organizado[num_rodada][grupo]:
                        dt = datetime.fromisoformat(p['data_hora'])
                        if dt.tzinfo is None: dt = dt.replace(tzinfo=fuso_utc)
                        h_jogo = dt.astimezone(fuso_rio)

                        time_a = p.get('time_a')
                        time_b = p.get('time_b')
                        times_definidos = time_a is not None and time_b is not None
                        nome_a = time_a['nome'] if time_a else p.get('placeholder_time_a', 'A definir')
                        nome_b = time_b['nome'] if time_b else p.get('placeholder_time_b', 'A definir')
                        bandeira_a = time_a.get('bandeira_url') if time_a else None
                        bandeira_b = time_b.get('bandeira_url') if time_b else None

                        prazo_aberto = (h_jogo - timedelta(hours=1) - agora).total_seconds() > 0
                        aberto = times_definidos and prazo_aberto

                        if prazo_aberto:
                            tr = h_jogo - timedelta(hours=1) - agora
                            cor = "blue"
                            status = f"⏳ Fecha em: {tr.days}d {tr.seconds//3600:02d}h {(tr.seconds//60)%60:02d}m"
                        else:
                            cor, status = "red", "🚫 Apostas Encerradas"

                        val_a, val_b = apostas_existentes.get(p['id'], (None, None))
                        aposta_status = ""
                        if times_definidos:
                            aposta_status = " | ✅ Aposta Inserida" if p['id'] in apostas_existentes else " | ❌ Aposta Pendente"

                        st.markdown(f"📅 `{h_jogo.strftime('%d/%m %H:%M')}` | :{cor}[**{status}**]{aposta_status}")
                        col_a, pl_a, vs, pl_b, col_b = st.columns([2, 1, 0.5, 1, 2])

                        with col_a:
                            if bandeira_a:
                                st.image(bandeira_a, width=35)
                            st.write(f"**{nome_a}**")
                        with pl_a:
                            st.number_input(" ", 0, 20, val_a, key=f"a_{p['id']}", label_visibility="collapsed", disabled=not aberto, on_change=salvar_se_completo, args=(user_id, p['id']))
                        with vs:
                            st.markdown("<div style='text-align: center; padding-top:10px;'>×</div>", unsafe_allow_html=True)
                        with pl_b:
                            st.number_input(" ", 0, 20, val_b, key=f"b_{p['id']}", label_visibility="collapsed", disabled=not aberto, on_change=salvar_se_completo, args=(user_id, p['id']))
                        with col_b:
                            if bandeira_b:
                                st.image(bandeira_b, width=35)
                            st.write(f"**{nome_b}**")
                        st.divider()

            if col_art is not None:
                with col_art:
                    render_artilheiro(user_id, agora, fuso_rio)

def pagina_admin():
    st.title("🛡️ Área do Administrador")
    partidas = listar_partidas_com_times() 
    for p in partidas:
        with st.expander(f"⚽ {p['time_a']['nome']} x {p['time_b']['nome']} - {p['grupo']}"):
            c1, c2, c3 = st.columns([1, 1, 1])
            g_a = c1.number_input(f"Gols {p['time_a']['nome']}", 0, key=f"res_a_{p['id']}", value=p.get('gols_a_real', 0))
            g_b = c2.number_input(f"Gols {p['time_b']['nome']}", 0, key=f"res_b_{p['id']}", value=p.get('gols_b_real', 0))
            if c3.button("Salvar Resultado", key=f"btn_res_{p['id']}"):
                atualizar_resultado_real(p['id'], g_a, g_b)
                st.success("Placar oficial registrado!")

def render_artilheiro(user_id, agora, fuso_rio):
    abertas = agora < PRAZO_PREVISOES.astimezone(fuso_rio)
    prazo_brt = PRAZO_PREVISOES.astimezone(fuso_rio)

    st.subheader("⚽ Artilheiro")

    if abertas:
        tr = prazo_brt - agora
        st.caption(f"⏳ Fecha em {tr.days}d {tr.seconds//3600:02d}h {(tr.seconds//60)%60:02d}m")
    else:
        st.caption("🔒 Previsão encerrada.")

    jogadores = buscar_jogadores()
    if not jogadores:
        st.info("⚠️ Lista de jogadores não encontrada. Execute o SQL de inserção no Supabase.")
        return

    jogador_atual_id = buscar_aposta_artilheiro(user_id)
    id_por_nome = {f"{j['nome']} ({j['selecao']})": j['id'] for j in jogadores}
    nome_por_id = {j['id']: f"{j['nome']} ({j['selecao']})" for j in jogadores}
    opcoes = ["— selecione —"] + sorted(id_por_nome.keys())
    selecionado_atual = nome_por_id.get(jogador_atual_id)
    idx = opcoes.index(selecionado_atual) if selecionado_atual in opcoes else 0

    def _auto_salvar(uid=user_id, id_map=id_por_nome):
        valor = st.session_state.get(f"sel_artilheiro_{uid}", "— selecione —")
        if valor != "— selecione —":
            salvar_aposta_artilheiro(uid, id_map[valor])

    st.selectbox(
        "Artilheiro:",
        options=opcoes,
        index=idx,
        disabled=not abertas,
        key=f"sel_artilheiro_{user_id}",
        on_change=_auto_salvar,
        label_visibility="collapsed",
    )

    if jogador_atual_id and jogador_atual_id in nome_por_id:
        st.success(f"✅ **{nome_por_id[jogador_atual_id]}**")


# --- FLUXO PRINCIPAL ---

user = st.session_state.get("user")

if st.session_state.reset_mode:
    pagina_reset_senha()

elif not user:
    # TELA DE LOGIN CENTRALIZADA
    st.markdown("<br><br>", unsafe_allow_html=True) # Espaçamento topo
    st.markdown("<h1 style='text-align: center;'>🏆 Bolão Copa 2026</h1>", unsafe_allow_html=True)
    
    _, col_meio, _ = st.columns([1, 1, 1])
    
    with col_meio:
        tab1, tab2 = st.tabs(["Login", "Cadastro"])
        
        with tab1:
            with st.form("login_form"):
                email = st.text_input("Email")
                senha = st.text_input("Senha", type="password")
                if st.form_submit_button("Entrar", use_container_width=True):
                    u = logar_usuario(email, senha)
                    if u:
                        st.session_state.user = u
                        st.rerun()
                    else: st.error("Email ou senha inválidos.")
            
            if st.button("Esqueci minha senha", use_container_width=True):
                st.session_state.reset_mode = True
                st.rerun()

        with tab2:
            with st.form("signup_form"):
                n_nome = st.text_input("Nome Completo")
                n_email = st.text_input("Email")
                n_senha = st.text_input("Senha", type="password")
                if st.form_submit_button("Criar Conta", use_container_width=True):
                    sucesso, msg = registrar_usuario(n_email, n_senha, n_nome)
                    if sucesso: st.success(msg)
                    else: st.error(msg)
else:
    # INTERFACE LOGADA
    with st.sidebar:
        perfil = buscar_perfil_usuario(user.id)
        nome_exibido = perfil.get("nome_completo") if perfil else ""
        if nome_exibido:
            st.write(f"👤 **{nome_exibido}**")
        st.write(f"✉️ {user.email}")
        menu = ["Meus Palpites", "Ranking"]
        if eh_admin(): menu.append("Área do Admin")
        escolha = st.radio("Navegação", menu)
        
        if st.button("Sair"):
            st.session_state.user = None
            st.rerun()

    if escolha == "Meus Palpites":
        pagina_apostas()
    elif escolha == "Área do Admin" and eh_admin():
        pagina_admin()
    elif escolha == "Ranking":
        st.title("📊 Ranking Geral")
        st.info("O cálculo de pontos será implementado na próxima etapa!")

st.divider()
st.caption("Desenvolvido por Tiaguinho - Engenharia de Bolão")