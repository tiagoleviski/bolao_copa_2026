# app.py
import streamlit as st
from src.database import get_supabase_client
from src.auth import registrar_usuario, logar_usuario, solicitar_recuperacao_senha, atualizar_senha, resetar_senha_com_codigo
import pandas as pd

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