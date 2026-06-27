(function(){
var API='https://lucia-backend.vercel.app';
(function(){var s=document.createElement('style');s.textContent='.lw-btn-mic-gravando{background:#c0392b!important;color:#fff!important;animation:lw-pulso 1s infinite;}@keyframes lw-pulso{0%,100%{opacity:1;}50%{opacity:0.5;}}';document.head.appendChild(s);})();
var tok=null,ultimoDia=null,recorder=null,chunks=[],gravando=false,arquivosPendentes=[],darkMode=false;
function fmtH(d){var hh=String(d.getHours()).padStart(2,'0'),mm=String(d.getMinutes()).padStart(2,'0'),dias=['dom','lun','mar','mie','jue','vie','sab'],dn=String(d.getDate()).padStart(2,'0'),mes=String(d.getMonth()+1).padStart(2,'0');return dias[d.getDay()]+' '+dn+'/'+mes+' '+hh+':'+mm;}
function fmtD(d){var a=new Date();if(d.toDateString()===a.toDateString())return 'hoy';var o=new Date(a);o.setDate(o.getDate()-1);if(d.toDateString()===o.toDateString())return 'ayer';var m=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],dias=['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];return dias[d.getDay()]+' '+d.getDate()+' de '+m[d.getMonth()];}
function aplicarDark(ativo){darkMode=ativo;var w=document.getElementById('lucia-widget');var btn=document.getElementById('lw-btn-dark');if(w){if(ativo)w.classList.add('dark');else w.classList.remove('dark');}if(btn)btn.textContent=ativo?'MODO DIA':'MODO NOCHE';}
function salvarDark(ativo){if(window.rvDark)window.rvDark.toggle(ativo);if(!tok)return;fetch(API+'/preferencias',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+tok},body:JSON.stringify({dark_mode:ativo})}).catch(function(){});}
function addMsg(tipo,texto){var cont=document.getElementById('lw-msgs'),agora=new Date();if(tipo==='sis'){var d=document.createElement('div');d.className='lw-msg sis';d.textContent=texto;cont.appendChild(d);}else{var ds=agora.toDateString();if(ultimoDia!==ds){ultimoDia=ds;var s=document.createElement('div');s.className='lw-sep';s.textContent=fmtD(agora);cont.appendChild(s);}var w=document.createElement('div');w.className='lw-wrap '+tipo;var m=document.createElement('div');m.className='lw-msg '+tipo;m.textContent=texto;if(tipo==='lucia'){var btnV=document.createElement('button');btnV.textContent='🔊';btnV.title='Escuchar';btnV.style.cssText='background:none;border:none;cursor:pointer;font-size:11px;padding:2px 4px;opacity:0.5;vertical-align:middle;margin-left:4px';(function(t,b){b.addEventListener('click',function(){tocarVoz(t,b);});})(texto,btnV);var ts=document.createElement('div');ts.className='lw-ts';ts.style.display='flex';ts.style.alignItems='center';ts.textContent=fmtH(agora);ts.appendChild(btnV);w.appendChild(m);w.appendChild(ts);try{rvFeedback(texto,w);}catch(e){}}else{var ts2=document.createElement('div');ts2.className='lw-ts';ts2.textContent=fmtH(agora);w.appendChild(m);w.appendChild(ts2);}cont.appendChild(w);}cont.scrollTop=cont.scrollHeight;}
function addMsgHist(tipo,texto,timestamp){var cont=document.getElementById('lw-msgs'),data=new Date(timestamp);var ds=data.toDateString();if(ultimoDia!==ds){ultimoDia=ds;var s=document.createElement('div');s.className='lw-sep';s.textContent=fmtD(data);cont.appendChild(s);}var w=document.createElement('div');w.className='lw-wrap '+tipo;var m=document.createElement('div');m.className='lw-msg '+tipo;m.textContent=texto;if(tipo==='lucia'){var btnV=document.createElement('button');btnV.textContent='🔊';btnV.title='Escuchar';btnV.style.cssText='background:none;border:none;cursor:pointer;font-size:11px;padding:2px 4px;opacity:0.5;vertical-align:middle;margin-left:4px';(function(t,b){b.addEventListener('click',function(){tocarVoz(t,b);});})(texto,btnV);var ts=document.createElement('div');ts.className='lw-ts';ts.style.display='flex';ts.style.alignItems='center';ts.textContent=fmtH(data);ts.appendChild(btnV);w.appendChild(m);w.appendChild(ts);}else{var ts2=document.createElement('div');ts2.className='lw-ts';ts2.textContent=fmtH(data);w.appendChild(m);w.appendChild(ts2);}cont.appendChild(w);cont.scrollTop=cont.scrollHeight;}
function addMsgEl(tipo,el){var cont=document.getElementById('lw-msgs'),agora=new Date();var ds=agora.toDateString();if(ultimoDia!==ds){ultimoDia=ds;var s=document.createElement('div');s.className='lw-sep';s.textContent=fmtD(agora);cont.appendChild(s);}var w=document.createElement('div');w.className='lw-wrap '+tipo;var t=document.createElement('div');t.className='lw-ts';t.textContent=fmtH(agora);w.appendChild(el);w.appendChild(t);cont.appendChild(w);cont.scrollTop=cont.scrollHeight;}
function dig(){var cont=document.getElementById('lw-msgs'),d=document.createElement('div');d.className='lw-dig';d.textContent='Lucia esta escribiendo...';cont.appendChild(d);cont.scrollTop=cont.scrollHeight;return d;}
function rvFeedback(texto,wrap){
  if(!wrap||!texto||texto.length<25)return; // só em respostas substanciais
  if(wrap.querySelector('.lw-fb'))return;
  var bar=document.createElement('div');bar.className='lw-fb';
  bar.style.cssText='display:flex;gap:14px;flex-wrap:wrap;margin:2px 0 2px 2px;font-size:11px;font-style:italic;color:rgba(139,90,43,.55);';
  var opts=[{t:'Me ayud\u00f3',k:'me_ayudo'},{t:'No tanto',k:'no_me_ayudo'},{t:'Me tranquiliz\u00f3',k:'tranquilidad'},{t:'Guardar',k:'guardar_consejo'}];
  opts.forEach(function(o){
    var a=document.createElement('span');a.textContent=o.t;a.style.cssText='cursor:pointer;border-bottom:1px dotted rgba(139,90,43,.35);';
    a.addEventListener('click',function(){
      if(a.getAttribute('data-done')==='1')return;
      var payload={tipo:o.k,canal:'web'};
      if(o.k==='guardar_consejo')payload.texto_lucia=texto;
      fetch(API+'/feedback/mensagem',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+tok},body:JSON.stringify(payload)}).then(function(r){return r.json();}).then(function(){
        bar.querySelectorAll('span').forEach(function(x){x.setAttribute('data-done','1');x.style.cursor='default';x.style.borderBottom='none';});
        if(o.k==='guardar_consejo'){
          bar.querySelectorAll('span').forEach(function(x){x.style.opacity='0';});
          a.style.opacity='1';a.style.fontWeight='600';a.style.color='#b8543a';a.textContent='\u2713 Guardado en Mi Progreso';
        }
        var espera=(o.k==='guardar_consejo')?1400:350;
        bar.style.transition='opacity .5s ease';
        setTimeout(function(){bar.style.opacity='0';setTimeout(function(){if(bar&&bar.parentNode)bar.parentNode.removeChild(bar);},550);},espera);
      }).catch(function(){a.textContent='\u2717';});
    });
    bar.appendChild(a);
  });
  wrap.appendChild(bar);
}
function rvScrollFim(){var fim=Date.now()+3500;var iv=setInterval(function(){var c=document.getElementById('lw-msgs');if(c)c.scrollTop=c.scrollHeight;if(Date.now()>fim)clearInterval(iv);},150);}
function setTok(n){document.getElementById('lw-tok').textContent='Mensajes restantes hoy: '+n;}
var _audioAtual=null,_btnAtual=null;
function _resetBtnVoz(b){if(b){b.textContent='\ud83d\udd0a';b.disabled=false;}}
function tocarVoz(texto,btn){
  // Se clicou no botao que JA esta ativo: alterna pausa/retoma sem refazer download
  if(_audioAtual&&_btnAtual===btn){
    if(_audioAtual.paused){_audioAtual.play();btn.textContent='\u23f8';}
    else{_audioAtual.pause();btn.textContent='\u25b6';}
    return;
  }
  // Clicou num botao novo: para o anterior e restaura o icone dele
  if(_audioAtual){_audioAtual.pause();try{if(_audioAtual._url)URL.revokeObjectURL(_audioAtual._url);}catch(e){}_audioAtual=null;}
  _resetBtnVoz(_btnAtual);
  _btnAtual=btn;
  btn.textContent='\u22ef';btn.disabled=true;
  fetch(API+'/voz',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+tok},body:JSON.stringify({texto:texto})}).then(function(res){if(!res.ok)throw new Error('Erro');return res.blob();}).then(function(blob){
    var url=URL.createObjectURL(blob);var audio=new Audio(url);audio._url=url;_audioAtual=audio;
    btn.disabled=false;btn.textContent='\u23f8';
    audio.play();
    audio.onended=function(){URL.revokeObjectURL(url);if(_audioAtual===audio)_audioAtual=null;_resetBtnVoz(btn);if(_btnAtual===btn)_btnAtual=null;};
  }).catch(function(){btn.textContent='\u2717';btn.disabled=false;setTimeout(function(){_resetBtnVoz(btn);},3000);if(_btnAtual===btn)_btnAtual=null;});
}
function mostrarPreview(arquivos){
  for(var i=0;i<arquivos.length;i++){
    var jaExiste=false;
    for(var j=0;j<arquivosPendentes.length;j++){
      if(arquivosPendentes[j].name===arquivos[i].name&&arquivosPendentes[j].size===arquivos[i].size){jaExiste=true;break;}
    }
    if(!jaExiste)arquivosPendentes.push(arquivos[i]);
  }
  renderizarPreviews();
}
function renderizarPreviews(){
  var prev=document.getElementById('lw-preview');
  prev.innerHTML='';
  if(arquivosPendentes.length===0){prev.style.display='none';return;}
  prev.style.display='flex';
  prev.style.alignItems='center';
  prev.style.gap='8px';
  prev.style.flexWrap='wrap';
  for(var i=0;i<arquivosPendentes.length;i++){
    (function(idx){
      var arq=arquivosPendentes[idx];
      var item=document.createElement('div');
      item.style.cssText='display:flex;align-items:center;gap:4px;background:rgba(122,75,50,0.08);padding:4px 8px;border-radius:8px';
      if(arq.type.startsWith('image/')){
        var img=document.createElement('img');
        img.src=URL.createObjectURL(arq);
        img.style.cssText='max-height:40px;border-radius:4px;display:block';
        item.appendChild(img);
      }else{
        var sp=document.createElement('span');
        sp.textContent=arq.name;
        sp.style.cssText='font-size:12px;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
        item.appendChild(sp);
      }
      var btn=document.createElement('button');
      btn.textContent='x';
      btn.style.cssText='background:none;border:none;color:#B8543A;font-size:16px;cursor:pointer;padding:0 2px;line-height:1';
      btn.addEventListener('click',function(){
        arquivosPendentes.splice(idx,1);
        renderizarPreviews();
        if(arquivosPendentes.length===0)document.getElementById('lw-file').value='';
      });
      item.appendChild(btn);
      prev.appendChild(item);
    })(i);
  }
}
function cancelarPreview(){arquivosPendentes=[];var prev=document.getElementById('lw-preview');prev.style.display='none';prev.innerHTML='';document.getElementById('lw-file').value='';}
function entrarComToken(){var _t;try{_t=sessionStorage.getItem('rv_token');}catch(e){}if(!_t)return false;tok=_t;document.getElementById('lw-login').style.display='none';var chat=document.getElementById('lw-chat');chat.style.display='flex';chat.style.flexDirection='column';fetch(API+'/historico',{headers:{'Authorization':'Bearer '+tok}}).then(function(r){if(!r.ok)throw new Error('token');return r.json();}).then(function(hist){if(hist.mensagens&&hist.mensagens.length){hist.mensagens.forEach(function(m){var tipo=(m.role==='lucia'||m.role==='assistant')?'lucia':'user';var conteudo=typeof m.content==='string'?m.content:(m.content&&m.content[0]&&m.content[0].text)||'';var ts=m.timestamp||m.created_at||Date.now();if(conteudo&&conteudo.indexOf('[DOCUMENTO:')===0){var match=conteudo.match(/\[DOCUMENTO:\s*([^\]]+)\]/);var nome=match?match[1].trim():'archivo';conteudo='\ud83d\udcce '+nome;}if(conteudo)addMsgHist(tipo,conteudo,ts);});var sep=document.createElement('div');sep.className='lw-sep';sep.textContent='\u2014 hoy \u2014';sep.style.marginTop='16px';document.getElementById('lw-msgs').appendChild(sep);ultimoDia=new Date().toDateString();rvScrollFim();}}).catch(function(){}).then(function(){var d=dig();var agoraTs=Date.now();var ultimoTs=parseInt(sessionStorage.getItem('lw_ultimo_acesso_'+tok)||'0');var diffMin=(agoraTs-ultimoTs)/60000;sessionStorage.setItem('lw_ultimo_acesso_'+tok,String(agoraTs));var msgAbertura;if(ultimoTs===0||diffMin>480){msgAbertura='[abertura_sesion]';}else if(diffMin>60){msgAbertura='[retorno_breve]';}else{if(d)d.remove();document.getElementById('lw-input').focus();return Promise.resolve();}return fetch(API+'/chat',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+tok},body:JSON.stringify({mensagem:msgAbertura})}).then(function(r){return r.json();}).then(function(rd){if(d)d.remove();if(rd.texto){addMsg('lucia',rd.texto);setTok(rd.tokens_remaining||'--');rvScrollFim();}document.getElementById('lw-input').focus();});}).catch(function(){try{sessionStorage.removeItem('rv_token');}catch(e){}document.getElementById('lw-login').style.display='';document.getElementById('lw-chat').style.display='none';tok=null;});return true;}
function entrar(){var codigo=document.getElementById('lw-codigo').value.trim().toUpperCase(),erroEl=document.getElementById('lw-erro'),btn=document.getElementById('lw-entrar');erroEl.textContent='';if(!codigo){erroEl.textContent='Pon tu codigo';return;}btn.disabled=true;btn.textContent='Entrando...';fetch(API+'/auth/validate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({access_code:codigo})}).then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.error||'Codigo invalido');return data;});}).then(function(data){tok=data.token;try{sessionStorage.setItem('rv_token',data.token);}catch(e){}if(data.user&&data.user.dark_mode)aplicarDark(true);document.getElementById('lw-login').style.display='none';var chat=document.getElementById('lw-chat');chat.style.display='flex';chat.style.flexDirection='column';return fetch(API+'/historico',{headers:{'Authorization':'Bearer '+tok}}).then(function(r){return r.json();}).then(function(hist){if(hist.mensagens&&hist.mensagens.length){hist.mensagens.forEach(function(m){var tipo=(m.role==='lucia'||m.role==='assistant')?'lucia':'user';var conteudo=typeof m.content==='string'?m.content:(m.content&&m.content[0]&&m.content[0].text)||'';var ts=m.timestamp||m.created_at||Date.now();if(conteudo&&conteudo.indexOf('[DOCUMENTO:')===0){var match=conteudo.match(/\[DOCUMENTO:\s*([^\]]+)\]/);var nome=match?match[1].trim():'archivo';conteudo='📎 '+nome;}if(conteudo)addMsgHist(tipo,conteudo,ts);});var sep=document.createElement('div');sep.className='lw-sep';sep.textContent='— hoy —';sep.style.marginTop='16px';document.getElementById('lw-msgs').appendChild(sep);ultimoDia=new Date().toDateString();rvScrollFim();}}).catch(function(){}).then(function(){var d=dig();var agoraTs=Date.now();var ultimoTs=parseInt(sessionStorage.getItem('lw_ultimo_acesso_'+tok)||'0');var diffMin=(agoraTs-ultimoTs)/60000;sessionStorage.setItem('lw_ultimo_acesso_'+tok,String(agoraTs));var msgAbertura;if(ultimoTs===0||diffMin>480){msgAbertura='[abertura_sesion]';}else if(diffMin>60){msgAbertura='[retorno_breve]';}else{d.remove();document.getElementById('lw-input').focus();return Promise.resolve();}return fetch(API+'/chat',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+tok},body:JSON.stringify({mensagem:msgAbertura})}).then(function(r){return r.json();}).then(function(rd){d.remove();if(rd.texto){addMsg('lucia',rd.texto);setTok(rd.tokens_remaining||'--');rvScrollFim();}document.getElementById('lw-input').focus();});});}).catch(function(err){erroEl.textContent=err.message;btn.disabled=false;btn.textContent='Entrar';});}
function enviarArquivos(arquivos,textoExtra){
  var d=dig();
  document.getElementById('lw-btn-enviar').disabled=true;
  var conteudos=[];
  var pendentes=arquivos.length;
  var erro=false;
  for(var i=0;i<arquivos.length;i++){
    (function(idx,arq){
      var formData=new FormData();
      formData.append('arquivo',arq);
      fetch(API+'/documento/upload',{method:'POST',headers:{'Authorization':'Bearer '+tok},body:formData})
      .then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.error||'Erro no upload');return data;});})
      .then(function(data){conteudos[idx]={nome:arq.name,tipo:arq.type,conteudo:data.conteudo,arquivo:arq};})
      .catch(function(err){if(!erro){erro=true;d.remove();addMsg('sis','Error: '+err.message);document.getElementById('lw-btn-enviar').disabled=false;}})
      .then(function(){
        pendentes--;
        if(pendentes===0&&!erro){
          var msg=document.createElement('div');
          msg.className='lw-msg user';
          for(var c=0;c<conteudos.length;c++){
            if(conteudos[c].tipo.startsWith('image/')){
              var img=document.createElement('img');
              img.src=URL.createObjectURL(conteudos[c].arquivo);
              img.style.cssText='max-width:200px;max-height:200px;border-radius:8px;display:block;margin-bottom:4px';
              msg.appendChild(img);
            }else{
              var sp=document.createElement('span');
              sp.textContent='[archivo] '+conteudos[c].nome;
              sp.style.cssText='display:block;margin-bottom:4px;font-size:13px';
              msg.appendChild(sp);
            }
          }
          if(textoExtra){
            var txt=document.createElement('div');
            txt.textContent=textoExtra;
            txt.style.cssText='margin-top:4px';
            msg.appendChild(txt);
          }
          addMsgEl('user',msg);
          var mensagemPartes=[];
          for(var c=0;c<conteudos.length;c++){
            mensagemPartes.push('[DOCUMENTO: '+conteudos[c].nome+']'+String.fromCharCode(10)+conteudos[c].conteudo);
          }
          var mensagem=mensagemPartes.join(String.fromCharCode(10)+String.fromCharCode(10));
          if(textoExtra)mensagem+=String.fromCharCode(10)+String.fromCharCode(10)+textoExtra;
          fetch(API+'/chat',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+tok},body:JSON.stringify({mensagem:mensagem})})
          .then(function(r){return r.json();})
          .then(function(dataChat){d.remove();if(!dataChat.texto)throw new Error(dataChat.error||'Erro');addMsg('lucia',dataChat.texto);setTok(dataChat.tokens_remaining);})
          .catch(function(err){d.remove();addMsg('sis','Error: '+err.message);})
          .then(function(){document.getElementById('lw-btn-enviar').disabled=false;});
        }
      });
    })(i,arquivos[i]);
  }
}
var _dbFila=[], _dbTimer=null, _dbDig=null;
var _DB_DELAY=6000;
function _dbArmar(){if(_dbTimer)clearTimeout(_dbTimer);_dbTimer=setTimeout(_dbFlush,_DB_DELAY);}
function _dbFlush(){
  _dbTimer=null;
  if(!_dbFila.length){if(_dbDig){_dbDig.remove();_dbDig=null;}return;}
  var texto=_dbFila.join('\n');
  _dbFila=[];
  document.getElementById('lw-btn-enviar').disabled=true;
  fetch(API+'/chat',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+tok},body:JSON.stringify({mensagem:texto})}).then(function(res){return res.json();}).then(function(data){if(_dbDig){_dbDig.remove();_dbDig=null;}if(!data.texto)throw new Error(data.error||'Erro');addMsg('lucia',data.texto);setTok(data.tokens_remaining);}).catch(function(err){if(_dbDig){_dbDig.remove();_dbDig=null;}addMsg('sis','Error: '+err.message);}).then(function(){document.getElementById('lw-btn-enviar').disabled=false;document.getElementById('lw-input').focus();});
}
function enviar(jaAgora){var inp=document.getElementById('lw-input'),texto=inp.value.trim();
if(arquivosPendentes.length>0){
  var arquivos=arquivosPendentes.slice();
  arquivosPendentes=[];
  cancelarPreview();
  inp.value='';
  if(_dbTimer){clearTimeout(_dbTimer);_dbTimer=null;}
  if(_dbFila.length)_dbFlush();
  enviarArquivos(arquivos,texto);
  return;
}
if(!texto)return;
inp.value='';
if(_dbDig){_dbDig.remove();_dbDig=null;}
addMsg('user',texto);
_dbFila.push(texto);
_dbDig=dig();
if(jaAgora===true){if(_dbTimer){clearTimeout(_dbTimer);_dbTimer=null;}_dbFlush();}
else{_dbArmar();}
}
function toggleMic(){if(!gravando){navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){chunks=[];recorder=new MediaRecorder(stream);recorder.ondataavailable=function(e){if(e.data.size>0)chunks.push(e.data);};recorder.onstop=function(){stream.getTracks().forEach(function(t){t.stop();});enviarAudio(new Blob(chunks,{type:'audio/webm'}));};recorder.start();gravando=true;document.getElementById('lw-btn-mic').classList.add('lw-btn-mic-gravando');document.getElementById('lw-btn-mic').textContent='🛑';}).catch(function(){addMsg('sis','No se pudo acceder al microfono');});}else{recorder.stop();gravando=false;document.getElementById('lw-btn-mic').classList.remove('lw-btn-mic-gravando');document.getElementById('lw-btn-mic').textContent='🎤';}}
function enviarAudio(blob){var d=dig();document.getElementById('lw-btn-enviar').disabled=true;document.getElementById('lw-btn-mic').disabled=true;var formData=new FormData();formData.append('audio',blob,'audio.webm');fetch(API+'/audio/transcribe',{method:'POST',headers:{'Authorization':'Bearer '+tok},body:formData}).then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.error||'Erro');return data;});}).then(function(dataT){d.remove();var inp=document.getElementById('lw-input');inp.value=dataT.texto;inp.focus();}).catch(function(err){d.remove();addMsg('sis','Error: '+err.message);}).then(function(){document.getElementById('lw-btn-enviar').disabled=false;document.getElementById('lw-btn-mic').disabled=false;});}
function init(){if(!document.getElementById('lw-entrar')){setTimeout(init,200);return;}entrarComToken();
document.getElementById('lw-codigo').addEventListener('input',function(){this.value=this.value.toUpperCase();});
document.getElementById('lw-input').addEventListener('keydown',function(e){if(e.key==='Enter'){enviar();}else if(_dbTimer){_dbArmar();}});
document.getElementById('lw-entrar').addEventListener('click',entrar);
document.getElementById('lw-btn-enviar').addEventListener('click',enviar);
document.getElementById('lw-file').setAttribute('multiple','multiple');
document.getElementById('lw-btn-anexo').addEventListener('click',function(){document.getElementById('lw-file').value='';document.getElementById('lw-file').click();});
document.getElementById('lw-file').addEventListener('change',function(){if(this.files&&this.files.length>0)mostrarPreview(Array.prototype.slice.call(this.files));});
document.getElementById('lw-btn-mic').addEventListener('click',toggleMic);
var btnDark=document.getElementById('lw-btn-dark');if(btnDark)btnDark.addEventListener('click',function(){var novo=!darkMode;aplicarDark(novo);salvarDark(novo);});}
function rvVitrineMontar(){
  if(document.getElementById('lw-btn-ayuda')) return;
  var mic=document.getElementById('lw-btn-mic');
  if(!mic||!mic.parentNode) return;
  var A=[{i:'\ud83d\udcf8',l:'Revisar foto de mi plato',f:true,m:'Quiero que revises una foto de mi plato.'},{i:'\ud83d\udcdf',l:'Leer mi gluc\u00f3metro',f:true,m:'Quiero mostrarte la foto de mi gluc\u00f3metro o decirte mi n\u00famero.'},{i:'\ud83e\uddfe',l:'Revisar una etiqueta',f:true,m:'Quiero que revises la etiqueta de un producto.'},{i:'\ud83d\uded2',l:'Comer sano con poco dinero',f:false,m:'Quiero comer sano pero no me alcanza mucho. Ay\u00fadame con algo barato.'},{i:'\ud83e\uddb6',l:'Revisar un s\u00edntoma',f:false,m:'Quiero contarte un s\u00edntoma que estoy sintiendo.'},{i:'\ud83e\udde0',l:'Calmarme cuando tengo miedo',f:false,m:'Tengo miedo y quiero que me ayudes a calmarme.'},{i:'\ud83d\udc69\u200d\u2695\ufe0f',l:'Preparar mi consulta',f:false,m:'Ay\u00fadame a preparar mis dudas para mi pr\u00f3xima consulta m\u00e9dica.'},{i:'\ud83c\udf31',l:'Recordar mi avance',f:false,m:'Quiero recordar lo que ya hice y ver mi avance.'}];
  function disp(a){var pan=document.getElementById('lw-ayuda-panel');if(pan)pan.style.display='none';var bt=document.getElementById('lw-btn-ayuda');if(bt)bt.setAttribute('data-open','0');var inp=document.getElementById('lw-input');if(!inp)return;inp.value=a.m;if(typeof enviar==='function')enviar(true);if(a.f){setTimeout(function(){var x=document.getElementById('lw-btn-anexo');if(x)x.click();},700);}}
  // botão lâmpada (clona o estilo do mic pra ficar igual)
  var btn=document.createElement('button');
  btn.id='lw-btn-ayuda';btn.type='button';btn.title='\u00bfEn qu\u00e9 te ayudo?';btn.textContent='\ud83d\udca1';btn.setAttribute('data-open','0');
  if(mic.className)btn.className=mic.className;
  // painel flutuante (fica fixo acima da barra)
  var panel=document.createElement('div');panel.id='lw-ayuda-panel';
  panel.style.cssText='display:none;position:absolute;left:12px;right:12px;bottom:72px;z-index:50;background:#fff;border:1px solid rgba(168,130,62,.35);border-radius:16px;box-shadow:0 -6px 24px rgba(42,28,14,.16);padding:12px;max-height:60vh;overflow-y:auto;';
  var titulo=document.createElement('div');titulo.textContent='\u00bfEn qu\u00e9 te ayudo?';titulo.style.cssText='text-align:center;font-family:inherit;font-size:13px;font-weight:700;color:#b8543a;margin-bottom:10px;letter-spacing:.2px;';panel.appendChild(titulo);
  var grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:8px;';
  A.forEach(function(a){var b=document.createElement('button');b.type='button';b.style.cssText='display:flex;align-items:center;gap:8px;text-align:left;background:#fbf7ef;border:1px solid rgba(168,130,62,.35);border-radius:12px;padding:11px 12px;font-family:inherit;font-size:12.5px;font-weight:600;color:#2b1810;cursor:pointer;line-height:1.25;';var s1=document.createElement('span');s1.style.cssText='font-size:17px;flex-shrink:0;';s1.textContent=a.i;var s2=document.createElement('span');s2.textContent=a.l;b.appendChild(s1);b.appendChild(s2);b.addEventListener('click',function(){disp(a);});grid.appendChild(b);});
  panel.appendChild(grid);
  btn.addEventListener('click',function(){var open=btn.getAttribute('data-open')==='1';if(open){panel.style.display='none';btn.setAttribute('data-open','0');}else{panel.style.display='block';btn.setAttribute('data-open','1');}});
  // fecha ao clicar fora
  document.addEventListener('click',function(ev){if(panel.style.display==='block'&&ev.target!==btn&&!panel.contains(ev.target)&&!btn.contains(ev.target)){panel.style.display='none';btn.setAttribute('data-open','0');}});
  // insere a lâmpada à esquerda do mic
  mic.parentNode.insertBefore(btn,mic);
  // o painel precisa de um pai posicionado; usa o container do chat
  var chat=document.getElementById('lw-chat');
  if(chat){var cs=window.getComputedStyle(chat);if(cs.position==='static')chat.style.position='relative';chat.appendChild(panel);}else{mic.parentNode.appendChild(panel);}
}
function rvVitrineEsperar(){var n=0;var iv=setInterval(function(){n++;if(n>600){clearInterval(iv);return;}var c=document.getElementById('lw-chat');var mic=document.getElementById('lw-btn-mic');if(c&&c.style.display!=='none'&&mic){clearInterval(iv);rvVitrineMontar();}},400);}
window.luciaEnviar=function(t){var inp=document.getElementById('lw-input');if(!inp){setTimeout(function(){window.luciaEnviar(t);},400);return;}inp.value=t;if(typeof enviar==='function')enviar(true);};
rvVitrineEsperar();
init();
})();
