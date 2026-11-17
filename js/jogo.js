// =========================================================
// Jogo "Rumo à FitStart"
// Enredo: o Lucas passou anos no sofá e decidiu mudar de vida.
// Ele precisa chegar à academia antes de fechar, desviando
// das tentações (hambúrguer, refrigerante, sofá) e pegando
// halteres (pontos) e água (energia).
// =========================================================
(function () {
  const canvas = document.getElementById('jogo');
  const ctx = canvas.getContext('2d');
  const btnPular = document.getElementById('btn-pular');
  const btnPausar = document.getElementById('btn-pausar');

  // ---------- Constantes do jogo ----------
  const W = canvas.width;      // 800
  const H = canvas.height;     // 400
  const CHAO = 330;            // linha do chão (pés do personagem)
  const META = 1000;           // distância até a academia (metros)
  const GRAVIDADE = 1800;
  const FORCA_PULO = 640;
  const FONTE = '"Poppins", Arial, sans-serif';

  // ---------- Estado do jogo ----------
  // estados possíveis: 'intro', 'jogando', 'pausado', 'fim', 'vitoria'
  let estado = 'intro';
  let jogador, obstaculos, itens, textos;
  let halteres, energia, distancia, velocidade;
  let timerObstaculo, timerItem, invencivel, tempoAnim = 0, tempoFim = 0;
  let academiaX = null;
  let pontuacaoFinal = 0, novoRecorde = false;
  let recorde = lerRecorde();

  // ---------- Cenário (parallax) ----------
  const predios = [];
  const arvores = [];
  let deslocChao = 0;

  function criarCenario() {
    predios.length = 0;
    let x = 0;
    while (x < W + 200) {
      const w = 60 + Math.random() * 60;
      predios.push({ x: x, w: w, h: 80 + Math.random() * 120 });
      x += w + 10;
    }
    arvores.length = 0;
    for (let ax = 60; ax < W + 300; ax += 220 + Math.random() * 120) {
      arvores.push({ x: ax, tipo: Math.random() < 0.6 ? 'arvore' : 'poste' });
    }
  }

  function moverCenario(vel, dt) {
    predios.forEach(function (p) { p.x -= vel * 0.15 * dt; });
    arvores.forEach(function (a) { a.x -= vel * 0.5 * dt; });

    predios.forEach(function (p) {
      if (p.x + p.w < 0) {
        const fim = Math.max.apply(null, predios.map(function (q) { return q.x + q.w; }));
        p.x = fim + 10;
        p.h = 80 + Math.random() * 120;
      }
    });
    arvores.forEach(function (a) {
      if (a.x < -60) {
        const fim = Math.max.apply(null, arvores.map(function (q) { return q.x; }));
        a.x = fim + 220 + Math.random() * 120;
        a.tipo = Math.random() < 0.6 ? 'arvore' : 'poste';
      }
    });
    deslocChao = (deslocChao + vel * dt) % 60;
  }

  // ---------- Recorde (localStorage) ----------
  function lerRecorde() {
    try { return Number(localStorage.getItem('fitstart_recorde')) || 0; } catch (e) { return 0; }
  }
  function salvarRecorde(valor) {
    try { localStorage.setItem('fitstart_recorde', valor); } catch (e) { /* sem armazenamento */ }
  }

  // ---------- Início / fim ----------
  function iniciar() {
    jogador = { x: 130, y: CHAO, vy: 0, pulos: 0 };
    obstaculos = [];
    itens = [];
    textos = [];
    halteres = 0;
    energia = 100;
    distancia = 0;
    velocidade = 300;
    timerObstaculo = 1.2;
    timerItem = 0.8;
    invencivel = 0;
    academiaX = null;
    novoRecorde = false;
    estado = 'jogando';
    btnPausar.textContent = 'Pausar';
  }

  function calcularPontos() {
    return halteres * 10 + Math.floor(Math.min(distancia, META) / 10);
  }

  function encerrar(venceu) {
    pontuacaoFinal = calcularPontos() + (venceu ? Math.round(energia) : 0);
    if (pontuacaoFinal > recorde) {
      recorde = pontuacaoFinal;
      novoRecorde = true;
      salvarRecorde(recorde);
    }
    estado = venceu ? 'vitoria' : 'fim';
    tempoFim = 0;
  }

  // ---------- Ações do jogador ----------
  function pular() {
    if (jogador.pulos < 2) {           // permite pulo duplo
      jogador.vy = -FORCA_PULO * (jogador.pulos === 0 ? 1 : 0.85);
      jogador.pulos++;
    }
  }

  function acao() {
    if (estado === 'jogando') pular();
    else if (estado === 'intro') iniciar();
    else if ((estado === 'fim' || estado === 'vitoria') && tempoFim > 0.6) iniciar();
    else if (estado === 'pausado') alternarPausa();
  }

  function alternarPausa() {
    if (estado === 'jogando') {
      estado = 'pausado';
      btnPausar.textContent = 'Continuar';
    } else if (estado === 'pausado') {
      estado = 'jogando';
      btnPausar.textContent = 'Pausar';
    }
  }

  // ---------- Criação de obstáculos e itens ----------
  const TIPOS_OBSTACULO = [
    { tipo: 'hamburguer', w: 42, h: 34 },
    { tipo: 'refri', w: 24, h: 44 },
    { tipo: 'sofa', w: 86, h: 42 }
  ];

  function criarObstaculo() {
    const modelo = TIPOS_OBSTACULO[Math.floor(Math.random() * TIPOS_OBSTACULO.length)];
    obstaculos.push({
      tipo: modelo.tipo, w: modelo.w, h: modelo.h,
      x: W + 20, y: CHAO - modelo.h, atingido: false
    });
  }

  function criarItem() {
    const tipo = Math.random() < 0.75 ? 'halter' : 'agua';
    const alto = Math.random() < 0.5;
    itens.push({ tipo: tipo, x: W + 40, y: alto ? CHAO - 140 : CHAO - 28, pego: false });
  }

  function addTexto(x, y, txt, cor) {
    textos.push({ x: x, y: y, txt: txt, cor: cor, vida: 1 });
  }

  // ---------- Colisão (retângulos) ----------
  function caixaJogador() {
    return { x: jogador.x - 11, y: jogador.y - 74, w: 22, h: 70 };
  }
  function colide(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // ---------- Atualização (lógica a cada quadro) ----------
  function atualizar(dt) {
    tempoAnim += dt;

    if (estado === 'intro') { moverCenario(120, dt); return; }
    if (estado === 'fim' || estado === 'vitoria') { tempoFim += dt; return; }
    if (estado !== 'jogando') return;

    // Velocidade aumenta conforme o Lucas avança
    velocidade = 300 + Math.min(distancia, META) * 0.22;
    distancia += velocidade * dt / 30;
    const dx = velocidade * dt;

    // Física do pulo
    jogador.vy += GRAVIDADE * dt;
    jogador.y += jogador.vy * dt;
    if (jogador.y >= CHAO) { jogador.y = CHAO; jogador.vy = 0; jogador.pulos = 0; }

    // Energia vai acabando com o cansaço
    if (academiaX === null) energia -= 1.3 * dt;
    if (invencivel > 0) invencivel -= dt;

    // Gera obstáculos e itens (para de gerar perto da academia)
    const chegando = distancia >= META - 60;
    timerObstaculo -= dt;
    if (timerObstaculo <= 0 && !chegando) {
      criarObstaculo();
      const dificuldade = Math.min(distancia / META, 1) * 0.35;
      timerObstaculo = 0.9 + Math.random() * 1.1 - dificuldade;
    }
    timerItem -= dt;
    if (timerItem <= 0 && !chegando) {
      criarItem();
      timerItem = 1.2 + Math.random() * 1.5;
    }

    // Movimento
    obstaculos.forEach(function (o) { o.x -= dx; });
    itens.forEach(function (i) { i.x -= dx; });
    obstaculos = obstaculos.filter(function (o) { return o.x + o.w > -20; });
    itens = itens.filter(function (i) { return i.x > -40 && !i.pego; });

    // Colisões
    const caixa = caixaJogador();
    obstaculos.forEach(function (o) {
      if (!o.atingido && invencivel <= 0 && colide(caixa, o)) {
        o.atingido = true;
        energia -= 25;
        invencivel = 1.2;
        addTexto(jogador.x, jogador.y - 90, '-25 energia', '#ff5252');
      }
    });
    itens.forEach(function (it) {
      if (colide(caixa, { x: it.x - 16, y: it.y - 14, w: 32, h: 28 })) {
        it.pego = true;
        if (it.tipo === 'halter') {
          halteres++;
          addTexto(it.x, it.y - 20, '+10', '#c6ff00');
        } else {
          energia = Math.min(100, energia + 20);
          addTexto(it.x, it.y - 20, '+20 energia', '#4fc3f7');
        }
      }
    });

    textos.forEach(function (t) { t.y -= 40 * dt; t.vida -= dt; });
    textos = textos.filter(function (t) { return t.vida > 0; });

    moverCenario(velocidade, dt);

    // Chegada na academia
    if (distancia >= META && academiaX === null) academiaX = W + 40;
    if (academiaX !== null) {
      academiaX -= dx;
      if (academiaX + 115 <= jogador.x) { academiaX = jogador.x - 115; encerrar(true); }
    }

    if (energia <= 0) { energia = 0; encerrar(false); }
  }

  // =========================================================
  // Desenho
  // =========================================================
  function rr(x, y, w, h, r) {           // retângulo arredondado
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
  }
  function circulo(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  function linha(x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
  function sombra(x, w) {
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.beginPath(); ctx.ellipse(x, CHAO + 2, w, 5, 0, 0, Math.PI * 2); ctx.fill();
  }
  function misturar(c1, c2, t) {
    const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
    const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
    const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
  function progresso() { return estado === 'intro' ? 0 : Math.min(distancia / META, 1); }

  // Céu muda da tarde para o pôr do sol
  function desenharCeu() {
    const p = progresso();
    const grad = ctx.createLinearGradient(0, 0, 0, CHAO);
    grad.addColorStop(0, misturar([110, 198, 255], [94, 53, 177], p));
    grad.addColorStop(1, misturar([200, 236, 255], [255, 171, 64], p));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, CHAO);

    // Sol descendo
    ctx.fillStyle = misturar([255, 235, 59], [255, 112, 67], p);
    circulo(640, 70 + p * 190, 34);
  }

  function desenharPredios() {
    const p = progresso();
    predios.forEach(function (b) {
      ctx.fillStyle = misturar([120, 144, 156], [69, 39, 90], p);
      ctx.fillRect(b.x, CHAO - b.h, b.w, b.h);
      // janelas acendem ao anoitecer
      ctx.fillStyle = p > 0.5 ? 'rgba(255,235,59,.8)' : 'rgba(255,255,255,.25)';
      for (let jy = CHAO - b.h + 12; jy < CHAO - 20; jy += 22) {
        for (let jx = b.x + 10; jx < b.x + b.w - 14; jx += 18) {
          ctx.fillRect(jx, jy, 8, 10);
        }
      }
    });
  }

  function desenharArvores() {
    const p = progresso();
    arvores.forEach(function (a) {
      if (a.tipo === 'arvore') {
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(a.x - 5, CHAO - 50, 10, 50);
        ctx.fillStyle = misturar([67, 160, 71], [46, 94, 50], p);
        circulo(a.x, CHAO - 62, 26);
        circulo(a.x - 16, CHAO - 50, 16);
        circulo(a.x + 16, CHAO - 50, 16);
      } else {
        ctx.fillStyle = '#455a64';
        ctx.fillRect(a.x - 3, CHAO - 110, 6, 110);
        ctx.fillRect(a.x - 3, CHAO - 110, 26, 5);
        if (p > 0.5) {              // poste aceso à noite
          ctx.fillStyle = 'rgba(255,241,118,.25)';
          circulo(a.x + 20, CHAO - 100, 26);
        }
        ctx.fillStyle = p > 0.5 ? '#fff176' : '#cfd8dc';
        circulo(a.x + 20, CHAO - 102, 6);
      }
    });
  }

  function desenharChao() {
    ctx.fillStyle = '#7cb342';
    ctx.fillRect(0, CHAO, W, 8);
    ctx.fillStyle = '#9e9e9e';
    ctx.fillRect(0, CHAO + 8, W, H - CHAO - 8);
    ctx.fillStyle = '#bdbdbd';
    for (let x = -deslocChao; x < W; x += 60) ctx.fillRect(x, CHAO + 34, 30, 6);
  }

  function desenharAcademia() {
    if (academiaX === null) return;
    const x = academiaX, w = 230, h = 190, y = CHAO - h;
    ctx.fillStyle = '#263238';
    rr(x, y, w, h, 6);
    // janelas iluminadas
    ctx.fillStyle = '#fff59d';
    for (let jx = x + 22; jx < x + w - 30; jx += 46) ctx.fillRect(jx, y + 74, 30, 26);
    // placa
    ctx.fillStyle = '#c6ff00';
    rr(x + 20, y + 16, w - 40, 42, 8);
    ctx.fillStyle = '#111';
    ctx.font = 'bold 26px ' + FONTE;
    ctx.textAlign = 'center';
    ctx.fillText('FitStart', x + w / 2, y + 46);
    // porta
    ctx.fillStyle = '#c6ff00';
    rr(x + w / 2 - 28, CHAO - 74, 56, 74, 4);
    ctx.fillStyle = '#37474f';
    rr(x + w / 2 - 22, CHAO - 68, 44, 68, 3);
  }

  function desenharObstaculo(o) {
    sombra(o.x + o.w / 2, o.w / 2);
    const x = o.x, y = o.y, w = o.w;
    if (o.tipo === 'hamburguer') {
      ctx.fillStyle = '#d4883a'; rr(x, y + 24, w, 10, 5);         // pão de baixo
      ctx.fillStyle = '#5d3a1a'; rr(x + 2, y + 17, w - 4, 8, 4);  // carne
      ctx.fillStyle = '#ffca28'; ctx.fillRect(x + 3, y + 14, w - 6, 4); // queijo
      ctx.fillStyle = '#66bb6a'; rr(x - 2, y + 11, w + 4, 5, 2);  // alface
      ctx.fillStyle = '#e0a050';
      ctx.beginPath(); ctx.ellipse(x + w / 2, y + 12, w / 2, 12, 0, Math.PI, 0); ctx.fill(); // pão de cima
      ctx.fillStyle = '#fff8e1';
      [[10, 5], [20, 2], [30, 6], [16, 8]].forEach(function (s) { circulo(x + s[0], y + s[1] + 1, 1.6); });
    } else if (o.tipo === 'refri') {
      ctx.fillStyle = '#e53935'; rr(x, y + 4, w, o.h - 4, 5);
      ctx.fillStyle = '#b0bec5'; rr(x + 2, y, w - 4, 6, 2);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x + 2, y + 24);
      ctx.quadraticCurveTo(x + w / 2, y + 14, x + w - 2, y + 24); ctx.stroke();
    } else if (o.tipo === 'sofa') {
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(x + 8, y + o.h - 4, 6, 4); ctx.fillRect(x + w - 14, y + o.h - 4, 6, 4);
      ctx.fillStyle = '#a1887f'; rr(x + 6, y, w - 12, 24, 6);       // encosto
      ctx.fillStyle = '#8d6e63'; rr(x, y + 16, w, o.h - 20, 6);     // assento
      ctx.fillStyle = '#795548'; rr(x, y + 8, 14, o.h - 12, 5); rr(x + w - 14, y + 8, 14, o.h - 12, 5); // braços
    }
  }

  function desenharItem(it) {
    const y = it.y + Math.sin(tempoAnim * 4 + it.x * 0.05) * 4;   // flutua
    if (it.tipo === 'halter') {
      ctx.fillStyle = '#90a4ae'; ctx.fillRect(it.x - 14, y - 2, 28, 4);
      ctx.fillStyle = '#263238'; rr(it.x - 18, y - 10, 8, 20, 2); rr(it.x + 10, y - 10, 8, 20, 2);
      ctx.fillStyle = '#c6ff00'; ctx.fillRect(it.x - 18, y - 10, 8, 3); ctx.fillRect(it.x + 10, y - 10, 8, 3);
    } else {
      ctx.fillStyle = '#4fc3f7'; rr(it.x - 8, y - 10, 16, 24, 4);
      ctx.fillStyle = '#0288d1'; ctx.fillRect(it.x - 4, y - 15, 8, 6);
      ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(it.x - 4, y - 5, 3, 14);
    }
  }

  // Personagem Lucas, com animação de corrida
  function desenharJogador() {
    const j = jogador || { x: 130, y: CHAO };
    if (invencivel > 0 && Math.floor(invencivel * 12) % 2 === 0) return; // pisca após dano
    const noChao = j.y >= CHAO;
    const correndo = estado === 'jogando' || estado === 'intro';
    const a = noChao ? (correndo ? Math.sin(tempoAnim * 16) : 0) : 0.7;
    const pe = noChao ? 0 : -8;

    sombra(j.x, 16);
    ctx.save();
    ctx.translate(j.x, j.y);
    ctx.lineCap = 'round';

    // pernas
    ctx.strokeStyle = '#263238'; ctx.lineWidth = 8;
    linha(-3, -26, -3 + a * 13, -5 + pe);
    linha(3, -26, 3 - a * 13, -5 + pe);
    ctx.fillStyle = '#ffffff';
    rr(-3 + a * 13 - 5, -6 + pe, 13, 6, 3);
    rr(3 - a * 13 - 5, -6 + pe, 13, 6, 3);
    // short
    ctx.fillStyle = '#37474f'; rr(-12, -34, 24, 12, 4);
    // braço de trás
    ctx.strokeStyle = '#e0b070'; ctx.lineWidth = 6;
    linha(0, -50, a * 12, -34);
    // camiseta
    ctx.fillStyle = '#c6ff00'; rr(-13, -56, 26, 28, 7);
    ctx.fillStyle = '#111'; ctx.font = 'bold 10px ' + FONTE; ctx.textAlign = 'center';
    ctx.fillText('FS', 0, -38);
    // braço da frente
    ctx.strokeStyle = '#f1c27d';
    linha(0, -50, -a * 12, -34);
    // cabeça
    ctx.fillStyle = '#f1c27d'; circulo(0, -66, 11);
    ctx.fillStyle = '#263238';
    ctx.beginPath(); ctx.arc(0, -68, 11, Math.PI, 0); ctx.closePath(); ctx.fill();
    circulo(5, -65, 1.8);
    ctx.restore();
  }

  function desenharTextos() {
    ctx.textAlign = 'center';
    ctx.font = 'bold 18px ' + FONTE;
    textos.forEach(function (t) {
      ctx.globalAlpha = Math.max(t.vida, 0);
      ctx.fillStyle = t.cor;
      ctx.fillText(t.txt, t.x, t.y);
    });
    ctx.globalAlpha = 1;
  }

  function desenharHUD() {
    // fundo do painel
    ctx.fillStyle = 'rgba(0,0,0,.45)';
    rr(10, 10, W - 20, 50, 10);

    // energia
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px ' + FONTE; ctx.textAlign = 'left';
    ctx.fillText('ENERGIA', 24, 29);
    ctx.fillStyle = 'rgba(255,255,255,.2)'; rr(24, 36, 170, 12, 6);
    ctx.fillStyle = energia > 50 ? '#69f0ae' : energia > 25 ? '#ffd740' : '#ff5252';
    if (energia > 0) rr(24, 36, 170 * energia / 100, 12, 6);

    // progresso até a academia
    const p = Math.min(distancia / META, 1);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
    ctx.fillText(Math.floor(Math.min(distancia, META)) + ' m / ' + META + ' m até a FitStart', 400, 29);
    ctx.fillStyle = 'rgba(255,255,255,.2)'; rr(250, 36, 300, 12, 6);
    ctx.fillStyle = '#c6ff00'; if (p > 0) rr(250, 36, Math.max(300 * p, 12), 12, 6);

    // pontos
    ctx.textAlign = 'right'; ctx.fillStyle = '#c6ff00'; ctx.font = 'bold 18px ' + FONTE;
    ctx.fillText('Pontos: ' + calcularPontos(), W - 24, 34);
    ctx.fillStyle = '#ddd'; ctx.font = '12px ' + FONTE;
    ctx.fillText('Recorde: ' + recorde, W - 24, 52);
  }

  function telaMensagem(titulo, linhas, corTitulo) {
    ctx.fillStyle = 'rgba(15,17,19,.78)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.fillStyle = corTitulo || '#c6ff00';
    ctx.font = 'bold 40px ' + FONTE;
    ctx.fillText(titulo, W / 2, 120);
    ctx.font = '20px ' + FONTE;
    linhas.forEach(function (l, i) {
      ctx.fillStyle = l.cor || '#f1f3f5';
      if (l.negrito) ctx.font = 'bold 22px ' + FONTE; else ctx.font = '20px ' + FONTE;
      ctx.fillText(l.txt, W / 2, 175 + i * 36);
    });
  }

  function desenhar() {
    ctx.clearRect(0, 0, W, H);
    desenharCeu();
    desenharPredios();
    desenharArvores();
    desenharChao();

    if (estado === 'intro') {
      desenharJogador();
      telaMensagem('Rumo à FitStart', [
        { txt: 'O Lucas passou anos no sofá. Hoje ele decidiu mudar!' },
        { txt: 'Ajude ele a chegar na academia antes que ela feche.' },
        { txt: 'Pule 🍔 🥤 🛋️ e pegue halteres 🏋️ e água 💧' },
        { txt: '' },
        { txt: 'Toque na tela ou aperte ESPAÇO para começar', cor: '#c6ff00', negrito: true }
      ]);
      return;
    }

    desenharAcademia();
    itens.forEach(desenharItem);
    obstaculos.forEach(desenharObstaculo);
    desenharJogador();
    desenharTextos();
    desenharHUD();

    if (estado === 'pausado') {
      telaMensagem('Pausado', [{ txt: 'Aperte P, toque na tela ou no botão para continuar' }]);
    } else if (estado === 'fim') {
      telaMensagem('O Lucas cansou... 😓', [
        { txt: 'Pontos: ' + pontuacaoFinal + '   ·   Recorde: ' + recorde },
        { txt: novoRecorde ? '🏆 Novo recorde!' : 'Na FitStart, o professor não deixa você desistir!', cor: novoRecorde ? '#ffd740' : '#f1f3f5' },
        { txt: '' },
        { txt: 'Toque ou aperte ESPAÇO para tentar de novo', cor: '#c6ff00', negrito: true }
      ], '#ff6b6b');
    } else if (estado === 'vitoria') {
      telaMensagem('O Lucas chegou! 🎉', [
        { txt: 'Pontos: ' + pontuacaoFinal + ' (bônus de energia incluído)' },
        { txt: novoRecorde ? '🏆 Novo recorde!' : 'Recorde: ' + recorde, cor: novoRecorde ? '#ffd740' : '#f1f3f5' },
        { txt: 'Agora é a sua vez: agende sua aula grátis!' },
        { txt: 'Toque ou aperte ESPAÇO para jogar de novo', cor: '#c6ff00', negrito: true }
      ]);
    }
  }

  // ---------- Loop principal ----------
  let ultimo = performance.now();
  function loop(agora) {
    const dt = Math.min((agora - ultimo) / 1000, 0.05);
    ultimo = agora;
    atualizar(dt);
    desenhar();
    requestAnimationFrame(loop);
  }

  // ---------- Controles ----------
  document.addEventListener('keydown', function (e) {
    if (e.target.closest && e.target.closest('button, a, input, textarea, select')) return;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault();           // evita rolar a página
      acao();
    } else if (e.code === 'KeyP') {
      alternarPausa();
    }
  });
  canvas.addEventListener('pointerdown', function (e) { e.preventDefault(); acao(); });
  btnPular.addEventListener('click', acao);
  btnPausar.addEventListener('click', alternarPausa);

  // Pausa sozinho se o usuário trocar de aba
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && estado === 'jogando') alternarPausa();
  });

  criarCenario();
  requestAnimationFrame(loop);
})();
