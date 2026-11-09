const test = require('node:test');
const assert = require('node:assert/strict');
const { criarJogo, jogar, comprar, passar, jogadasLegais } = require('../src/jogo.js');

const baralho = () => { const pecas = []; for (let a = 0; a <= 6; a++) for (let b = a; b <= 6; b++) pecas.push([a,b]); return pecas; };
const distribuicao = () => {
  const pecas = baralho().filter(p => !(p[0] === 6 && p[1] === 6));
  return { maos: [[[6,6], ...pecas.slice(0,6)], pecas.slice(6,13)], monte: pecas.slice(13) };
};
const estado = (maos, monte, mesa, jogadorAtual = 0) => ({ maos, monte, mesa, jogadorAtual, passesConsecutivos: 0, status: 'em_andamento', vencedor: null });

test('DO01: distribuição completa tem 28 peças únicas e mãos 7/7/14', () => {
  const jogo = criarJogo(distribuicao());
  assert.deepEqual(jogo.maos.map(m => m.length), [7,7]);
  assert.equal(jogo.monte.length, 14);
  const todas = [...jogo.maos.flat(), ...jogo.monte].map(p => [...p].sort().join('-'));
  assert.equal(new Set(todas).size, 28);
});

test('DO02: peça repetida e valor fora de 0..6 são recusados', () => {
  const d = distribuicao(); d.monte[0] = [...d.maos[0][0]];
  assert.throws(() => criarJogo(d));
  const e = distribuicao(); e.monte[0] = [7,7];
  assert.throws(() => criarJogo(e));
});

test('DO03: maior dupla abre com 6-6', () => {
  let jogo = criarJogo(distribuicao());
  assert.equal(jogo.jogadorAtual, 0);
  assert.deepEqual(jogadasLegais(jogo, 0), [{ peca: [6,6], lado: 'esquerda' }]);
  assert.throws(() => jogar(jogo, { jogador: 0, peca: [0,0], lado: 'esquerda' }));
  jogo = jogar(jogo, { jogador: 0, peca: [6,6], lado: 'esquerda' });
  assert.deepEqual(jogo.mesa, [[6,6]]);
  assert.equal(jogo.jogadorAtual, 1);
});

test('DO04: encaixe em ambas as pontas permite orientação', () => {
  const esquerda = jogar(estado([[[3,1],[0,0]], [[4,4]]], [], [[1,2]]), { jogador: 0, peca: [3,1], lado: 'esquerda' });
  assert.deepEqual(esquerda.mesa, [[3,1],[1,2]]);
  const direita = jogar(estado([[[3,2],[0,0]], [[4,4]]], [], [[1,2]]), { jogador: 0, peca: [3,2], lado: 'direita' });
  assert.deepEqual(direita.mesa, [[1,2],[2,3]]);
});

test('DO05: jogada sem encaixe, peça alheia e turno errado falham', () => {
  const jogo = estado([[[3,4]], [[1,2]]], [], [[5,5]]);
  assert.throws(() => jogar(jogo, { jogador: 0, peca: [3,4], lado: 'direita' }));
  assert.throws(() => jogar(jogo, { jogador: 0, peca: [1,2], lado: 'direita' }));
  assert.throws(() => jogar(jogo, { jogador: 1, peca: [1,2], lado: 'direita' }));
});

test('DO06: compra quando não há encaixe e há monte', () => {
  const jogo = estado([[[1,2]], [[5,5]]], [[3,4],[5,0]], [[6,6]]);
  assert.deepEqual(jogadasLegais(jogo, 0), []);
  const novo = comprar(jogo, 0);
  assert.deepEqual(novo.maos[0].at(-1), [3,4]);
  assert.equal(novo.monte.length, 1);
  assert.equal(novo.jogadorAtual, 0);
  assert.throws(() => passar(jogo, 0));
});

test('DO07: passagem exige falta de encaixe e monte vazio', () => {
  const jogo = estado([[[1,2]], [[3,4]]], [], [[6,6]]);
  assert.equal(passar(jogo, 0).jogadorAtual, 1);
  assert.throws(() => passar(estado([[[6,2]], [[3,4]]], [], [[6,6]]), 0));
});

test('DO08: esvaziar mão encerra a rodada', () => {
  const jogo = jogar(estado([[[6,2]], [[3,4]]], [], [[6,6]]), { jogador: 0, peca: [6,2], lado: 'direita' });
  assert.equal(jogo.status, 'vitoria');
  assert.equal(jogo.vencedor, 0);
});

test('DO09: bloqueio compara soma e aceita empate', () => {
  let jogo = passar(estado([[[1,2]], [[3,4]]], [], [[6,6]]), 0);
  jogo = passar(jogo, 1);
  assert.equal(jogo.status, 'bloqueio');
  assert.equal(jogo.vencedor, 0);
  let empate = passar(estado([[[1,2]], [[0,3]]], [], [[6,6]]), 0);
  empate = passar(empate, 1);
  assert.equal(empate.status, 'bloqueio');
  assert.equal(empate.vencedor, null);
});
