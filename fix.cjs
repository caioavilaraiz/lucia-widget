const fs = require('fs');
let c = fs.readFileSync('widget.js', 'utf8');
c = c.replace("btnV.textContent='uD83DuDD0A'", "btnV.textContent='\uD83D\uDD0A'");
fs.writeFileSync('widget.js', c);
console.log('feito');
