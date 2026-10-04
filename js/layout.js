// layout.js — cabeçalho, abas e rodapé iguais em todas as páginas.
// Cada página HTML tem <header id="topo"> e <footer id="rodape"> vazios; este script preenche.

function montarLayout() {
  const usuario = Auth.usuarioAtual();
  const pagina = document.body.dataset.pagina;   // vem de <body data-pagina="...">
  const abaAtual = param('aba');
  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  let areaUsuario;
  if (usuario) {
    areaUsuario = `
      <span>Olá, ${esc(usuario.nome)}</span>
      ${usuario.papel === 'editor' ? '<a href="cms.html">Painel</a>' : ''}
      <button type="button" class="link-botao" id="botao-sair">Sair</button>`;
  } else {
    areaUsuario = `<a href="login.html">Entrar</a><a href="cadastro.html">Criar conta</a>`;
  }

  const linksAbas = DB.abas().map(aba => `
    <a href="regiao.html?aba=${esc(aba.slug)}" style="--cor:${esc(aba.cor)}"
       ${abaAtual === aba.slug ? 'aria-current="page"' : ''}>${esc(aba.nome)}</a>`).join('');

  document.getElementById('topo').innerHTML = `
    <div class="faixa-topo">
      <div class="container faixa-topo__linha">
        <span class="data-hoje">${hoje}</span>
        <nav class="usuario" aria-label="Conta">${areaUsuario}</nav>
      </div>
    </div>
    <div class="cabecalho">
      <div class="container cabecalho__linha">
        <a href="index.html" class="marca__logo" aria-label="Folha Acadêmica, ir para a capa">
          <img src="img/icone-180.png" alt="" width="72" height="72">
        </a>
        <div>
          <a href="index.html" class="marca">Folha Acadêmica</a>
          <p class="lema">O jornal da turma de ADS</p>
        </div>
      </div>
    </div>
    <nav class="abas" aria-label="Abas do jornal">
      <div class="container abas__lista">
        <a href="index.html" ${pagina === 'capa' ? 'aria-current="page"' : ''}>Capa</a>
        ${linksAbas}
        <a href="regiao.html" class="abas__todas"
           ${pagina === 'regiao' && !abaAtual ? 'aria-current="page"' : ''}>Região</a>
      </div>
    </nav>`;

  document.getElementById('rodape').innerHTML = `
    <div class="container">
      Folha Acadêmica. Projeto de estudo feito com HTML, CSS e JavaScript puros.
      Os dados ficam salvos apenas neste navegador.
    </div>`;

  const botaoSair = document.getElementById('botao-sair');
  if (botaoSair) {
    botaoSair.addEventListener('click', () => {
      Auth.sair();
      location.href = 'index.html';
    });
  }
}

// Cartão de matéria reutilizado na capa e na região.
// tipo: 'destaque' (grande), 'normal' (com imagem) ou 'compacto' (só texto)
function cartaoMateria(m, tipo = 'normal') {
  const aba = DB.aba(m.aba) || { slug: '', nome: 'Sem aba', cor: '#5b6472' };

  let visual = '';
  if (tipo !== 'compacto') {
    visual = m.imagem
      ? `<img src="${esc(m.imagem)}" alt="">`
      : `<div class="cartao__capa" aria-hidden="true"><span>${esc(aba.nome.charAt(0))}</span></div>`;
  }

  return `
    <article class="cartao cartao--${tipo}" style="--cor:${esc(aba.cor)}">
      ${visual}
      <a class="rotulo-aba" href="regiao.html?aba=${esc(aba.slug)}">${esc(aba.nome)}</a>
      <h2 class="cartao__titulo"><a href="materia.html?id=${m.id}">${esc(m.titulo)}</a></h2>
      <p class="cartao__resumo">${esc(m.resumo)}</p>
      <p class="cartao__meta">${formatarData(m.data)}</p>
    </article>`;
}

montarLayout();
