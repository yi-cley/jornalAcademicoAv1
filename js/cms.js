// cms.js — painel de edição: matérias, abas e usuários
const editor = Auth.exigirEditor();

const formMateria = document.getElementById('form-materia');
const formAba = document.getElementById('form-aba');
const tituloFormMateria = document.getElementById('titulo-form-materia');
const tituloFormAba = document.getElementById('titulo-form-aba');
const cancelarMateria = document.getElementById('cancelar-materia');
const cancelarAba = document.getElementById('cancelar-aba');
const avisoCms = document.getElementById('aviso-cms');

// Mensagem rápida no canto da tela
function avisar(texto) {
  avisoCms.textContent = texto;
  clearTimeout(avisar.timer);
  avisar.timer = setTimeout(() => { avisoCms.textContent = ''; }, 3000);
}

/* ---------------- MATÉRIAS ---------------- */

function preencherSelectAbas() {
  formMateria.aba.innerHTML = DB.abas()
    .map(a => `<option value="${esc(a.slug)}">${esc(a.nome)}</option>`).join('');
}

function listarMaterias() {
  const corpo = document.getElementById('lista-materias');
  const materias = DB.materias();

  if (materias.length === 0) {
    corpo.innerHTML = '<tr><td colspan="4">Nenhuma matéria ainda. Use o formulário para criar a primeira.</td></tr>';
    return;
  }

  corpo.innerHTML = materias.map(m => {
    const aba = DB.aba(m.aba);
    return `
      <tr>
        <td><a href="materia.html?id=${m.id}">${esc(m.titulo)}</a><br>
            <small>${formatarData(m.data)}</small></td>
        <td>${aba ? esc(aba.nome) : 'Sem aba'}</td>
        <td>${m.publicada
          ? '<span class="selo">Publicada</span>'
          : '<span class="selo selo--rascunho">Rascunho</span>'}</td>
        <td class="tabela__acoes">
          <button type="button" data-editar="${m.id}">Editar</button>
          <button type="button" data-excluir="${m.id}">Excluir</button>
        </td>
      </tr>`;
  }).join('');
}

function limparFormMateria() {
  formMateria.reset();
  formMateria.materiaId.value = '';
  tituloFormMateria.textContent = 'Nova matéria';
  cancelarMateria.hidden = true;
}

function editarMateria(id) {
  const m = DB.materia(id);
  formMateria.materiaId.value = m.id;
  formMateria.titulo.value = m.titulo;
  formMateria.aba.value = m.aba;
  formMateria.resumo.value = m.resumo;
  formMateria.conteudo.value = m.conteudo;
  formMateria.imagem.value = m.imagem;
  formMateria.publicada.checked = m.publicada;
  tituloFormMateria.textContent = 'Editando matéria';
  cancelarMateria.hidden = false;
  formMateria.titulo.focus();
}

formMateria.addEventListener('submit', evento => {
  evento.preventDefault();
  const materias = DB.ler('materias');
  const dados = {
    titulo: formMateria.titulo.value.trim(),
    aba: formMateria.aba.value,
    resumo: formMateria.resumo.value.trim(),
    conteudo: formMateria.conteudo.value.trim(),
    imagem: formMateria.imagem.value.trim(),
    publicada: formMateria.publicada.checked
  };

  const id = Number(formMateria.materiaId.value);
  if (id) {
    // Editando: mantém id, autor e data, troca o resto
    const i = materias.findIndex(m => m.id === id);
    materias[i] = { ...materias[i], ...dados };
  } else {
    materias.push({ id: DB.novoId(materias), autorId: editor.id, data: hojeISO(), ...dados });
  }

  DB.salvar('materias', materias);
  limparFormMateria();
  listarMaterias();
  listarAbas();   // a contagem de matérias por aba muda
  avisar(id ? 'Matéria atualizada.' : 'Matéria criada.');
});

cancelarMateria.addEventListener('click', limparFormMateria);

// Um único ouvinte na tabela inteira (delegação de eventos)
document.getElementById('lista-materias').addEventListener('click', evento => {
  const { editar, excluir } = evento.target.dataset;
  if (editar) editarMateria(Number(editar));
  if (excluir && confirm('Excluir esta matéria? Não dá para desfazer.')) {
    DB.salvar('materias', DB.ler('materias').filter(m => m.id !== Number(excluir)));
    listarMaterias();
    listarAbas();
    avisar('Matéria excluída.');
  }
});

/* ---------------- ABAS ---------------- */

