(function(){
var KEY='rv_dark';
var BTN_ID='rv-dark-btn';

function aplicar(ativo){
  if(!document.body) return;
  if(ativo){
    document.body.classList.add('rv-dark');
  } else {
    document.body.classList.remove('rv-dark');
  }
  var btn=document.getElementById(BTN_ID);
  if(btn) btn.textContent=ativo?'MODO DIA':'MODO NOCHE';
}

function salvar(ativo){
  try{localStorage.setItem(KEY,ativo?'1':'0');}catch(e){}
}

function lerPreferencia(){
  try{return localStorage.getItem(KEY)==='1';}catch(e){return false;}
}

function criarBotao(){
  if(!document.body) return;
  if(document.getElementById('lw-btn-dark')) return;
  if(document.getElementById(BTN_ID)) return;
  var btn=document.createElement('button');
  btn.id=BTN_ID;
  btn.textContent=lerPreferencia()?'MODO DIA':'MODO NOCHE';
  btn.addEventListener('click',function(){
    var novo=!document.body.classList.contains('rv-dark');
    aplicar(novo);
    salvar(novo);
    var widgetBtn=document.getElementById('lw-btn-dark');
    if(widgetBtn) widgetBtn.textContent=novo?'MODO DIA':'MODO NOCHE';
  });
  document.body.appendChild(btn);
}

function init(){
  var ativo=lerPreferencia();
  if(ativo) aplicar(true);
  criarBotao();
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',init);
} else {
  init();
}

window.rvDark={
  toggle:function(ativo){aplicar(ativo);salvar(ativo);}
};
})();
