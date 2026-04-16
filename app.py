# app.py
import streamlit as st
from src.database import get_supabase_client, listar_partidas_com_times, salvar_aposta, buscar_apostas_usuario
from src.auth import registrar_usuario, logar_usuario, solicitar_recuperacao_senha, atualizar_senha, resetar_senha_com_codigo
import pandas as pd
from datetime import datetime, timedelta, timezone

# app.py (logo no início do código)

# O Supabase coloca um token na URL quando o usuário vem do email
# 1. TÉCNICA DE INTERCEPÇÃO: Verificar se o usuário veio do email de recuperação
# O Supabase redireciona com parâmetros na URL
# app.py (dentro da lógica de reset_mode)

if st.session_state.get("reset_mode"):
    st.subheader("🔑 Recuperar Senha")
    
    email_recup = st.text_input("Digite seu e-mail")
    
    if st.button("Enviar Código de Recuperação"):
        sucesso, msg = solicitar_recuperacao_senha(email_recup)
        if sucesso:
            st.success("Verifique o código de 6 dígitos no seu e-mail.")
            st.session_state.esperando_codigo = True
        else:
            st.error(msg)

    if st.session_state.get("esperando_codigo"):
        with st.form("form_final_reset"):
            codigo = st.text_input("Código de 6 dígitos")
            nova_senha = st.text_input("Nova Senha", type="password")
            if st.form_submit_button("Confirmar Nova Senha"):
                sucesso, msg = resetar_senha_com_codigo(email_recup, codigo, nova_senha)
                if sucesso:
                    st.success(msg)
                    st.session_state.reset_mode = False
                    st.session_state.esperando_codigo = False
                else:
                    st.error(msg)
    
    st.stop() # PARA A EXECUÇÃO AQUI (Não mostra o resto do site)

# 3. SEGUE A LÓGICA NORMAL DO SITE ABAIXO...
if "user" not in st.session_state:
    st.session_state.user = None


st.set_page_config(page_title="Teste de Conexão - Bolão 2026", page_icon="🏆")

st.title("🏆 Teste de Integração: Python + Supabase")

# Inicializa o cliente
supabase = get_supabase_client()

st.subheader("Verificando Tabela de Países")

try:
    # Tenta buscar os países cadastrados
    response = supabase.table("paises").select("*").execute()
    
    if response.data:
        st.success(f"Conexão estabelecida! Encontramos {len(response.data)} países.")
        
        # Transformando em DataFrame para exibir como um cientista de dados
        df = pd.DataFrame(response.data)
        st.dataframe(df, use_container_width=True)
        
    else:
        st.warning("Conexão OK, mas a tabela 'paises' parece estar vazia.")
        st.info("Dica: Use o Table Editor do Supabase para inserir alguns países via CSV.")

except Exception as e:
    st.error("Ocorreu um erro ao tentar ler o banco de dados:")
    st.code(e)

# app.py (Trecho de exemplo)
import streamlit as st
from src.auth import registrar_usuario, logar_usuario

if "user" not in st.session_state:
    st.session_state.user = None

if not st.session_state.user:
    tab1, tab2 = st.tabs(["Login", "Cadastro"])
    
    with tab1:
        with st.form("login_form"):
            email = st.text_input("Email")
            senha = st.text_input("Senha", type="password")
            if st.form_submit_button("Entrar"):
                user = logar_usuario(email, senha)
                if user:
                    st.session_state.user = user
                    st.rerun()
                else:
                    st.error("Email ou senha inválidos.")

    with tab2:
        with st.form("signup_form"):
            novo_nome = st.text_input("Nome Completo")
            novo_email = st.text_input("Seu melhor email")
            nova_senha = st.text_input("Crie uma senha", type="password")
            if st.form_submit_button("Criar Conta"):
                sucesso, msg = registrar_usuario(novo_email, nova_senha, novo_nome)
                if sucesso: st.success(msg)
                else: st.error(msg)
else:
    st.success(f"Bem-vindo de volta!")
    if st.button("Sair"):
        st.session_state.user = None
        st.rerun()

# app.py (dentro da lógica de login)

if "reset_mode" not in st.session_state:
    st.session_state.reset_mode = False

if not st.session_state.user:
    if st.session_state.reset_mode:
        st.subheader("Recuperar Senha")
        with st.form("reset_form"):
            email_reset = st.text_input("Digite seu email cadastrado")
            if st.form_submit_button("Enviar link de recuperação"):
                sucesso, msg = solicitar_recuperacao_senha(email_reset)
                if sucesso: st.success(msg)
                else: st.error(msg)
        
        if st.button("Voltar para o Login"):
            st.session_state.reset_mode = False
            st.rerun()
            
    else:
        tab1, tab2 = st.tabs(["Login", "Cadastro"])
        # ... seu código de login e cadastro existente ...
        
        # Botão discreto abaixo do formulário de login
        if st.button("Esqueci minha senha"):
            st.session_state.reset_mode = True
            st.rerun()

# Rodapé simples
st.divider()
st.caption("Desenvolvido por Tiaguinho - Engenharia de Dados & Bolão")

# app.py (parte logada)
import streamlit as st
from src.database import listar_partidas_com_times, salvar_aposta, buscar_apostas_usuario

