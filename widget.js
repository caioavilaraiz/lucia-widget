(function(){
var API='https://lucia-backend.vercel.app';
(function(){var s=document.createElement('style');s.textContent='.lw-btn-mic-gravando{background:#c0392b!important;color:#fff!important;animation:lw-pulso 1s infinite;}@keyframes lw-pulso{0%,100%{opacity:1;}50%{opacity:0.5;}}';document.head.appendChild(s);})();
var tok=null,ultimoDia=null,recorder=null,chunks=[],gravando=false,arquivosPendentes=[],darkMode=false;
function fmtH(d){var hh=String(d.getHours()).padStart(2,'0'),mm=String(d.getMinutes()).padStart(2,'0'),dias=['dom','lun','mar','mie','jue','vie','sab'],dn=String(d.getDate()).padStart(2,'0'),mes=String(d.getMonth()+1).padStart(2,'0');return dias[d.getDay()]+' '+dn+'/'+mes+' '+hh+':'+mm;}
function fmtD(d){var a=new Date();if(d.toDateString()===a.toDateString())return 'hoy';var o=new Date(a);o.setDate(o.getDate()-1);if(d.toDateString()===o.toDateString())return 'ayer';var m=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],dias=['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];return dias[d.getDay()]+' '+d.getDate()+' de '+m[d.getMonth()];}
function aplicarDark(ativo){darkMode=ativo;var w=document.getElementById('lucia-widget');var btn=document.getElementById('lw-btn-dark');if(w){if(ativo)w.classList.add('dark');else w.classList.remove('dark');}if(btn)btn.textContent=ativo?'MODO DIA':'MODO NOCHE';}
function salvarDark(ativo){if(window.rvDark)window.rvDark.toggle(ativo);if(!tok)return;fetch(API+'/preferencias',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+tok},body:JSON.stringify({dark_mode:ativo})}).catch(function(){});}
function addMsg(tipo,texto){var cont=document.getElementById('lw-msgs'),agora=new Date();if(tipo==='sis'){var d=document.createElement('div');d.className='lw-msg sis';d.textContent=texto;cont.appendChild(d);}else{var ds=agora.toDateString();if(ultimoDia!==ds){ultimoDia=ds;var s=document.createElement('div');s.className='lw-sep';s.textContent=fmtD(agora);cont.appendChild(s);}var w=document.createElement('div');w.className='lw-wrap '+tipo;var m=document.createElement('div');m.className='lw-msg '+tipo;m.textContent=texto;if(tipo==='lucia'){var btnV=document.createElement('button');btnV.textContent='🔊';btnV.title='Escuchar';btnV.style.cssText='background:none;border:none;cursor:pointer;font-size:11px;padding:2px 4px;opacity:0.5;vertical-align:middle;margin-left:4px';(function(t,b){b.addEventListener('click',function(){tocarVoz(t,b);});})(texto,btnV);var ts=document.createElement('div');ts.className='lw-ts';ts.style.display='flex';ts.style.alignItems='center';ts.textContent=fmtH(agora);ts.appendChild(btnV);w.appendChild(m);w.appendChild(ts);}else{var ts2=document.createElement('div');ts2.className='lw-ts';ts2.textContent=fmtH(agora);w.appendChild(m);w.appendChild(ts2);}cont.appendChild(w);}cont.scrollTop=cont.scrollHeight;}
function addMsgHist(tipo,texto,timestamp){var cont=document.getElementById('lw-msgs'),data=new Date(timestamp);var ds=data.toDateString();if(ultimoDia!==ds){ultimoDia=ds;var s=document.createElement('div');s.className='lw-sep';s.textContent=fmtD(data);cont.appendChild(s);}var w=document.createElement('div');w.className='lw-wrap '+tipo;var m=document.createElement('div');m.className='lw-msg '+tipo;m.textContent=texto;if(tipo==='lucia'){var btnV=document.createElement('button');btnV.textContent='🔊';btnV.title='Escuchar';btnV.style.cssText='background:none;border:none;cursor:pointer;font-size:11px;padding:2px 4px;opacity:0.5;vertical-align:middle;margin-left:4px';(function(t,b){b.addEventListener('click',function(){tocarVoz(t,b);});})(texto,btnV);var ts=document.createElement('div');ts.className='lw-ts';ts.style.display='flex';ts.style.alignItems='center';ts.textContent=fmtH(data);ts.appendChild(btnV);w.appendChild(m);w.appendChild(ts);}else{var ts2=document.createElement('div');ts2.className='lw-ts';ts2.textContent=fmtH(data);w.appendChild(m);w.appendChild(ts2);}cont.appendChild(w);cont.scrollTop=cont.scrollHeight;}
function addMsgEl(tipo,el){var cont=document.getElementById('lw-msgs'),agora=new Date();var ds=agora.toDateString();if(ultimoDia!==ds){ultimoDia=ds;var s=document.createElement('div');s.className='lw-sep';s.textContent=fmtD(agora);cont.appendChild(s);}var w=document.createElement('div');w.className='lw-wrap '+tipo;var t=document.createElement('div');t.className='lw-ts';t.textContent=fmtH(agora);w.appendChild(el);w.appendChild(t);cont.appendChild(w);cont.scrollTop=cont.scrollHeight;}
function dig(){var cont=document.getElementById('lw-msgs'),d=document.createElement('div');d.className='lw-dig';d.textContent='Lucia esta escribiendo...';cont.appendChild(d);cont.scrollTop=cont.scrollHeight;return d;}
function setTok(n){document.getElementById('lw-tok').textContent='Mensajes restantes hoy: '+n;}
var _audioAtual=null;function tocarVoz(texto,btn){if(_audioAtual){_audioAtual.pause();_audioAtual=null;}var orig=btn.textContent;btn.textContent='...';btn.disabled=true;fetch(API+'/voz',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+tok},body:JSON.stringify({texto:texto})}).then(function(res){if(!res.ok)throw new Error('Erro');return res.blob();}).then(function(blob){var url=URL.createObjectURL(blob);var audio=new Audio(url);_audioAtual=audio;audio.play();audio.onended=function(){URL.revokeObjectURL(url);_audioAtual=null;btn.textContent=orig;btn.disabled=false;};}).catch(function(){btn.textContent='X';btn.disabled=false;setTimeout(function(){btn.textContent=orig;},3000);});}
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
function entrarComToken(){var _t;try{_t=sessionStorage.getItem('rv_token');}catch(e){}if(!_t)return false;tok=_t;document.getElementById('lw-login').style.display='none';var chat=document.getElementById('lw-chat');chat.style.display='flex';chat.style.flexDirection='column';fetch(API+'/historico',{headers:{'Authorization':'Bearer '+tok}}).then(function(r){if(!r.ok)throw new Error('token');return r.json();}).then(function(hist){if(hist.mensagens&&hist.mensagens.length){hist.mensagens.forEach(function(m){var tipo=(m.role==='lucia'||m.role==='assistant')?'lucia':'user';var conteudo=typeof m.content==='string'?m.content:(m.content&&m.content[0]&&m.content[0].text)||'';var ts=m.timestamp||m.created_at||Date.now();if(conteudo&&conteudo.indexOf('[DOCUMENTO:')===0){var match=conteudo.match(/\[DOCUMENTO:\s*([^\]]+)\]/);var nome=match?match[1].trim():'archivo';conteudo='\ud83d\udcce '+nome;}if(conteudo)addMsgHist(tipo,conteudo,ts);});var sep=document.createElement('div');sep.className='lw-sep';sep.textContent='\u2014 hoy \u2014';sep.style.marginTop='16px';document.getElementById('lw-msgs').appendChild(sep);ultimoDia=new Date().toDateString();var _c=document.getElementById('lw-msgs');if(_c)setTimeout(function(){_c.scrollTop=_c.scrollHeight;},50);}}).catch(function(){}).then(function(){var d=dig();var agoraTs=Date.now();var ultimoTs=parseInt(sessionStorage.getItem('lw_ultimo_acesso_'+tok)||'0');var diffMin=(agoraTs-ultimoTs)/60000;sessionStorage.setItem('lw_ultimo_acesso_'+tok,String(agoraTs));var msgAbertura;if(ultimoTs===0||diffMin>480){msgAbertura='[abertura_sesion]';}else if(diffMin>60){msgAbertura='[retorno_breve]';}else{if(d)d.remove();document.getElementById('lw-input').focus();return Promise.resolve();}return fetch(API+'/chat',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+tok},body:JSON.stringify({mensagem:msgAbertura})}).then(function(r){return r.json();}).then(function(rd){if(d)d.remove();if(rd.texto){addMsg('lucia',rd.texto);setTok(rd.tokens_remaining||'--');}document.getElementById('lw-input').focus();});}).catch(function(){try{sessionStorage.removeItem('rv_token');}catch(e){}document.getElementById('lw-login').style.display='';document.getElementById('lw-chat').style.display='none';tok=null;});return true;}
function entrar(){var codigo=document.getElementById('lw-codigo').value.trim().toUpperCase(),erroEl=document.getElementById('lw-erro'),btn=document.getElementById('lw-entrar');erroEl.textContent='';if(!codigo){erroEl.textContent='Pon tu codigo';return;}btn.disabled=true;btn.textContent='Entrando...';fetch(API+'/auth/validate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({access_code:codigo})}).then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.error||'Codigo invalido');return data;});}).then(function(data){tok=data.token;try{sessionStorage.setItem('rv_token',data.token);}catch(e){}if(data.user&&data.user.dark_mode)aplicarDark(true);document.getElementById('lw-login').style.display='none';var chat=document.getElementById('lw-chat');chat.style.display='flex';chat.style.flexDirection='column';return fetch(API+'/historico',{headers:{'Authorization':'Bearer '+tok}}).then(function(r){return r.json();}).then(function(hist){if(hist.mensagens&&hist.mensagens.length){hist.mensagens.forEach(function(m){var tipo=(m.role==='lucia'||m.role==='assistant')?'lucia':'user';var conteudo=typeof m.content==='string'?m.content:(m.content&&m.content[0]&&m.content[0].text)||'';var ts=m.timestamp||m.created_at||Date.now();if(conteudo&&conteudo.indexOf('[DOCUMENTO:')===0){var match=conteudo.match(/\[DOCUMENTO:\s*([^\]]+)\]/);var nome=match?match[1].trim():'archivo';conteudo='📎 '+nome;}if(conteudo)addMsgHist(tipo,conteudo,ts);});var sep=document.createElement('div');sep.className='lw-sep';sep.textContent='— hoy —';sep.style.marginTop='16px';document.getElementById('lw-msgs').appendChild(sep);ultimoDia=new Date().toDateString();}}).catch(function(){}).then(function(){var d=dig();var agoraTs=Date.now();var ultimoTs=parseInt(sessionStorage.getItem('lw_ultimo_acesso_'+tok)||'0');var diffMin=(agoraTs-ultimoTs)/60000;sessionStorage.setItem('lw_ultimo_acesso_'+tok,String(agoraTs));var msgAbertura;if(ultimoTs===0||diffMin>480){msgAbertura='[abertura_sesion]';}else if(diffMin>60){msgAbertura='[retorno_breve]';}else{d.remove();document.getElementById('lw-input').focus();return Promise.resolve();}return fetch(API+'/chat',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+tok},body:JSON.stringify({mensagem:msgAbertura})}).then(function(r){return r.json();}).then(function(rd){d.remove();if(rd.texto){addMsg('lucia',rd.texto);setTok(rd.tokens_remaining||'--');}document.getElementById('lw-input').focus();});});}).catch(function(err){erroEl.textContent=err.message;btn.disabled=false;btn.textContent='Entrar';});}
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
function enviar(){if(typeof rvAgendarVitrine==="function")rvAgendarVitrine();var inp=document.getElementById('lw-input'),texto=inp.value.trim();
if(arquivosPendentes.length>0){
  var arquivos=arquivosPendentes.slice();
  arquivosPendentes=[];
  cancelarPreview();
  inp.value='';
  enviarArquivos(arquivos,texto);
  return;
}
if(!texto)return;inp.value='';addMsg('user',texto);var d=dig();document.getElementById('lw-btn-enviar').disabled=true;fetch(API+'/chat',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+tok},body:JSON.stringify({mensagem:texto})}).then(function(res){return res.json();}).then(function(data){d.remove();if(!data.texto)throw new Error(data.error||'Erro');addMsg('lucia',data.texto);setTok(data.tokens_remaining);}).catch(function(err){d.remove();addMsg('sis','Error: '+err.message);}).then(function(){document.getElementById('lw-btn-enviar').disabled=false;document.getElementById('lw-input').focus();});}
function toggleMic(){if(!gravando){navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){chunks=[];recorder=new MediaRecorder(stream);recorder.ondataavailable=function(e){if(e.data.size>0)chunks.push(e.data);};recorder.onstop=function(){stream.getTracks().forEach(function(t){t.stop();});enviarAudio(new Blob(chunks,{type:'audio/webm'}));};recorder.start();gravando=true;document.getElementById('lw-btn-mic').classList.add('lw-btn-mic-gravando');document.getElementById('lw-btn-mic').textContent='🛑';}).catch(function(){addMsg('sis','No se pudo acceder al microfono');});}else{recorder.stop();gravando=false;document.getElementById('lw-btn-mic').classList.remove('lw-btn-mic-gravando');document.getElementById('lw-btn-mic').textContent='🎤';}}
function enviarAudio(blob){var d=dig();document.getElementById('lw-btn-enviar').disabled=true;document.getElementById('lw-btn-mic').disabled=true;var formData=new FormData();formData.append('audio',blob,'audio.webm');fetch(API+'/audio/transcribe',{method:'POST',headers:{'Authorization':'Bearer '+tok},body:formData}).then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.error||'Erro');return data;});}).then(function(dataT){d.remove();var inp=document.getElementById('lw-input');inp.value=dataT.texto;inp.focus();}).catch(function(err){d.remove();addMsg('sis','Error: '+err.message);}).then(function(){document.getElementById('lw-btn-enviar').disabled=false;document.getElementById('lw-btn-mic').disabled=false;});}
function init(){if(!document.getElementById('lw-entrar')){setTimeout(init,200);return;}entrarComToken();
document.getElementById('lw-codigo').addEventListener('input',function(){this.value=this.value.toUpperCase();});
document.getElementById('lw-input').addEventListener('keydown',function(e){if(e.key==='Enter')enviar();});
document.getElementById('lw-entrar').addEventListener('click',entrar);
document.getElementById('lw-btn-enviar').addEventListener('click',enviar);
document.getElementById('lw-file').setAttribute('multiple','multiple');
document.getElementById('lw-btn-anexo').addEventListener('click',function(){document.getElementById('lw-file').value='';document.getElementById('lw-file').click();});
document.getElementById('lw-file').addEventListener('change',function(){if(this.files&&this.files.length>0)mostrarPreview(Array.prototype.slice.call(this.files));});
document.getElementById('lw-btn-mic').addEventListener('click',toggleMic);
var btnDark=document.getElementById('lw-btn-dark');if(btnDark)btnDark.addEventListener('click',function(){var novo=!darkMode;aplicarDark(novo);salvarDark(novo);});}
function rvTemConversa(){var m=document.getElementById('lw-msgs');if(!m)return false;return m.querySelectorAll('.lw-wrap.user, .lw-wrap.lucia').length>0;}
function rvVitrine(){if(rvTemConversa()&&!window.__rvForceVit)return;var A=[{i:'📸',l:'Revisar foto de mi plato',f:true,m:'Quiero que revises una foto de mi plato.'},{i:'📟',l:'Leer mi gluc\u00f3metro',f:true,m:'Quiero mostrarte la foto de mi gluc\u00f3metro o decirte mi n\u00famero.'},{i:'🧾',l:'Revisar una etiqueta',f:true,m:'Quiero que revises la etiqueta de un producto.'},{i:'🛒',l:'Comer sano con poco dinero',f:false,m:'Quiero comer sano pero no me alcanza mucho. Ay\u00fadame con algo barato.'},{i:'🦶',l:'Revisar un s\u00edntoma',f:false,m:'Quiero contarte un s\u00edntoma que estoy sintiendo.'},{i:'🧠',l:'Calmarme cuando tengo miedo',f:false,m:'Tengo miedo y quiero que me ayudes a calmarme.'},{i:'👩‍⚕️',l:'Preparar mi consulta',f:false,m:'Ay\u00fadame a preparar mis dudas para mi pr\u00f3xima consulta m\u00e9dica.'},{i:'🌱',l:'Recordar mi avance',f:false,m:'Quiero recordar lo que ya hice y ver mi avance.'}];function q(){var v=document.getElementById('lw-vitrine');if(v&&v.parentNode)v.parentNode.removeChild(v);}function disp(a){var inp=document.getElementById('lw-input');if(!inp)return;q();inp.value=a.m;if(typeof enviar==='function')enviar();if(a.f){setTimeout(function(){var x=document.getElementById('lw-btn-anexo');if(x)x.click();},700);}}var cont=document.getElementById('lw-msgs');if(!cont)return;var existente=document.getElementById('lw-vitrine');if(existente){cont.appendChild(existente);cont.scrollTop=cont.scrollHeight;return;}var box=document.createElement('div');box.id='lw-vitrine';box.style.cssText='margin:14px 0 6px;padding:0 4px;';var ti=document.createElement('div');ti.textContent='Luc\u00eda puede ayudarte de formas que un PDF no puede. Elige una opci\u00f3n o escr\u00edbeme con tus palabras.';ti.style.cssText='font-size:13px;line-height:1.5;color:#6b5642;text-align:center;margin:0 6px 12px;font-style:italic;';box.appendChild(ti);var grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:8px;';A.forEach(function(a){var b=document.createElement('button');b.type='button';b.style.cssText='display:flex;align-items:center;gap:8px;text-align:left;background:#fbf7ef;border:1px solid rgba(168,130,62,.35);border-radius:12px;padding:11px 12px;font-family:inherit;font-size:12.5px;font-weight:600;color:#2b1810;cursor:pointer;line-height:1.25;';var s1=document.createElement('span');s1.style.cssText='font-size:17px;flex-shrink:0;';s1.textContent=a.i;var s2=document.createElement('span');s2.textContent=a.l;b.appendChild(s1);b.appendChild(s2);b.addEventListener('click',function(){disp(a);});grid.appendChild(b);});box.appendChild(grid);cont.appendChild(box);cont.scrollTop=cont.scrollHeight;}
var _rvVitTimer=null;function rvAgendarVitrine(){if(_rvVitTimer)clearTimeout(_rvVitTimer);_rvVitTimer=setTimeout(function(){var m=document.getElementById('lw-msgs');if(!m)return;var v=document.getElementById('lw-vitrine');if(v)return;var box=document.createElement('div');/*recria via rvVitrine ignorando o guard*/window.__rvForceVit=true;rvVitrine();window.__rvForceVit=false;},720000);}
function rvVitrineEsperar(){var n=0;var iv=setInterval(function(){n++;if(n>60){clearInterval(iv);return;}var c=document.getElementById('lw-chat');var m=document.getElementById('lw-msgs');if(c&&c.style.display!=='none'&&m){clearInterval(iv);setTimeout(rvVitrine,1200);setTimeout(rvVitrine,2600);setTimeout(rvVitrine,5000);}},400);}

window.luciaEnviar=function(t){var inp=document.getElementById('lw-input');if(!inp){setTimeout(function(){window.luciaEnviar(t);},400);return;}inp.value=t;if(typeof enviar==='function')enviar();};
rvVitrineEsperar();
init();
})();
