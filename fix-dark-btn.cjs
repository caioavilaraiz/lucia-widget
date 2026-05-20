const fs = require('fs');
let c = fs.readFileSync('dark.js', 'utf8');
// nao criar botao se o widget da Lucia ja esta na pagina
c = c.replace(
  'function criarBotao(){',
  'function criarBotao(){if(document.getElementById(\'lw-btn-dark\'))return;'
);
fs.writeFileSync('dark.js', c);
console.log('feito');
