const fs = require('fs');
let c = fs.readFileSync('widget.js', 'utf8');
// substituir a funcao salvarDark para usar o sistema global tambem
c = c.replace(
  "function salvarDark(ativo){if(!tok)return;fetch(API+'/preferencias',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+tok},body:JSON.stringify({dark_mode:ativo})}).catch(function(){});}",
  "function salvarDark(ativo){if(window.rvDark)window.rvDark.toggle(ativo);if(!tok)return;fetch(API+'/preferencias',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+tok},body:JSON.stringify({dark_mode:ativo})}).catch(function(){});}"
);
fs.writeFileSync('widget.js', c);
console.log('feito');
