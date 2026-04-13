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

# src/database.py

def listar_partidas_com_times():
    supabase = get_supabase_client()
    # Busca partidas trazendo os dados dos times (nome e bandeira) via Join
    res = supabase.table("partidas").select(
        "*, time_a:time_a_id(nome, bandeira_url), time_b:time_b_id(nome, bandeira_url)"
    ).order("data_hora").execute()
    return res.data

def salvar_aposta(user_id, partida_id, gols_a, gols_b):
    supabase = get_supabase_client()
    data = {
        "user_id": user_id,
        "partida_id": partida_id,
        "gols_time_a": gols_a,
        "gols_time_b": gols_b
    }
    # upsert: insere novo ou atualiza se já existir (baseado no unique constraint)
    supabase.table("apostas").upsert(data).execute()

def buscar_apostas_usuario(user_id):
    supabase = get_supabase_client()
    res = supabase.table("apostas").select("*").eq("user_id", user_id).execute()
    # Retorna um dicionário {partida_id: (gols_a, gols_b)} para busca rápida
    return {a['partida_id']: (a['gols_time_a'], a['gols_time_b']) for a in res.data}