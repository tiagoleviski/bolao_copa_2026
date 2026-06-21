"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { Partida, Pais } from "@/lib/types";

interface Perfil {
  id: string;
  nome_completo: string;
  email: string;
  role: string;
}

export function useAdminPartidas() {
  return useQuery({
    queryKey: ["admin", "partidas"],
    queryFn: () =>
      apiClient.get<Partida[]>("/admin/partidas").then((r) => r.data),
  });
}

export function useAtualizarResultado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      partidaId: number;
      golsA: number;
      golsB: number;
    }) =>
      apiClient.post(`/admin/partidas/${payload.partidaId}/resultado`, {
        golsA: payload.golsA,
        golsB: payload.golsB,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "partidas"] });
      qc.invalidateQueries({ queryKey: ["ranking"] });
    },
  });
}

export function useAdminPaises() {
  return useQuery({
    queryKey: ["admin", "paises"],
    queryFn: () => apiClient.get<Pais[]>("/admin/paises").then((r) => r.data),
  });
}

export function useAtualizarTimes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      partidaId: number;
      timeAId: number | null;
      timeBId: number | null;
    }) =>
      apiClient.patch(`/admin/partidas/${payload.partidaId}/times`, {
        timeAId: payload.timeAId,
        timeBId: payload.timeBId,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "partidas"] });
      qc.invalidateQueries({ queryKey: ["grupos"] });
    },
  });
}

export function useAdminUsuarios() {
  return useQuery({
    queryKey: ["admin", "usuarios"],
    queryFn: () =>
      apiClient.get<Perfil[]>("/admin/usuarios").then((r) => r.data),
  });
}

export function useConvidarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { email: string }) =>
      apiClient.post("/admin/convidar", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "usuarios"] }),
  });
}

export function useAlterarRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { userId: string; role: "admin" | "user" }) =>
      apiClient.post(`/admin/usuarios/${payload.userId}/role`, {
        role: payload.role,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "usuarios"] }),
  });
}

export function useDeletarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      apiClient.delete(`/admin/usuarios/${userId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "usuarios"] }),
  });
}

export function useSyncResultados() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post("/admin/sync-resultados", {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "partidas"] });
      qc.invalidateQueries({ queryKey: ["grupos"] });
      qc.invalidateQueries({ queryKey: ["ranking"] });
    },
  });
}
