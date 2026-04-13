# src/database.py
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import streamlit as st

# Carrega as variáveis do arquivo .env
load_dotenv()

@st.cache_resource
def get_supabase_client() -> Client:
    """
    Cria e armazena em cache o cliente do Supabase.
    O uso do @st.cache_resource evita que o Streamlit crie uma nova
    conexão toda vez que a página for recarregada.
    """
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    
    if not url or not key:
        st.error("Erro: SUPABASE_URL ou SUPABASE_KEY não encontradas no arquivo .env")
        st.stop()
        
    return create_client(url, key)