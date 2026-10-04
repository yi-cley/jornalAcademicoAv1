// login.js — confere email e senha e grava a sessão
const form = document.getElementById('form-login');
const mensagem = document.getElementById('mensagem');

form.addEventListener('submit', evento => {
  evento.preventDefault();
  const resultado = Auth.entrar(form.email.value, form.senha.value);

  if (!resultado.ok) {
    mensagem.textContent = resultado.erro;
    mensagem.hidden = false;
    return;
  }

  // Só aceitamos voltar para o CMS. Aceitar qualquer endereço vindo da URL
  // permitiria mandar o usuário para um site falso depois do login (open redirect).
  location.href = param('voltar') === 'cms.html' ? 'cms.html' : 'index.html';
});
