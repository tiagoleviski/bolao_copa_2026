CREATE POLICY "Users can delete their own aposta_artilheiro"
  ON apostas_artilheiro
  FOR DELETE
  USING (auth.uid() = user_id);
