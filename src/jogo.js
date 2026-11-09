const id = p => [...p].sort((a, b) => a - b).join('-');
const validaPeca = p => Array.isArray(p) && p.length === 2 && p.every(x => Number.isInteger(x) && x >= 0 && x <= 6);
const igual = (a, b) => id(a) === id(b);
const pontuacao = p => [p[0] === p[1] ? 1 : 0, p[0] === p[1] ? p[0] : p[0] + p[1], Math.max(...p)];
const comparar = (a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; };

function criarJogo({ maos, monte, jogadorInicial } = {}) {
  if (!Array.isArray(maos) || maos.length !== 2 || maos.some(m => !Array.isArray(m) || m.length !== 7) || !Array.isArray(monte) || monte.length !== 14) throw new RangeError('Distribuição deve conter 7/7/14 peças');
  const todas = [...maos[0], ...maos[1], ...monte];
  if (todas.some(p => !validaPeca(p)) || new Set(todas.map(id)).size !== 28) throw new RangeError('Peças inválidas ou repetidas');
  if (jogadorInicial === undefined) {
    const melhor = maos.map(m => m.map(pontuacao).reduce((a, b) => comparar(a, b) >= 0 ? a : b));
    jogadorInicial = comparar(melhor[1], melhor[0]) > 0 ? 1 : 0;
  }
  if (![0,1].includes(jogadorInicial)) throw new RangeError('Jogador inicial inválido');
  const pecaAbertura = maos[jogadorInicial].reduce((a, b) => comparar(pontuacao(a), pontuacao(b)) >= 0 ? a : b);
  return { maos: maos.map(m => m.map(p => [...p])), monte: monte.map(p => [...p]), mesa: [], jogadorAtual: jogadorInicial, pecaAbertura: [...pecaAbertura], passesConsecutivos: 0, status: 'em_andamento', vencedor: null };
}

function jogadasLegais(jogo, jogador) {
  if (jogo.status !== 'em_andamento') return [];
  const mao = jogo.maos[jogador] || [];
  if (!jogo.mesa.length) return mao.filter(peca => !jogo.pecaAbertura || igual(peca, jogo.pecaAbertura)).map(peca => ({ peca: [...peca], lado: 'esquerda' }));
  const esquerda = jogo.mesa[0][0], direita = jogo.mesa.at(-1)[1], opcoes = [];
  for (const peca of mao) {
    if (peca.includes(esquerda)) opcoes.push({ peca: [...peca], lado: 'esquerda' });
    if (peca.includes(direita)) opcoes.push({ peca: [...peca], lado: 'direita' });
  }
  return opcoes;
}

function verificarTurno(jogo, jogador) { if (jogo.status !== 'em_andamento' || jogo.jogadorAtual !== jogador) throw new Error('Jogada fora do turno ou rodada encerrada'); }

function jogar(jogo, { jogador, peca, lado }) {
  verificarTurno(jogo, jogador);
  if (!validaPeca(peca) || !['esquerda','direita'].includes(lado)) throw new Error('Jogada inválida');
  const indice = jogo.maos[jogador].findIndex(p => igual(p, peca));
  if (indice < 0 || !jogadasLegais(jogo, jogador).some(x => igual(x.peca, peca) && x.lado === lado)) throw new Error('Peça indisponível ou sem encaixe');
  const orientada = [...jogo.maos[jogador][indice]];
  if (jogo.mesa.length) {
    if (lado === 'esquerda') { if (orientada[1] !== jogo.mesa[0][0]) orientada.reverse(); jogo.mesa.unshift(orientada); }
    else { if (orientada[0] !== jogo.mesa.at(-1)[1]) orientada.reverse(); jogo.mesa.push(orientada); }
  } else jogo.mesa.push(orientada);
  jogo.maos[jogador].splice(indice, 1);
  jogo.passesConsecutivos = 0;
  if (!jogo.maos[jogador].length) { jogo.status = 'vitoria'; jogo.vencedor = jogador; }
  else jogo.jogadorAtual = 1 - jogador;
  return jogo;
}

function comprar(jogo, jogador) {
  verificarTurno(jogo, jogador);
  if (jogadasLegais(jogo, jogador).length || !jogo.monte.length) throw new Error('Compra não permitida');
  jogo.maos[jogador].push(jogo.monte.shift());
  jogo.passesConsecutivos = 0;
  return jogo;
}

function passar(jogo, jogador) {
  verificarTurno(jogo, jogador);
  if (jogo.monte.length || jogadasLegais(jogo, jogador).length) throw new Error('Passagem não permitida');
  jogo.passesConsecutivos++;
  if (jogo.passesConsecutivos >= 2) {
    jogo.status = 'bloqueio';
    const somas = jogo.maos.map(m => m.reduce((s, p) => s + p[0] + p[1], 0));
    jogo.vencedor = somas[0] === somas[1] ? null : somas[0] < somas[1] ? 0 : 1;
  } else jogo.jogadorAtual = 1 - jogador;
  return jogo;
}

module.exports = { criarJogo, jogar, comprar, passar, jogadasLegais };
