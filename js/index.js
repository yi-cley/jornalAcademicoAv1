// index.js — capa: a matéria mais recente em destaque e as outras ao lado
const conteudo = document.getElementById('conteudo');
const publicadas = DB.materias().filter(m => m.publicada);

if (publicadas.length === 0) {
  conteudo.innerHTML = `
    <p class="vazio">Nenhuma matéria publicada ainda.
    Editores podem publicar pelo <a href="cms.html">painel</a>.</p>`;
} else {
  const [destaque, ...outras] = publicadas;
  conteudo.innerHTML = `
    <section class="capa">
      ${cartaoMateria(destaque, 'destaque')}
      <div class="capa__lista">
        ${outras.map(m => cartaoMateria(m, 'compacto')).join('')}
      </div>
    </section>`;
}
