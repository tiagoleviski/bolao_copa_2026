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

def buscar_perfil_usuario(user_id):
    supabase = get_supabase_client()
    res = supabase.table("perfis").select("nome_completo, email").eq("id", user_id).single().execute()
    return res.data

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

_FASES_PREVISAO_ORDEM = [
    'Segunda Fase', 'Oitavas de Final', 'Quartas de Final',
    'Campeão', 'Vice-Campeão', '3º Lugar', '4º Lugar'
]

@st.cache_data(ttl=3600)
def buscar_todos_paises():
    supabase = get_supabase_client()
    res = supabase.table("paises").select("id, nome, bandeira_url").order("nome").execute()
    return res.data

def buscar_todas_previsoes(user_id):
    supabase = get_supabase_client()
    res = supabase.table("previsoes_classificacao").select("pais_id, fase").eq("user_id", str(user_id)).execute()
    resultado = {}
    for r in res.data:
        resultado.setdefault(r['fase'], set()).add(r['pais_id'])
    return resultado

def salvar_previsoes_fase(user_id, pais_ids_novos, fase):
    supabase = get_supabase_client()
    uid = str(user_id)
    atuais = buscar_todas_previsoes(user_id).get(fase, set())
    novos = set(pais_ids_novos)
    adicionados = novos - atuais
    removidos = atuais - novos
    if adicionados:
        supabase.table("previsoes_classificacao").insert([
            {"user_id": uid, "pais_id": pid, "fase": fase} for pid in adicionados
        ]).execute()
    if removidos:
        supabase.table("previsoes_classificacao").delete()\
            .eq("user_id", uid).in_("pais_id", list(removidos)).eq("fase", fase).execute()
        try:
            idx = _FASES_PREVISAO_ORDEM.index(fase)
            fases_sub = _FASES_PREVISAO_ORDEM[idx + 1:]
        except ValueError:
            fases_sub = []
        for f in fases_sub:
            supabase.table("previsoes_classificacao").delete()\
                .eq("user_id", uid).in_("pais_id", list(removidos)).eq("fase", f).execute()

def salvar_posicao_especifica(user_id, pais_id, posicao):
    supabase = get_supabase_client()
    uid = str(user_id)
    supabase.table("previsoes_classificacao").delete().eq("user_id", uid).eq("fase", posicao).execute()
    if pais_id:
        supabase.table("previsoes_classificacao").insert(
            {"user_id": uid, "pais_id": pais_id, "fase": posicao}
        ).execute()

