# src/auth.py
from src.database import get_supabase_client

def registrar_usuario(email, password, nome):
    supabase = get_supabase_client()
    try:
        # Cria o usuário no sistema de autenticação do Supabase
        auth_resp = supabase.auth.sign_up({
            "email": email,
            "password": password,
        })
        
        # Se o cadastro no Auth foi bem-sucedido, salvamos o nome na nossa tabela 'perfis'
        if auth_resp.user:
            supabase.table("perfis").insert({
                "id": auth_resp.user.id, # O UUID gerado pelo Supabase
                "nome_completo": nome
            }).execute()
            return True, "Conta criada! Verifique seu email para confirmar."
    except Exception as e:
        return False, str(e)

def logar_usuario(email, password):
    supabase = get_supabase_client()
    try:
        resp = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        return resp.user # Retorna o objeto do usuário logado
    except Exception:
        return None

# src/auth.py

def solicitar_recuperacao_senha(email):
    supabase = get_supabase_client()
    try:
        # O Supabase envia um email com um link de retorno para o seu site
        # Importante: Se estiver rodando local, o link de retorno deve ser o localhost
        supabase.auth.reset_password_for_email(email)
        return True, "Email de recuperação enviado!"
    except Exception as e:
        return False, str(e)

# src/auth.py

def verificar_codigo_e_logar(email, token):
    supabase = get_supabase_client()
    try:
        # Verifica o código de 6 dígitos enviado por e-mail
        res = supabase.auth.verify_otp({
            "email": email,
            "token": token,
            "type": "recovery"
        })
        return res.user
    except Exception as e:
        return None

def atualizar_senha(nova_senha):
    supabase = get_supabase_client()
    try:
        # Uma vez validado o código, o usuário está em uma sessão temporária
        # e pode atualizar a própria senha
        supabase.auth.update_user({"password": nova_senha})
        return True, "Senha atualizada!"
    except Exception as e:
        return False, str(e)