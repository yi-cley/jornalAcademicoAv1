// materia.js — página de uma matéria: materia.html?id=1
const conteudo = document.getElementById('conteudo');
const materia = DB.materia(param('id'));
const usuario = Auth.usuarioAtual();

// Rascunhos só aparecem para editores
const podeVer = materia && (materia.publicada || (usuario && usuario.papel === 'editor'));

if (!podeVer) {
  conteudo.innerHTML = `
    <p class="vazio">Matéria não encontrada. <a href="index.html">Voltar para a capa</a>.</p>`;
} else {
  const aba = DB.aba(materia.aba) || { slug: '', nome: 'Sem aba', cor: '#5b6472' };
  const autor = DB.usuarios().find(u => u.id === materia.autorId);
  document.title = `${materia.titulo} | Folha Acadêmica`;

  conteudo.innerHTML = `
    <article class="materia" style="--cor:${esc(aba.cor)}">
      ${materia.publicada ? '' : '<p class="aviso">Rascunho: só editores veem esta página.</p>'}
      <a class="rotulo-aba" href="regiao.html?aba=${esc(aba.slug)}">${esc(aba.nome)}</a>
      <h1>${esc(materia.titulo)}</h1>
      <p class="materia__resumo">${esc(materia.resumo)}</p>
      <p class="materia__meta">Por ${autor ? esc(autor.nome) : 'Redação'}, ${formatarData(materia.data)}</p>
      ${materia.imagem ? `<img class="materia__img" src="${esc(materia.imagem)}" alt="">` : ''}
      <div class="materia__texto">${paragrafos(materia.conteudo)}</div>
    </article>`;
}
