export default function RegrasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-white">REGRAS</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Como funciona o bolão, as modalidades de aposta e a pontuação
        </p>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-2xl text-white">Palpites nos Jogos</h2>
        <p className="text-sm text-muted-foreground">
          Palpite no placar de cada partida da Copa. O palpite fecha no horário
          de início da partida.
        </p>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">Pontuação</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              <span className="text-green-400 font-semibold">2 pts</span> —
              Placar exato
            </li>
            <li>
              <span className="text-yellow-400 font-semibold">1 pt</span> —
              Resultado correto (vitória, empate ou derrota)
            </li>
            <li>
              <span className="text-red-400 font-semibold">0 pts</span> —
              Resultado errado
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">Exemplo</h3>
          <p className="text-sm text-muted-foreground">
            O jogo terminou Brasil 2x1 Alemanha. Quem palpitou{" "}
            <span className="text-white">2x1</span> ganha{" "}
            <span className="text-green-400">2 pts</span> (placar exato). Quem
            palpitou <span className="text-white">1x0</span> ganha{" "}
            <span className="text-yellow-400">1 pt</span> (acertou vitória do
            Brasil). Quem palpitou <span className="text-white">0x2</span> ganha{" "}
            <span className="text-red-400">0 pts</span>.
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-2xl text-white">Artilheiro</h2>
        <p className="text-sm text-muted-foreground">
          Escolha o jogador que será o artilheiro da Copa. A aposta deve ser
          feita antes do primeiro jogo, em 11/06/2026 às 16h (horário de
          Brasília).
        </p>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">Pontuação</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              <span className="text-green-400 font-semibold">20 pts</span> —
              Acertou o artilheiro
            </li>
            <li>
              <span className="text-red-400 font-semibold">0 pts</span> — Errou
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">Exemplo</h3>
          <p className="text-sm text-muted-foreground">
            Você apostou em Mbappé e ele terminou como artilheiro da Copa. Você
            ganha <span className="text-green-400">20 pts</span>.
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-2xl text-white">Fase de Grupos</h2>
        <p className="text-sm text-muted-foreground">
          Preveja a classificação de cada grupo (1º, 2º, 3º e 4º lugar). A
          previsão deve ser feita antes do primeiro jogo, em 11/06/2026 às 16h
          (horário de Brasília).
        </p>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">Pontuação</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              <span className="text-green-400 font-semibold">2 pts</span> —
              Posição exata no grupo
            </li>
            <li>
              <span className="text-yellow-400 font-semibold">1 pt</span> — Time
              classificou, mas em posição diferente da prevista
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">Exemplo</h3>
          <p className="text-sm text-muted-foreground">
            No grupo A, você previu México em 1º e ele ficou em 1º:{" "}
            <span className="text-green-400">2 pts</span>. Previu Coreia do Sul
            em 2º, mas ficou em 3º e avançou:{" "}
            <span className="text-yellow-400">1 pt</span>. A pontuação é por
            seleção, então quanto mais acertos em todos os 12 grupos, mais
            pontos.
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-2xl text-white">Pódio</h2>
        <p className="text-sm text-muted-foreground">
          Aposte nas três seleções que terminam no pódio (1º, 2º e 3º lugar). A
          aposta deve ser feita antes do primeiro jogo, em 11/06/2026 às 16h
          (horário de Brasília).
        </p>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">Pontuação</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              <span className="text-green-400 font-semibold">60 pts</span> —
              Pódio perfeito (3 posições exatas)
            </li>
            <li>
              <span className="text-yellow-400 font-semibold">30 pts</span> —
              Acertou o campeão
            </li>
            <li>
              <span className="text-cyan-400 font-semibold">20 pts</span> —
              Acertou o vice-campeão
            </li>
            <li>
              <span className="text-orange-400 font-semibold">10 pts</span> —
              Acertou o terceiro lugar
            </li>
            <li>
              <span className="text-blue-400 font-semibold">5 pts</span> — Time
              está no pódio, mas na posição errada (por seleção)
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">Exemplo</h3>
          <p className="text-sm text-muted-foreground">
            Pódio oficial: 1º Brasil, 2º França, 3º Argentina. Você apostou 1º
            Brasil, 2º Argentina, 3º Inglaterra. Resultado:{" "}
            <span className="text-yellow-400">30 pts</span> (campeão exato) +{" "}
            <span className="text-blue-400">5 pts</span> (Argentina no pódio,
            posição errada) ={" "}
            <span className="text-white font-semibold">35 pts</span>.
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-2xl text-white">
          Ranking e Premiação
        </h2>
        <p className="text-sm text-muted-foreground">
          O ranking é calculado pela soma dos pontos de todas as quatro
          modalidades: palpites nos jogos, artilheiro, fase de grupos e pódio.
        </p>
        <p className="text-sm text-muted-foreground">
          Os <span className="text-white font-semibold">três primeiros</span> no
          ranking final terão premiação.
        </p>
      </div>
    </div>
  );
}
