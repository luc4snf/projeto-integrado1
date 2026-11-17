// =========================================================
// Menu hambúrguer (Tech Forge - Manipulação de Menu)
// Abre/fecha o menu no celular ao clicar no botão.
// =========================================================
const botaoMenu = document.querySelector('.hamburguer');
const menu = document.querySelector('.menu');

function abrirFecharMenu() {
  const aberto = menu.classList.toggle('aberto');
  botaoMenu.setAttribute('aria-expanded', aberto);
  botaoMenu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
}

function fecharMenu() {
  menu.classList.remove('aberto');
  botaoMenu.setAttribute('aria-expanded', 'false');
  botaoMenu.setAttribute('aria-label', 'Abrir menu');
}

botaoMenu.addEventListener('click', abrirFecharMenu);

// Fecha o menu quando o usuário clica em algum link
menu.querySelectorAll('a').forEach(function (link) {
  link.addEventListener('click', fecharMenu);
});

// Fecha com a tecla Esc
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') fecharMenu();
});

// Se a tela aumentar (ex.: girar o celular), garante que o menu volte ao normal
window.addEventListener('resize', function () {
  if (window.innerWidth > 768) fecharMenu();
});
