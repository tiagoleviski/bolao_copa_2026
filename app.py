# app.py
# app.py
import streamlit as st
import pandas as pd
from datetime import datetime, timedelta, timezone
from src.database import get_supabase_client, listar_partidas_com_times, salvar_aposta, buscar_apostas_usuario, atualizar_resultado_real
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

def pagina_apostas():
    st.title("🏆 Meus Palpites")
    user_id = st.session_state.user.id
    fuso_utc, fuso_rio = timezone.utc, timezone(timedelta(hours=-3))
    agora = datetime.now(fuso_rio)
    
    partidas = listar_partidas_com_times() 
    apostas_existentes = buscar_apostas_usuario(user_id)
    
    organizado = {}
    for p in partidas:
        g, r = p.get('grupo', 'Sem Grupo'), p.get('rodada', 0)
        if g not in organizado: organizado[g] = {}
        if r not in organizado[g]: organizado[g][r] = []
        organizado[g][r].append(p)

    formatar_rodada = {1: "1ª Rodada", 2: "2ª Rodada", 3: "3ª Rodada"}
    for grupo in sorted(organizado.keys()):
        st.header(f"📂 {grupo}")
        rodadas_ids = sorted(organizado[grupo].keys())
        abas = st.tabs([formatar_rodada.get(r, f"{r}ª Rodada") for r in rodadas_ids])
        
        for i, num_rodada in enumerate(rodadas_ids):
            with abas[i]:
                for p in organizado[grupo][num_rodada]:
                    dt = datetime.fromisoformat(p['data_hora'])
                    if dt.tzinfo is None: dt = dt.replace(tzinfo=fuso_utc)
                    h_jogo = dt.astimezone(fuso_rio)

                    aberto = (h_jogo - timedelta(hours=1) - agora).total_seconds() > 0
                    cor = "blue" if aberto else "red"

                    if aberto:
                        tr = h_jogo - timedelta(hours=1) - agora
                        status = f"⏳ Fecha em: {tr.days}d {tr.seconds//3600:02d}h {(tr.seconds//60)%60:02d}m"
                    else: status = "🚫 Apostas Encerradas"

                    val_a, val_b = apostas_existentes.get(p['id'], (None, None))
                    aposta_status = "✅ Aposta Inserida" if p['id'] in apostas_existentes else "❌ Aposta Pendente"
                    st.markdown(f"📅 `{h_jogo.strftime('%d/%m %H:%M')}` | :{cor}[**{status}**] | {aposta_status}")
                    col_a, pl_a, vs, pl_b, col_b = st.columns([2, 1, 0.5, 1, 2])

                    with col_a:
                        st.image(p['time_a']['bandeira_url'], width=35)
                        st.write(f"**{p['time_a']['nome']}**")
                    with pl_a:
                        st.number_input(" ", 0, 20, val_a, key=f"a_{p['id']}", label_visibility="collapsed", disabled=not aberto, on_change=salvar_se_completo, args=(user_id, p['id']))
                    with vs: st.markdown("<div style='text-align: center; padding-top:10px;'>×</div>", unsafe_allow_html=True)
                    with pl_b:
                        st.number_input(" ", 0, 20, val_b, key=f"b_{p['id']}", label_visibility="collapsed", disabled=not aberto, on_change=salvar_se_completo, args=(user_id, p['id']))
                    with col_b:
                        st.image(p['time_b']['bandeira_url'], width=35)
                        st.write(f"**{p['time_b']['nome']}**")
                    st.divider()

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
        st.write(f"👤 **{user.email}**")
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