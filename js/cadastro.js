// cadastro.js — cria a conta e já entra com ela
const form = document.getElementById('form-cadastro');
const mensagem = document.getElementById('mensagem');

form.addEventListener('submit', evento => {
  evento.preventDefault();   // impede o navegador de recarregar a página
  const resultado = Auth.cadastrar(form.nome.value, form.email.value, form.senha.value);

  if (!resultado.ok) {
    mensagem.textContent = resultado.erro;
    mensagem.hidden = false;
    return;
  }
  location.href = 'index.html';
});
