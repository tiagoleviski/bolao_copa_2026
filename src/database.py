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
    url = st.secrets.get("SUPABASE_URL") or os.getenv("SUPABASE_URL")
    key = st.secrets.get("SUPABASE_KEY") or os.getenv("SUPABASE_KEY")

    if not url or not key:
        st.error("Erro: SUPABASE_URL ou SUPABASE_KEY não configuradas.")
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

# src/database.py

def salvar_aposta(user_id, partida_id, gols_a, gols_b):
    supabase = get_supabase_client()
    
    data = {
        "user_id": user_id,
        "partida_id": partida_id,
        "gols_time_a": gols_a,
        "gols_time_b": gols_b
    }
    
    try:
        # O segredo está no parâmetro on_conflict
        # Ele deve listar as colunas que compõem a sua UNIQUE CONSTRAINT
        supabase.table("apostas").upsert(
            data, 
            on_conflict="user_id,partida_id"
        ).execute()
        return True
    except Exception as e:
        print(f"Erro ao salvar: {e}")
        return False

def buscar_apostas_usuario(user_id):
    supabase = get_supabase_client()
    res = supabase.table("apostas").select("*").eq("user_id", user_id).execute()
    # Retorna um dicionário {partida_id: (gols_a, gols_b)} para busca rápida
    return {a['partida_id']: (a['gols_time_a'], a['gols_time_b']) for a in res.data}

# src/database.py - Adicione esta função primeiro
def atualizar_resultado_real(partida_id, gols_a, gols_b):
    supabase = get_supabase_client()
    supabase.table("partidas").update({
        "gols_a": gols_a,
        "gols_b": gols_b,
        "status": "Finalizado"
    }).eq("id", partida_id).execute()

