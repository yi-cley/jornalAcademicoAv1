// util.js — funções pequenas usadas em todas as páginas

// Protege contra XSS: transforma < > & " ' em texto comum antes de usar em innerHTML.
// Teste: crie uma matéria com o título <b>oi</b> e veja que aparece como texto, não em negrito.
function esc(texto) {
  const mapa = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(texto ?? '').replace(/[&<>"']/g, c => mapa[c]);
}

// Lê um parâmetro da URL. Ex.: em regiao.html?aba=campus, param('aba') devolve 'campus'
function param(nome) {
  return new URLSearchParams(location.search).get(nome);
}

// '2026-09-24' -> '24 de setembro de 2026'
function formatarData(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

// Data de hoje no formato AAAA-MM-DD (usando o fuso do computador)
function hojeISO() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// Texto com linhas em branco -> vários <p>
function paragrafos(texto) {
  return esc(texto).split(/\n\s*\n/).map(p => `<p>${p}</p>`).join('');
}

// 'Política & Economia' -> 'politica-economia'
function gerarSlug(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
