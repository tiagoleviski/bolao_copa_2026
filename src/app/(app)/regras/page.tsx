export default function RegrasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-white">REGRAS</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Como funciona o bolao, as modalidades de aposta e a pontuacao
        </p>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-2xl text-white">Palpites nos Jogos</h2>
        <p className="text-sm text-muted-foreground">
          Palpite no placar de cada partida da Copa. O palpite fecha no horario
          de inicio da partida.
        </p>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">Pontuacao</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              <span className="text-green-400 font-semibold">2 pts</span> —
              Placar exato
            </li>
            <li>
              <span className="text-yellow-400 font-semibold">1 pt</span> —
              Resultado correto (vitoria, empate ou derrota)
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
            <span className="text-yellow-400">1 pt</span> (acertou vitoria do
            Brasil). Quem palpitou <span className="text-white">0x2</span> ganha{" "}
            <span className="text-red-400">0 pts</span>.
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-2xl text-white">Artilheiro</h2>
        <p className="text-sm text-muted-foreground">
          Escolha o jogador que sera o artilheiro da Copa. A aposta deve ser
          feita antes do primeiro jogo, em 11/06/2026 as 16h (horario de
          Brasilia).
        </p>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">Pontuacao</h3>
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
            Voce apostou em Mbappe e ele terminou como artilheiro da Copa. Voce
            ganha <span className="text-green-400">20 pts</span>.
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-2xl text-white">Fase de Grupos</h2>
        <p className="text-sm text-muted-foreground">
          Preveja a classificacao de cada grupo (1o, 2o, 3o e 4o lugar). A
          previsao deve ser feita antes do primeiro jogo, em 11/06/2026 as 16h
          (horario de Brasilia).
        </p>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">Pontuacao</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              <span className="text-green-400 font-semibold">2 pts</span> —
              Posicao exata no grupo
            </li>
            <li>
              <span className="text-yellow-400 font-semibold">1 pt</span> — Time
              classificou, mas em posicao diferente da prevista
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">Exemplo</h3>
          <p className="text-sm text-muted-foreground">
            No grupo A, voce previu Argentina em 1o e ela ficou em 1o:{" "}
            <span className="text-green-400">2 pts</span>. Previu Marrocos em
            2o, mas ficou em 3o e avancou:{" "}
            <span className="text-yellow-400">1 pt</span>. A pontuacao e por
            selecao, entao quanto mais acertos em todos os 12 grupos, mais
            pontos.
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-2xl text-white">Podio</h2>
        <p className="text-sm text-muted-foreground">
          Aposte nas tres selecoes que terminam no podio (1o, 2o e 3o lugar). A
          aposta deve ser feita antes do primeiro jogo, em 11/06/2026 as 16h
          (horario de Brasilia).
        </p>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">Pontuacao</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              <span className="text-green-400 font-semibold">60 pts</span> —
              Podio perfeito (3 posicoes exatas)
            </li>
            <li>
              <span className="text-yellow-400 font-semibold">30 pts</span> —
              Acertou o campeao
            </li>
            <li>
              <span className="text-blue-400 font-semibold">10 pts</span> — Time
              esta no podio, mas na posicao errada (por selecao)
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">Exemplo</h3>
          <p className="text-sm text-muted-foreground">
            Podio oficial: 1o Brasil, 2o Franca, 3o Argentina. Voce apostou 1o
            Brasil, 2o Argentina, 3o Inglaterra. Resultado:{" "}
            <span className="text-yellow-400">30 pts</span> (campeao exato) +{" "}
            <span className="text-blue-400">10 pts</span> (Argentina no podio,
            posicao errada) ={" "}
            <span className="text-white font-semibold">40 pts</span>.
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-2xl text-white">
          Ranking e Premiacao
        </h2>
        <p className="text-sm text-muted-foreground">
          O ranking e calculado pela soma dos pontos de todas as quatro
          modalidades: palpites nos jogos, artilheiro, fase de grupos e podio.
        </p>
        <p className="text-sm text-muted-foreground">
          Os <span className="text-white font-semibold">tres primeiros</span> no
          ranking final terao premiacao.
        </p>
      </div>
    </div>
  );
}
