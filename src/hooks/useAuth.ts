"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import apiClient from "@/lib/api/client";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const router = useRouter();
  return useMutation({
    mutationFn: async (payload: { email: string; senha: string }) => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: payload.email,
        password: payload.senha,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      router.push("/palpites");
      router.refresh();
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (email: string) =>
      apiClient.post("/auth/recuperar-senha", { email }),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: async (payload: { email: string; token: string }) => {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email: payload.email,
        token: payload.token,
        type: "recovery",
      });
      if (error) throw error;
    },
  });
}

export function useSetPassword() {
  return useMutation({
    mutationFn: async (payload: { nome: string; senha: string }) => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.updateUser({
        password: payload.senha,
        data: { nome_completo: payload.nome },
      });
      if (error) throw error;

      if (data.user && payload.nome) {
        await supabase
          .from("perfis")
          .update({ nome_completo: payload.nome })
          .eq("id", data.user.id);
      }

      return data;
    },
  });
}

export function useHandleInvite() {
  const router = useRouter();
  return useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);

      const hashError = params.get("error");
      const errorCode = params.get("error_code");
      if (hashError) {
        const err = new Error(errorCode || hashError);
        (err as any).code = errorCode;
        throw err;
      }

      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (!error) return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) return;

      throw new Error("auth_callback_error");
    },
    onSuccess: () => router.replace("/auth/nova-senha"),
  });
}
