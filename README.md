# FitStart Academia

Site de uma academia feita para **quem nunca treinou**, desenvolvido como projeto do bimestre.

## Persona

**Lucas Andrade, 24 anos** — auxiliar administrativo, sedentário, nunca frequentou academia.

| | |
|---|---|
| **Objetivo** | Perder peso e ter mais disposição no dia a dia. |
| **Rotina** | Trabalha das 9h às 18h, só consegue treinar à noite. |
| **Dores** | Não sabe por onde começar; tem vergonha de ser julgado; acha academia cara; tem pouco tempo. |
| **O que ele procura** | Um lugar acolhedor, com alguém que ensine do zero, preço justo e horário flexível. |

### Como o site atende o Lucas

- **Início**: cada card mostra uma dor do Lucas e como a academia resolve (treino montado, ambiente acolhedor, aberta até 23h, preço justo).
- **Modalidades**: "Turma Iniciante" em destaque e quadro com horários noturnos.
- **Planos**: preços claros, sem matrícula, e FAQ respondendo "nunca treinei, vou conseguir?".
- **Contato**: ação principal do site — **agendar a aula grátis**.
- **Jogo**: o personagem é o próprio Lucas, correndo até a academia e fugindo das tentações.

## Onde está cada item da rubrica

| Item | Onde |
|---|---|
| Padronizar | Mesmo cabeçalho, rodapé, botões e cards em todas as páginas (`css/style.css`) |
| Indicar | Botões com cor de destaque, efeito ao passar o mouse e link ativo marcado no menu |
| Facilitar | Botões com no mínimo 48px, fonte legível, alto contraste (fundo escuro + verde-limão), hierarquia h1/h2/h3 |
| Alinhar | Ilustrações de academia em `img/` (musculação, funcional, spinning, yoga, turma iniciante) |
| Direcionar | Botão "Agendar aula grátis" em todas as páginas |
| Personagens / Elementos / Lógica / Criatividade / Cenário e Animações | `jogo.html` + `js/jogo.js` (personagem animado, pulo duplo, energia, pontos, recorde, parallax, céu que escurece, academia no final) |
| Responsividade | Media queries em `css/style.css` (860px, 768px, 480px) |
| Manipulação de Menu | Menu hambúrguer em `js/menu.js` |
| Validação de Dados | `js/contato.js` verifica se todos os campos estão preenchidos (e e-mail/telefone válidos) |
| Mostrar Dados Digitados | `js/contato.js` mostra os dados enviados no corpo da página de contato |

## Estrutura

```
index.html        Início
modalidades.html  Modalidades e horários
planos.html       Planos e dúvidas frequentes
jogo.html         Jogo "Rumo à FitStart"
contato.html      Formulário (aula grátis)
css/style.css
js/menu.js        Menu hambúrguer
js/contato.js     Validação e exibição dos dados
js/jogo.js        Jogo em JavaScript (canvas)
img/              Ilustrações SVG
```

## Publicar no GitHub Pages

1. Crie um repositório no GitHub (ex.: `fitstart`).
2. Envie todos os arquivos desta pasta para o repositório (o `index.html` precisa ficar na raiz).
3. No repositório: **Settings → Pages → Branch: `main` / pasta `/ (root)` → Save**.
4. Em 1–2 minutos o site fica disponível em `https://SEU-USUARIO.github.io/fitstart/`.