def pagina_apostas():
    st.title("🏆 Meus Palpites")
    
    if not st.session_state.get("user"):
        st.error("Você precisa estar logado para apostar.")
        return

    user_id = st.session_state.user.id
    
    # 1. Configuração de Fuso Horário
    fuso_utc = timezone.utc
    fuso_rio = timezone(timedelta(hours=-3))
    agora = datetime.now(fuso_rio)
    
    # Busca dados do banco
    partidas = listar_partidas_com_times() 
    apostas_existentes = buscar_apostas_usuario(user_id)
    
    # Organização dos dados por Grupo e Rodada
    organizado = {}
    for p in partidas:
        g = p.get('grupo', 'Sem Grupo')
        r = p.get('rodada', 0)
        if g not in organizado: organizado[g] = {}
        if r not in organizado[g]: organizado[g][r] = []
        organizado[g][r].append(p)

    formatar_rodada = {1: "1ª Rodada", 2: "2ª Rodada", 3: "3ª Rodada"}

    # --- CORREÇÃO: Criamos a lista ordenada ---
    grupos_ordenados = sorted(organizado.keys())

    # --- O PULO DO GATO: Iteramos sobre a lista ordenada, não sobre o .items() ---
    for grupo in grupos_ordenados:
        rodadas_dict = organizado[grupo]  # Pegamos o conteúdo do grupo pela chave
        
        st.header(f"📂 {grupo}")
        
        # Ordenamos as rodadas (1, 2, 3)
        rodadas_ids_ordenados = sorted(rodadas_dict.keys())
        
        labels_abas = [formatar_rodada.get(r, f"{r}ª Rodada") for r in rodadas_ids_ordenados]
        abas_rodada = st.tabs(labels_abas)
        
        for i, num_rodada in enumerate(rodadas_ids_ordenados):
            jogos = rodadas_dict[num_rodada]
            with abas_rodada[i]:
                for p in jogos:
                    # --- A. CONVERSÃO DE FUSO E CÁLCULO DE TEMPO ---
                    dt_banco = datetime.fromisoformat(p['data_hora'])
                    if dt_banco.tzinfo is None:
                        dt_banco = dt_banco.replace(tzinfo=fuso_utc)
                    
                    horario_jogo = dt_banco.astimezone(fuso_rio)
                    limite_aposta = horario_jogo - timedelta(hours=1)
                    tempo_restante = limite_aposta - agora
                    
                    apostas_abertas = tempo_restante.total_seconds() > 0
                    data_str = horario_jogo.strftime("%d/%m %H:%M")
                    
                    # Definindo as variáveis de status SEMPRE antes de usar
                    if apostas_abertas:
                        dias = tempo_restante.days
                        horas, rem = divmod(tempo_restante.seconds, 3600)
                        minutos, _ = divmod(rem, 60)
                        status_msg = f"⏳ Fecha em: {dias}d {horas:02d}h {minutos:02d}m"
                        cor_status = "blue"
                    else:
                        status_msg = "🚫 Apostas Encerradas"
                        cor_status = "red"

                    # --- B. INTERFACE ---
                    # Data e Contador (Atenção à indentação aqui!)
                    st.markdown(f"📅 `{data_str}` | :{cor_status}[**{status_msg}**]")
                    
                    col_time_a, col_pl_a, col_vs, col_pl_b, col_time_b = st.columns([2, 1, 0.5, 1, 2])
                    
                    val_a, val_b = apostas_existentes.get(p['id'], (0, 0))
                    
                    # Time Esquerda
                    with col_time_a:
                        st.image(p['time_a']['bandeira_url'], width=35)
                        st.write(f"**{p['time_a']['nome']}**")
                    
                    # Placar A
                    with col_pl_a:
                        gols_a = st.number_input(" ", min_value=0, max_value=20, value=val_a, 
                                                key=f"a_{grupo}_{num_rodada}_{p['id']}", 
                                                label_visibility="collapsed", 
                                                disabled=not apostas_abertas)
                    with col_vs:
                        st.markdown("<div style='text-align: center; padding-top: 10px;'>×</div>", unsafe_allow_html=True)
                        
                    # Placar B
                    with col_pl_b:
                        gols_b = st.number_input(" ", min_value=0, max_value=20, value=val_b, 
                                                key=f"b_{grupo}_{num_rodada}_{p['id']}", 
                                                label_visibility="collapsed", 
                                                disabled=not apostas_abertas)
                        
                    # Time Direita (Nome abaixo da Bandeira)
                    with col_time_b:
                        st.image(p['time_b']['bandeira_url'], width=35)
                        st.write(f"**{p['time_b']['nome']}**")
                    
                    # Botão de Confirmação
                    if apostas_abertas:
                        if st.button("Confirmar", key=f"btn_{grupo}_{num_rodada}_{p['id']}"):
                            salvar_aposta(user_id, p['id'], gols_a, gols_b)
                            st.toast("Palpite salvo!")
                    else:
                        st.button("Encerrado", key=f"btn_off_{p['id']}", disabled=True)
                    
                    st.divider()

# No seu app principal, chame:
if st.session_state.user:
    pagina_apostas()