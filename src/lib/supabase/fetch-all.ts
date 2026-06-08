import "server-only";

/**
 * Busca TODAS as linhas de uma query paginando.
 * O Supabase/PostgREST limita cada select a 1000 linhas por padrão; sem
 * paginação, tabelas grandes (apostas, previsao_grupo) vêm truncadas.
 *
 * Uso:
 *   const linhas = await fetchAllRows((from, to) =>
 *     supabase.from("apostas").select("*").range(from, to),
 *   );
 */
export async function fetchAllRows<T>(
  buildQuery: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<T[]> {
  const pageSize = 1000;
  let from = 0;
  const all: T[] = [];
  for (;;) {
    const { data } = await buildQuery(from, from + pageSize - 1);
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}
