# app.py
import streamlit as st
from src.database import get_supabase_client
from src.auth import registrar_usuario, logar_usuario, solicitar_recuperacao_senha, atualizar_senha
import pandas as pd

# app.py (logo no início do código)

# O Supabase coloca um token na URL quando o usuário vem do email
# 1. TÉCNICA DE INTERCEPÇÃO: Verificar se o usuário veio do email de recuperação
# O Supabase redireciona com parâmetros na URL
query_params = st.query_params

if "type" in query_params and query_params["type"] == "recovery":
    st.session_state.recovery_mode = True

# 2. SE ESTIVER EM MODO DE RECUPERAÇÃO, MOSTRA APENAS ESSA TELA
if st.session_state.get("recovery_mode", False):
    st.title("🔐 Redefinir sua Senha")
    st.info("Crie uma nova senha forte para acessar seu bolão.")
    
    with st.form("new_password_form"):
        nova_senha = st.text_input("Nova Senha", type="password")
        confirmar_senha = st.text_input("Confirme a Nova Senha", type="password")
        
        if st.form_submit_button("Salvar Nova Senha"):
            if nova_senha == confirmar_senha and len(nova_senha) >= 6:
                sucesso, msg = atualizar_senha(nova_senha)
                if sucesso:
                    st.success("Senha alterada! Agora você pode fazer login.")
                    st.session_state.recovery_mode = False
                    st.query_params.clear() # Limpa a URL
                    st.button("Ir para o Login") # Força o usuário a clicar para atualizar
                else:
                    st.error(f"Erro: {msg}")
            else:
                st.error("As senhas não coincidem ou são muito curtas (mín. 6 caracteres).")
    
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