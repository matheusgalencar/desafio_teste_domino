# Desafio: testes de Dominó

## Colaboradores

- Matheus Goulart de Alencar 24131995-2
- Miguel Falcão Costacurta 24011302-2

## Especificação adotada

Partida para **dois jogadores**, com conjunto duplo seis (28 peças únicas, de `[0,0]` a `[6,6]`), sete peças iniciais para cada um e 14 no monte. Começa quem tiver a maior peça dupla e deve abri-la; se ninguém tiver dupla, começa quem tiver a peça de maior soma, com desempate pelo maior lado. A peça inicial pode ser colocada em qualquer ponta. Nas jogadas seguintes, a peça escolhida deve coincidir com a ponta esquerda ou direita; ela pode ser invertida. O jogador compra do monte enquanto não tiver jogada e houver peças. Sem jogada e sem monte, passa. Vence a rodada quem esvaziar a mão. Se ambos ficarem sem jogada e o monte estiver vazio, a rodada fica bloqueada: vence quem tiver menor soma na mão; empate de soma é empate da rodada. Peças não podem ser duplicadas ou inventadas.

## API implementada em `src/jogo.js`

Exportações CommonJS:

- `criarJogo({ maos, monte, jogadorInicial })`: `maos` contém duas listas de peças `[a,b]`; `monte` é lista de peças. Para partida completa, exigem-se as 28 peças únicas, sete em cada mão e 14 no monte. `jogadorInicial` é opcional e, se omitido, segue a regra de abertura. Retorna estado com `{ maos, monte, mesa, jogadorAtual, passesConsecutivos, status, vencedor }`. `mesa` é lista de peças orientadas da esquerda para a direita; `passesConsecutivos` começa em zero e volta a zero após compra ou jogada; `status` é `em_andamento`, `vitoria` ou `bloqueio`; `vencedor` é `0`, `1` ou `null`.
- `jogar(estado, { jogador, peca, lado })`: `lado` é `esquerda` ou `direita`; retorna estado novo e lança `Error` em jogada ilegal.
- `comprar(estado, jogador)`: compra uma peça do topo do monte (primeiro item), apenas se não houver jogada legal; retorna estado novo.
- `passar(estado, jogador)`: apenas se não houver jogada legal e monte estiver vazio; retorna estado novo.
- `jogadasLegais(estado, jogador)`: retorna lista de opções `{ peca, lado }` (a orientação da peça pode ser determinada pela implementação).

As funções podem mutar ou copiar o estado, desde que retornem o estado atualizado. A sequência e a regra de sorteio não são testadas: os testes injetam distribuição fixa.

## Casos de teste

| ID | Cenário e resultado esperado |
| --- | --- |
| DO01 | Distribuição completa preserva 28 peças únicas, 7/7/14. |
| DO02 | Peça repetida/inválida é recusada. |
| DO03 | Abertura é do maior duplo; colocação inicial estabelece as pontas. |
| DO04 | Jogada na esquerda/direita aceita peça que coincide e inverte quando necessário. |
| DO05 | Jogada sem encaixe, de peça alheia ou fora do turno é recusada. |
| DO06 | Compra obrigatória quando não há encaixe e há monte. |
| DO07 | Passagem só é permitida sem encaixe e com monte vazio. |
| DO08 | Mão vazia encerra a rodada com o jogador vencedor. |
| DO09 | Bloqueio compara somas restantes e admite empate. |

## Como os testes funcionam

`tests/jogo.test.js` executa `src/jogo.js` com uma distribuição determinística das 28 peças e estados específicos para transições difíceis, como bloqueio. A suíte usa `node:test` e `node:assert/strict`; execute `npm test` com Node.js 20+. **Resultado verificado: 9 testes aprovados.**
