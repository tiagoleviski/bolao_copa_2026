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
        # Aqui está o segredo: incluímos o ?type=recovery dentro da URL de redirecionamento
        # O Supabase vai anexar o token dele DEPOIS disso.
        url_retorno = "http://localhost:8501/?type=recovery"
        
        supabase.auth.reset_password_for_email(
            email, 
            options={"redirect_to": url_retorno}
        )
        return True, "Email enviado! Verifique sua caixa de entrada."
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

def resetar_senha_com_codigo(email, codigo, nova_senha):
    supabase = get_supabase_client()
    try:
        # 1. Verifica o código (OTP). Isso cria a "Session" que estava faltando!
        supabase.auth.verify_otp({
            "email": email,
            "token": codigo,
            "type": "recovery"
        })
        
        # 2. Agora que a sessão existe, atualizamos a senha
        supabase.auth.update_user({"password": nova_senha})
        return True, "Senha atualizada com sucesso!"
    except Exception as e:
        return False, f"Erro: {str(e)}"