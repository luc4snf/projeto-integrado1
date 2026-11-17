// =========================================================
// Formulário de contato (Tech Forge)
// - Validação de Dados: verifica se os campos estão preenchidos
// - Mostrar Dados Digitados: exibe os dados no corpo da página
// =========================================================
const form = document.getElementById('form-contato');
const resultado = document.getElementById('resultado');

function mostrarErro(idCampo, mensagem) {
  const campo = document.getElementById('campo-' + idCampo);
  campo.classList.add('invalido');
  campo.querySelector('.msg-erro').textContent = mensagem;
}

function limparErros() {
  form.querySelectorAll('.campo').forEach(function (campo) {
    campo.classList.remove('invalido');
    const msg = campo.querySelector('.msg-erro');
    if (msg) msg.textContent = '';
  });
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

form.addEventListener('submit', function (evento) {
  evento.preventDefault(); // não recarrega a página
  limparErros();

  const nome = form.nome.value.trim();
  const email = form.email.value.trim();
  const telefone = form.telefone.value.trim();
  const objetivo = form.objetivo.value;
  const periodoMarcado = form.querySelector('input[name="periodo"]:checked');
  const mensagem = form.mensagem.value.trim();

  let valido = true;

  if (nome === '') {
    mostrarErro('nome', 'Preencha o seu nome.'); valido = false;
  } else if (nome.length < 3) {
    mostrarErro('nome', 'O nome precisa ter pelo menos 3 letras.'); valido = false;
  }

  if (email === '') {
    mostrarErro('email', 'Preencha o seu e-mail.'); valido = false;
  } else if (!emailValido(email)) {
    mostrarErro('email', 'Digite um e-mail válido. Ex.: nome@email.com'); valido = false;
  }

  const somenteNumeros = telefone.replace(/\D/g, '');
  if (telefone === '') {
    mostrarErro('telefone', 'Preencha o seu telefone/WhatsApp.'); valido = false;
  } else if (somenteNumeros.length < 10 || somenteNumeros.length > 11) {
    mostrarErro('telefone', 'Digite o telefone com DDD. Ex.: (44) 99999-9999'); valido = false;
  }

  if (objetivo === '') {
    mostrarErro('objetivo', 'Escolha o seu objetivo.'); valido = false;
  }

  if (!periodoMarcado) {
    mostrarErro('periodo', 'Escolha o melhor período para você.'); valido = false;
  }

  if (mensagem === '') {
    mostrarErro('mensagem', 'Escreva uma mensagem (pode ser uma dúvida ou "quero agendar").'); valido = false;
  }

  if (!valido) {
    // Leva o usuário até o primeiro campo com erro
    const primeiroErro = form.querySelector('.invalido input, .invalido select, .invalido textarea');
    if (primeiroErro) primeiroErro.focus();
    resultado.hidden = true;
    return;
  }

  // Tudo certo: mostra os dados digitados no corpo da página
  document.getElementById('r-nome').textContent = nome;
  document.getElementById('r-email').textContent = email;
  document.getElementById('r-telefone').textContent = telefone;
  document.getElementById('r-objetivo').textContent = form.objetivo.options[form.objetivo.selectedIndex].text;
  document.getElementById('r-periodo').textContent = periodoMarcado.value;
  document.getElementById('r-mensagem').textContent = mensagem;
  document.getElementById('r-primeiro-nome').textContent = nome.split(' ')[0];

  resultado.hidden = false;
  resultado.scrollIntoView({ behavior: 'smooth', block: 'center' });
  form.reset();
});

// Remove o erro do campo assim que o usuário começa a corrigir
form.addEventListener('input', function (e) {
  const campo = e.target.closest('.campo');
  if (campo && campo.classList.contains('invalido')) {
    campo.classList.remove('invalido');
    campo.querySelector('.msg-erro').textContent = '';
  }
});
