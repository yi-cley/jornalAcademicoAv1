// regiao.js — a Região organiza e documenta as abas do jornal.
// Sem parâmetro: lista todas as abas com descrição e quantidade de matérias.
// Com ?aba=slug: mostra a aba escolhida e as matérias dela.
const conteudo = document.getElementById('conteudo');
const slug = param('aba');
const publicadas = DB.materias().filter(m => m.publicada);

if (slug) {
  const aba = DB.aba(slug);

  if (!aba) {
    conteudo.innerHTML = `
      <p class="vazio">A aba "${esc(slug)}" não existe.
      <a href="regiao.html">Ver todas as abas</a>.</p>`;
  } else {
    document.title = `${aba.nome} | Folha Acadêmica`;
    const lista = publicadas.filter(m => m.aba === slug);
    conteudo.innerHTML = `
      <header class="cabecalho-aba" style="--cor:${esc(aba.cor)}">
        <h1>${esc(aba.nome)}</h1>
        <p>${esc(aba.descricao)}</p>
      </header>
      ${lista.length
        ? `<div class="grade">${lista.map(m => cartaoMateria(m)).join('')}</div>`
        : `<p class="vazio">Esta aba ainda não tem matérias publicadas.</p>`}`;
  }
} else {
  const blocos = DB.abas().map(aba => {
    const qtd = publicadas.filter(m => m.aba === aba.slug).length;
    return `
      <section class="regiao__aba" style="--cor:${esc(aba.cor)}">
        <h2><a href="regiao.html?aba=${esc(aba.slug)}">${esc(aba.nome)}</a></h2>
        <p>${esc(aba.descricao)}</p>
        <p class="regiao__qtd">${qtd} ${qtd === 1 ? 'matéria publicada' : 'matérias publicadas'}</p>
      </section>`;
  }).join('');

  conteudo.innerHTML = `
    <header class="cabecalho-pagina">
      <h1>Região</h1>
      <p>Todas as abas do jornal, o que cada uma cobre e quantas matérias tem.</p>
    </header>
    <div class="regiao">${blocos || '<p class="vazio">Nenhuma aba criada ainda.</p>'}</div>`;
}
