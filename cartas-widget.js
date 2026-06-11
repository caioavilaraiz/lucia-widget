/* ============================================================
   RAÍZ VIVA — Widget "Personalizar carta con Lucía"
   Injetar via <script> nas 8 páginas das cartas (semana-1..8).
   Requer: usuária logada (token em sessionStorage 'rv_token',
   salvo pelo widget da Lucía).
   ============================================================ */
(function () {
  "use strict";

  // ---- CONFIG ------------------------------------------------
  // URL do backend. Ajuste se for diferente.
  var API = "https://lucia-backend.vercel.app";

  // Detecta a semana pela URL (procura "semana-N"). Fallback: data-semana no script, senão 1.
  function detectarSemana() {
    var m = (location.pathname || "").match(/semana[-\/]?(\d+)/i);
    if (m) return parseInt(m[1], 10);
    var s = document.currentScript && document.currentScript.getAttribute("data-semana");
    if (s) return parseInt(s, 10);
    return 1;
  }

  function getToken() {
    try { return sessionStorage.getItem("rv_token") || ""; } catch (e) { return ""; }
  }

  var SEMANA = detectarSemana();

  // Onde o bloco vai aparecer: procura um elemento com id "rv-cartas-personalizar".
  // Se não existir, cria no fim do <body>.
  function getMount() {
    var el = document.getElementById("rv-cartas-personalizar");
    if (!el) {
      el = document.createElement("div");
      el.id = "rv-cartas-personalizar";
      document.body.appendChild(el);
    }
    return el;
  }

  // ---- ESTILOS ----------------------------------------------
  var CSS = ""
    + "#rv-cp *{box-sizing:border-box;font-family:'Lora',Georgia,serif;}"
    + "#rv-cp{max-width:640px;margin:24px auto;background:#FFFAF0;border:1px solid #E3D5C0;border-radius:18px;padding:28px 24px;box-shadow:0 2px 14px rgba(43,24,16,.05);}"
    + "#rv-cp .rv-cp-tag{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#B8543A;font-weight:700;}"
    + "#rv-cp .rv-cp-tit{font-family:'Playfair Display',Georgia,serif;font-style:italic;font-size:24px;color:#2B1810;margin:8px 0 8px;}"
    + "#rv-cp .rv-cp-sub{font-size:15px;line-height:1.55;color:#5b4636;margin-bottom:18px;}"
    + "#rv-cp .rv-cp-btn{display:inline-block;background:#B8543A;color:#FFFAF0;border:none;border-radius:10px;padding:13px 26px;font-size:15px;font-weight:700;cursor:pointer;}"
    + "#rv-cp .rv-cp-btn:hover{background:#a04a32;}"
    + "#rv-cp .rv-cp-btn[disabled]{opacity:.55;cursor:default;}"
    + "#rv-cp-modal{position:fixed;inset:0;background:rgba(43,24,16,.55);display:none;align-items:center;justify-content:center;z-index:99999;padding:16px;}"
    + "#rv-cp-modal .rv-cp-card{background:#FFFAF0;max-width:520px;width:100%;max-height:90vh;overflow-y:auto;border-radius:18px;padding:26px 22px;}"
    + "#rv-cp-modal h3{font-family:'Playfair Display',Georgia,serif;font-style:italic;font-size:22px;color:#2B1810;margin:0 0 4px;}"
    + "#rv-cp-modal label{display:block;font-size:13px;font-weight:700;color:#5b4636;margin:14px 0 5px;}"
    + "#rv-cp-modal input,#rv-cp-modal select,#rv-cp-modal textarea{width:100%;border:1px solid #E3D5C0;border-radius:9px;padding:11px;font-size:15px;background:#fff;color:#2B1810;}"
    + "#rv-cp-modal textarea{min-height:70px;resize:vertical;}"
    + "#rv-cp-modal .rv-cp-row{display:flex;gap:10px;}"
    + "#rv-cp-modal .rv-cp-row>div{flex:1;}"
    + "#rv-cp-modal .rv-cp-actions{margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;}"
    + "#rv-cp-modal .rv-cp-sec{background:transparent;color:#B8543A;border:1px solid #B8543A;border-radius:10px;padding:13px 20px;font-size:14px;font-weight:700;cursor:pointer;}"
    + "#rv-cp-erro{color:#a02020;font-size:14px;margin-top:10px;min-height:18px;}"
    + "#rv-cp-carta{white-space:pre-wrap;background:#fff;border:1px solid #E3D5C0;border-radius:12px;padding:18px;font-size:15px;line-height:1.6;color:#2B1810;margin-top:8px;}"
    + "#rv-cp-modal .rv-cp-wa{background:#25D366;color:#fff;border:none;border-radius:10px;padding:13px 22px;font-size:15px;font-weight:700;cursor:pointer;text-decoration:none;display:inline-block;}";

  // ---- HTML DO BLOCO -----------------------------------------
  var BLOCO = ""
    + "<div id='rv-cp'>"
    + "  <div class='rv-cp-tag'>💌 Personalizar esta carta con Lucía</div>"
    + "  <div class='rv-cp-tit'>Hazla tuya, para quien tú quieras</div>"
    + "  <div class='rv-cp-sub'>¿Quieres adaptar esta carta para alguien importante en tu vida? Lucía puede ayudarte a personalizarla para tu hija, hijo, esposo, esposa, nietos o cualquier familiar.</div>"
    + "  <button class='rv-cp-btn' id='rv-cp-abrir'>Personalizar con Lucía</button>"
    + "</div>";

  // ---- MODAL -------------------------------------------------
  var MODAL = ""
    + "<div id='rv-cp-modal'><div class='rv-cp-card' id='rv-cp-inner'></div></div>";

  function viewForm() {
    return ""
      + "<h3>Personalizar con Lucía</h3>"
      + "<div class='rv-cp-sub' style='font-size:14px;margin-bottom:6px;'>Dime para quién es y Lucía la adapta para ti.</div>"
      + "<label>Nombre de la persona</label>"
      + "<input id='rv-cp-nombre' placeholder='Ej: Ana' />"
      + "<label>Relación</label>"
      + "<select id='rv-cp-rel'>"
      + "<option value='hija'>Hija</option><option value='hijo'>Hijo</option>"
      + "<option value='esposa'>Esposa</option><option value='esposo'>Esposo</option>"
      + "<option value='nieta'>Nieta</option><option value='nieto'>Nieto</option>"
      + "<option value='hermana'>Hermana</option><option value='hermano'>Hermano</option>"
      + "<option value='otro'>Otro</option></select>"
      + "<label>¿Cómo quieres firmar?</label>"
      + "<select id='rv-cp-firma'>"
      + "<option value='Tu mamá'>Tu mamá</option><option value='Tu papá'>Tu papá</option>"
      + "<option value='Tu esposa'>Tu esposa</option><option value='Tu esposo'>Tu esposo</option>"
      + "<option value='Tu abuela'>Tu abuela</option><option value='Tu abuelo'>Tu abuelo</option>"
      + "<option value='__custom__'>Personalizado</option></select>"
      + "<div id='rv-cp-firma-wrap' style='display:none;'>"
      + "  <label>Texto de firma</label>"
      + "  <input id='rv-cp-firma-txt' placeholder='Ej: Con cariño, Rosa' />"
      + "</div>"
      + "<label>Algo que quieres agregar <span style='font-weight:400;color:#9a7b63;'>(opcional)</span></label>"
      + "<textarea id='rv-cp-obs' placeholder='Ej: Quiero agradecerle porque me llama todos los domingos.'></textarea>"
      + "<div id='rv-cp-erro'></div>"
      + "<div class='rv-cp-actions'>"
      + "  <button class='rv-cp-btn' id='rv-cp-generar'>Generar carta</button>"
      + "  <button class='rv-cp-sec' id='rv-cp-cerrar'>Cancelar</button>"
      + "</div>";
  }

  function viewLoading() {
    return "<h3>Lucía está escribiendo…</h3><div class='rv-cp-sub'>Dame un momentito, mija. Estoy adaptando la carta con cariño.</div>";
  }

  function viewCarta(carta) {
    var wa = "https://wa.me/?text=" + encodeURIComponent(carta.whatsapp_text || carta.texto || "");
    return ""
      + "<h3>" + (carta.titulo || "Tu carta") + "</h3>"
      + "<div id='rv-cp-carta'>" + escapeHtml(carta.texto || "") + "</div>"
      + "<div class='rv-cp-actions'>"
      + "  <button class='rv-cp-sec' id='rv-cp-copiar'>Copiar carta</button>"
      + "  <a class='rv-cp-wa' href='" + wa + "' target='_blank' rel='noopener'>Compartir por WhatsApp</a>"
      + "  <button class='rv-cp-sec' id='rv-cp-otra'>Hacer otra</button>"
      + "</div>";
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
    });
  }

  // ---- LÓGICA ------------------------------------------------
  var modalEl, innerEl;

  function abrir() {
    if (!getToken()) {
      alert("Para personalizar la carta, primero entra con tu código en Lucía.");
      return;
    }
    innerEl.innerHTML = viewForm();
    bindForm();
    modalEl.style.display = "flex";
  }

  function cerrar() { modalEl.style.display = "none"; }

  function bindForm() {
    var firmaSel = document.getElementById("rv-cp-firma");
    firmaSel.onchange = function () {
      document.getElementById("rv-cp-firma-wrap").style.display =
        firmaSel.value === "__custom__" ? "block" : "none";
    };
    document.getElementById("rv-cp-cerrar").onclick = cerrar;
    document.getElementById("rv-cp-generar").onclick = generar;
  }

  function generar() {
    var nombre = (document.getElementById("rv-cp-nombre").value || "").trim();
    var rel = document.getElementById("rv-cp-rel").value;
    var firmaSel = document.getElementById("rv-cp-firma").value;
    var firmaTxt = (document.getElementById("rv-cp-firma-txt") || {}).value || "";
    var obs = (document.getElementById("rv-cp-obs").value || "").trim();
    var erro = document.getElementById("rv-cp-erro");
    erro.textContent = "";

    if (!nombre) { erro.textContent = "Escribe el nombre de la persona."; return; }

    var firma_como = firmaSel === "__custom__" ? "personalizado" : firmaSel;
    var firma_texto = firmaSel === "__custom__" ? firmaTxt.trim() : firmaSel;
    if (firmaSel === "__custom__" && !firma_texto) {
      erro.textContent = "Escribe cómo quieres firmar."; return;
    }

    var payload = {
      semana: SEMANA,
      destinatario: rel,
      nombre_destinatario: nombre,
      firma_como: firma_como,
      firma_texto: firma_texto,
      observacion: obs
    };

    innerEl.innerHTML = viewLoading();

    fetch(API + "/cartas/personalizar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + getToken()
      },
      body: JSON.stringify(payload)
    })
      .then(function (r) {
        return r.json().then(function (d) {
          if (!r.ok || !d.ok) throw new Error(d.error || "No se pudo generar la carta.");
          return d;
        });
      })
      .then(function (d) {
        innerEl.innerHTML = viewCarta(d.carta || {});
        bindCarta(d.carta || {});
      })
      .catch(function (err) {
        innerEl.innerHTML = viewForm();
        bindForm();
        var e = document.getElementById("rv-cp-erro");
        if (e) e.textContent = err.message || "Hubo un error. Intenta de nuevo.";
      });
  }

  function bindCarta(carta) {
    var copiar = document.getElementById("rv-cp-copiar");
    if (copiar) copiar.onclick = function () {
      var txt = carta.texto || "";
      if (navigator.clipboard) {
        navigator.clipboard.writeText(txt).then(function () {
          copiar.textContent = "¡Copiada!";
          setTimeout(function () { copiar.textContent = "Copiar carta"; }, 2000);
        });
      }
    };
    var otra = document.getElementById("rv-cp-otra");
    if (otra) otra.onclick = function () { innerEl.innerHTML = viewForm(); bindForm(); };
  }

  // ---- INIT --------------------------------------------------
  function init() {
    var style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    var mount = getMount();
    mount.innerHTML = BLOCO;
    document.body.insertAdjacentHTML("beforeend", MODAL);

    modalEl = document.getElementById("rv-cp-modal");
    innerEl = document.getElementById("rv-cp-inner");

    document.getElementById("rv-cp-abrir").onclick = abrir;
    modalEl.addEventListener("click", function (e) {
      if (e.target === modalEl) cerrar();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
