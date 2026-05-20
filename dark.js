(function(){
var KEY='rv_dark';
var BTN_ID='rv-dark-btn';

function aplicar(ativo){
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

function criarBotao(){if(document.getElementById('lw-btn-dark'))return;
  if(document.getElementById(BTN_ID))return;
  var btn=document.createElement('button');
  btn.id=BTN_ID;
  btn.textContent=lerPreferencia()?'MODO DIA':'MODO NOCHE';
  btn.style.cssText='position:fixed;bottom:20px;right:20px;z-index:99999;background:rgba(43,24,16,0.85);color:#F4EDE0;border:1px solid rgba(244,237,224,0.3);padding:8px 14px;border-radius:20px;font-size:11px;font-family:Lora,Georgia,serif;letter-spacing:.05em;cursor:pointer;backdrop-filter:blur(4px)';
  btn.addEventListener('click',function(){
    var novo=!document.body.classList.contains('rv-dark');
    aplicar(novo);
    salvar(novo);
    var widgetBtn=document.getElementById('lw-btn-dark');
    if(widgetBtn) widgetBtn.textContent=novo?'MODO DIA':'MODO NOCHE';
  });
  document.body.appendChild(btn);
}

function injetarCSS(){
  var style=document.createElement('style');
  style.textContent='body.rv-dark{background:#1A1008!important;color:#F0E6D0!important}body.rv-dark *:not(#lucia-widget):not(#lucia-widget *){color:#F0E6D0!important}body.rv-dark div[class*="section"],body.rv-dark div[class*="container"],body.rv-dark div[class*="outer"],body.rv-dark section{background:#1A1008!important}body.rv-dark div[style]{background-color:#1A1008!important;background-image:none!important}body.rv-dark #lucia-widget-section{background:#1A1008!important}body.rv-dark #lucia-widget-section.visivel{display:block!important}';
  document.head.appendChild(style);
}

function init(){
  injetarCSS();
  var ativo=lerPreferencia();
  if(ativo) aplicar(true);
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',criarBotao);
  } else {
    criarBotao();
  }
}

init();

window.rvDark={
  toggle:function(ativo){aplicar(ativo);salvar(ativo);}
};
})();
