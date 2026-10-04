// auth.js — cadastro, login, logout e sessão (simulados no localStorage)
// A "sessão" é só o id do usuário logado guardado em jornal_sessao.

const CHAVE_SESSAO = PREFIXO + 'sessao';

const Auth = {
  usuarioAtual() {
    const id = Number(localStorage.getItem(CHAVE_SESSAO));
    return DB.usuarios().find(u => u.id === id) || null;
  },

  cadastrar(nome, email, senha) {
    nome = nome.trim();
    email = email.trim().toLowerCase();

    if (!nome || !email || !senha) return { ok: false, erro: 'Preencha nome, email e senha.' };
    if (senha.length < 6) return { ok: false, erro: 'A senha precisa ter pelo menos 6 caracteres.' };

    const usuarios = DB.usuarios();
    if (usuarios.some(u => u.email === email)) {
      return { ok: false, erro: 'Já existe uma conta com esse email. Tente entrar.' };
    }

    // Toda conta nova começa como leitor. Um editor pode promovê-la no painel.
    const novo = { id: DB.novoId(usuarios), nome, email, senha, papel: 'leitor' };
    usuarios.push(novo);
    DB.salvar('usuarios', usuarios);
    localStorage.setItem(CHAVE_SESSAO, novo.id);
    return { ok: true };
  },

  entrar(email, senha) {
    email = email.trim().toLowerCase();
    const usuario = DB.usuarios().find(u => u.email === email && u.senha === senha);
    if (!usuario) return { ok: false, erro: 'Email ou senha incorretos.' };
    localStorage.setItem(CHAVE_SESSAO, usuario.id);
    return { ok: true };
  },

  sair() {
    localStorage.removeItem(CHAVE_SESSAO);
  },

  // Usado no CMS: se não for editor, manda para o login
  exigirEditor() {
    const usuario = this.usuarioAtual();
    if (!usuario || usuario.papel !== 'editor') {
      location.replace('login.html?voltar=cms.html');
      return null;
    }
    return usuario;
  }
};