function listarAbas() {
  const materias = DB.ler('materias');
  const corpo = document.getElementById('lista-abas');
  const abas = DB.abas();

  if (abas.length === 0) {
    corpo.innerHTML = '<tr><td colspan="3">Nenhuma aba ainda. Crie uma para poder publicar matérias.</td></tr>';
    return;
  }

  corpo.innerHTML = abas.map(a => {
    const qtd = materias.filter(m => m.aba === a.slug).length;
    return `
      <tr>
        <td><span class="cor-aba" style="--cor:${esc(a.cor)}"></span>${esc(a.nome)}<br>
            <small>${esc(a.descricao)}</small></td>
        <td>${qtd}</td>
        <td class="tabela__acoes">
          <button type="button" data-editar="${esc(a.slug)}">Editar</button>
          <button type="button" data-excluir="${esc(a.slug)}">Excluir</button>
        </td>
      </tr>`;
  }).join('');
}

function limparFormAba() {
  formAba.reset();
  formAba.abaSlug.value = '';
  tituloFormAba.textContent = 'Nova aba';
  cancelarAba.hidden = true;
}

formAba.addEventListener('submit', evento => {
  evento.preventDefault();
  const abas = DB.abas();
  const slugOriginal = formAba.abaSlug.value;
  const dados = {
    nome: formAba.nome.value.trim(),
    descricao: formAba.descricao.value.trim(),
    cor: formAba.cor.value
  };

  if (slugOriginal) {
    // O slug não muda ao editar, senão as matérias e os links perderiam a aba
    const i = abas.findIndex(a => a.slug === slugOriginal);
    abas[i] = { ...abas[i], ...dados };
  } else {
    const slug = gerarSlug(dados.nome);
    if (!slug) return avisar('Dê um nome com letras ou números para a aba.');
    if (abas.some(a => a.slug === slug)) return avisar('Já existe uma aba com esse nome.');
    abas.push({ slug, ...dados });
  }

  DB.salvar('abas', abas);
  limparFormAba();
  listarAbas();
  preencherSelectAbas();
  montarLayout();   // atualiza as abas do cabeçalho
  avisar(slugOriginal ? 'Aba atualizada.' : 'Aba criada.');
});

cancelarAba.addEventListener('click', limparFormAba);

document.getElementById('lista-abas').addEventListener('click', evento => {
  const { editar, excluir } = evento.target.dataset;

  if (editar) {
    const a = DB.aba(editar);
    formAba.abaSlug.value = a.slug;
    formAba.nome.value = a.nome;
    formAba.descricao.value = a.descricao;
    formAba.cor.value = a.cor;
    tituloFormAba.textContent = 'Editando aba';
    cancelarAba.hidden = false;
    formAba.nome.focus();
  }

  if (excluir) {
    const emUso = DB.ler('materias').some(m => m.aba === excluir);
    if (emUso) return avisar('Mova ou exclua as matérias desta aba antes de excluí-la.');
    if (!confirm('Excluir esta aba?')) return;
    DB.salvar('abas', DB.abas().filter(a => a.slug !== excluir));
    listarAbas();
    preencherSelectAbas();
    montarLayout();
    avisar('Aba excluída.');
  }
});

/* ---------------- USUÁRIOS ---------------- */

function listarUsuarios() {
  document.getElementById('lista-usuarios').innerHTML = DB.usuarios().map(u => `
    <tr>
      <td>${esc(u.nome)}<br><small>${esc(u.email)}</small></td>
      <td>${u.papel === 'editor' ? 'Editor' : 'Leitor'}</td>
      <td class="tabela__acoes">
        ${u.id === editor.id
          ? '<small>Você</small>'
          : `<button type="button" data-trocar="${u.id}">
               ${u.papel === 'editor' ? 'Tornar leitor' : 'Tornar editor'}</button>`}
      </td>
    </tr>`).join('');
}

document.getElementById('lista-usuarios').addEventListener('click', evento => {
  const id = Number(evento.target.dataset.trocar);
  if (!id) return;
  const usuarios = DB.usuarios();
  const u = usuarios.find(x => x.id === id);
  u.papel = u.papel === 'editor' ? 'leitor' : 'editor';
  DB.salvar('usuarios', usuarios);
  listarUsuarios();
  avisar(`${u.nome} agora é ${u.papel}.`);
});

/* ---------------- RESET ---------------- */

document.getElementById('botao-resetar').addEventListener('click', () => {
  if (!confirm('Apagar tudo e voltar aos dados de exemplo? Você vai precisar entrar de novo.')) return;
  DB.resetar();
  location.reload();
});

/* ---------------- INÍCIO ---------------- */

if (editor) {
  preencherSelectAbas();
  listarMaterias();
  listarAbas();
  listarUsuarios();
}
