
// ===============================
// Lógica principal VegasBett (privado)
// ===============================
(function () {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const CFG = window.VEGASBETT_CONFIG || {};

  // Utilidades -------------------
  function waUrl(number, text) {
    const msg = encodeURIComponent(text || "");
    return number ? `https://wa.me/${number}?text=${msg}` : `https://wa.me/?text=${msg}`;
  }
  function moneyFormat(n) {
    try {
      const v = Number(n);
      if (isNaN(v)) return n;
      return v.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
    } catch (e) { return n; }
  }
  function copyFromSelector(sel) {
    const el = document.querySelector(sel);
    if (!el) return false;
    el.select();
    document.execCommand("copy");
    toast("Copiado ✅");
    return true;
  }
  function toast(text) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = text;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 1600);
  }

  // Año en footer
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Overrides por URL (emergencia) ----
  try {
    const url = new URL(location.href);
    const p = url.searchParams.get("principal");
    const r = url.searchParams.get("respaldo");
    const promos = url.searchParams.get("promos");
    if (p) CFG.NUMERO_PRINCIPAL = p;
    if (r) CFG.NUMERO_RESPALDO  = r;
    if (promos === "off") localStorage.setItem(todayKey("PROMO_OFF"), "1");
  } catch (e) {}

  // Helpers de fecha ---------
  function todayKey(prefix){ const d=new Date(); const k=[d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-'); return `${prefix}_${k}`; }

  // ================= Promo Ticker =================
  function getTodayPromo(){
    const d = new Date();
    const day = d.getDay(); // 0..6
    // excepciones por fecha
    const ymd = [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
    const ex = (CFG.PROMOS && CFG.PROMOS.EXCEPTIONS && CFG.PROMOS.EXCEPTIONS[ymd]) || null;
    if (ex) {
      if (ex.off) return null;
      if (typeof ex.percent === 'number') return { percent: ex.percent };
    }
    const map = (CFG.PROMOS && CFG.PROMOS.MAP) || {};
    const percent = map[String(day)];
    if (!percent) return null;
    return { percent };
  }

  function mountPromoTicker(){
    if (!CFG.SHOW_PROMO_TICKER) return;
    const key = todayKey("PROMO_OFF");
    if (localStorage.getItem(key) === "1") return;

    const promo = getTodayPromo();
    if (!promo) return;

    const wrap = document.createElement('div');
    wrap.className = 'promo-ticker';
    // Admin-mode (❌ visible) si desbloqueaste
    if (localStorage.getItem('ADMIN_UNLOCKED') === '1') wrap.classList.add('promo-admin');

    const min = (CFG.PROMOS && CFG.PROMOS.MINIMO) || 0;
    const max = (CFG.PROMOS && CFG.PROMOS.MAXIMO) || 0;

    wrap.innerHTML = `
      <button class="promo-close" id="promoClose" title="Ocultar hoy">✕ Ocultar hoy</button>
      <div class="promo-ticker__row">
        <span class="promo-chip">🎰 VEGAS</span>
        <span class="promo-text">HOY ${promo.percent}% de BONO</span>
        <span class="promo-small">mín ${moneyFormat(min)} · máx ${moneyFormat(max)} · primera carga</span>
        <span style="padding:0 28px">✦ ✦ ✦</span>
        <span class="promo-chip">💸 CARGAS</span>
        <span class="promo-text">válido hoy</span>
        <span class="promo-small">jugá distinto, jugá seguro</span>
        <span style="padding:0 28px">✦ ✦ ✦</span>
      </div>
    `;
    const card = document.querySelector('.card');
    if (card) card.insertBefore(wrap, card.firstChild.nextSibling); // debajo de header

    // cierre "hoy"
    const close = wrap.querySelector('#promoClose');
    if (close){
      close.addEventListener('click', ()=>{
        localStorage.setItem(key, "1");
        wrap.remove();
      });
    }
  }
  mountPromoTicker();

  // Home: botones directos -------------
  if ($("#btnPrincipal")) {
    $("#btnPrincipal").addEventListener("click", () => {
      const text = `Hola, soy ____.
Necesito atención del *número principal*.
Gracias.`;
      if (typeof fbq === "function") { fbq("track", "Contact", { flow: "direct", target: "principal" }); }
      location.href = waUrl(CFG.NUMERO_PRINCIPAL, text);
    });
  }
  if ($("#btnRespaldo")) {
    $("#btnRespaldo").addEventListener("click", () => {
      const text = `Hola, soy ____.
Necesito atención del *número de reclamos*.
Gracias.`;
      if (typeof fbq === "function") { fbq("track", "Contact", { flow: "direct", target: "respaldo" }); }
      location.href = waUrl(CFG.NUMERO_RESPALDO, text);
    });
  }
  // Soy nuevo (bono 35%)
  if (document.querySelector('#btnSoyNuevo')) {
    document.querySelector('#btnSoyNuevo').addEventListener('click', () => {
      const texto = "Soy nuevo, quiero mi bono del 35%";
      if (typeof fbq === "function") { fbq("track", "Contact", { flow: "bono_nuevo" }); }
      location.href = waUrl(CFG.NUMERO_PRINCIPAL, texto);
    });
  }

  // Click en logo -> Cargar
  const logo = document.querySelector('.logo-hero .logo-img');
  if (logo){ logo.style.cursor='pointer'; logo.addEventListener('click', ()=> location.href='cargar.html'); }

  // CARGAR -----------------------------
  if ($("#formCargar")) {
    const form  = $("#formCargar");
    const paso2 = $("#paso2");
    const cbu   = $("#cbu");
    const alias = $("#alias");

    if (cbu)   cbu.value   = CFG.CBU   || "";
    if (alias) alias.value = CFG.ALIAS || "";

    $$(".copybtn").forEach(btn => btn.addEventListener("click", (e) => {
      e.preventDefault();
      copyFromSelector(btn.getAttribute("data-copy"));
    }));

    // Mostrar info de promo si aplica
    const promoBox = $("#promoInfoCarga");
    const todayPromo = getTodayPromo();
    if (promoBox && todayPromo){
      promoBox.classList.remove('hidden');
      const min = (CFG.PROMOS && CFG.PROMOS.MINIMO) || 0;
      const max = (CFG.PROMOS && CFG.PROMOS.MAXIMO) || 0;
      promoBox.querySelector('.promo-dia')!.textContent = `${todayPromo.percent}%`;
      promoBox.querySelector('.promo-lim')!.textContent = `mín ${moneyFormat(min)} · máx ${moneyFormat(max)}`;
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nombre = $("#nombre").value.trim();
      const monto  = $("#monto").value.trim();
      if (!nombre || !monto) { alert("Completá nombre y monto."); return; }
      // Validaciones de rango si hay promo
      const min = (CFG.PROMOS && CFG.PROMOS.MINIMO) || 0;
      const max = (CFG.PROMOS && CFG.PROMOS.MAXIMO) || 0;
      if (Number(monto) < min){ alert(`El mínimo de carga es ${moneyFormat(min)}.`); return; }
      if (Number(monto) > max){ alert(`Para promo, el máximo es ${moneyFormat(max)}.`); /* sigue igual, solo avisamos */ }
      paso2.classList.remove("hidden");
      paso2.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    const enviar = $("#enviarWhatsCargar");
    if (enviar) {
      enviar.addEventListener("click", () => {
        const nombre = $("#nombre").value.trim();
        const monto  = $("#monto").value.trim();
        if (!nombre || !monto) { alert("Completá nombre y monto."); return; }
        const tp = getTodayPromo();
        const promoLine = tp ? `\nPromo del día: +${tp.percent}% (si aplica).` : "";
        const text = `Hola, soy *${nombre}*.
Quiero *CARGAR* ${moneyFormat(monto)}.
CBU/ALIAS copiado.${promoLine}
Envío el comprobante aquí.`;
        if (typeof fbq === "function") { fbq("track", "Contact", { flow: "cargar" }); }
        location.href = waUrl(CFG.NUMERO_PRINCIPAL, text);
      });
    }
  }

  // RETIRAR (solo DATOS en el WhatsApp) ----
  if (document.querySelector("#formRetirar")) {
    const titularInput = document.querySelector("#titularR");
    const cbuAliasInput = document.querySelector("#cbuAliasR");
    if (titularInput && CFG.TITULAR) titularInput.value = CFG.TITULAR;
    if (cbuAliasInput) cbuAliasInput.value = (CFG.ALIAS || CFG.CBU || "");

    document.querySelector("#formRetirar").addEventListener("submit", (e) => {
      e.preventDefault();
      const usuario  = document.querySelector("#usuarioR").value.trim();
      const titular  = document.querySelector("#titularR").value.trim();
      const cbuAlias = document.querySelector("#cbuAliasR").value.trim();
      const monto    = document.querySelector("#montoR").value.trim();
      if (!usuario || !titular || !cbuAlias || !monto) { alert("Completá todos los campos."); return; }
      if (Number(monto) > 250000) { alert("El monto máximo por retiro es $250.000"); return; }
      const text = `Usuario: ${usuario}
Titular: ${titular}
CBU o Alias: ${cbuAlias}
Monto a retirar: ${moneyFormat(monto)}`;
      const url = waUrl(CFG.NUMERO_PRINCIPAL, text);
      if (typeof fbq === "function") { fbq("track", "Contact", { flow: "retirar" }); }
      window.location.href = url;
    });
  }

  // Panel Admin ------------------------
  const adminToggle = $("#adminToggle");
  const panel = $("#adminPanel");
  const pin   = $("#pin");
  const nP    = $("#nPrincipal");
  const nR    = $("#nRespaldo");

  // Desbloqueo admin (long-press logo o Shift+Alt+A)
  const logo = document.querySelector('.logo-hero .logo-img');
  if (logo){
    let tId=null;
    logo.addEventListener('mousedown', ()=>{ tId=setTimeout(()=>{ localStorage.setItem('ADMIN_UNLOCKED','1'); if(adminToggle) adminToggle.style.display='inline-block'; toast('Admin desbloqueado'); }, 700)});
    ['mouseup','mouseleave','touchend','touchcancel'].forEach(ev=> logo.addEventListener(ev, ()=>{ if(tId){ clearTimeout(tId); tId=null; } }));
  }
  document.addEventListener('keydown', (e)=>{
    if (e.shiftKey && e.altKey && e.key.toLowerCase()==='a'){
      localStorage.setItem('ADMIN_UNLOCKED','1');
      if (adminToggle) adminToggle.style.display='inline-block';
      toast('Admin desbloqueado');
    }
  });
  if (localStorage.getItem('ADMIN_UNLOCKED')==='1' && adminToggle) adminToggle.style.display='inline-block';

  if (adminToggle && panel) {
    adminToggle.addEventListener("click", () => panel.classList.toggle("hidden"));
  }
  if ($("#aplicarAdmin")) {
    $("#aplicarAdmin").addEventListener("click", () => {
      if (!pin.value || pin.value !== (CFG.EMERGENCY_PIN || "")) { alert("PIN incorrecto"); return; }
      if (nP && nP.value) CFG.NUMERO_PRINCIPAL = nP.value.trim();
      if (nR && nR.value) CFG.NUMERO_RESPALDO  = nR.value.trim();
      toast("Números aplicados (solo en esta sesión)");
    });
  }
  if ($("#genLink")) {
    $("#genLink").addEventListener("click", () => {
      if (!pin.value || pin.value !== (CFG.EMERGENCY_PIN || "")) { alert("PIN incorrecto"); return; }
      const base = location.origin + location.pathname.replace(/index\.html?$/i, "");
      const qp = new URLSearchParams();
      if (nP && nP.value) qp.set("principal", nP.value.trim());
      if (nR && nR.value) qp.set("respaldo",  nR.value.trim());
      const link = base + "index.html?" + qp.toString();
      const out = $("#linkResult");
      if (out) { out.value = link; out.select(); document.execCommand("copy"); toast("Link generado"); }
    });
  }

  // ---- Age Gate 18+ ----
  (function ageGate(){
    const C = window.VEGASBETT_CONFIG || {};
    if (!C.AGE_GATE_ENABLED) return;
    if (localStorage.getItem('AGE_OK') === '1') return;
    const minAge = C.EDAD_MINIMA || 18;
    const backdrop = document.createElement('div');
    backdrop.className = 'age-backdrop';
    backdrop.innerHTML = `
      <div class="age-modal">
        <h3>Confirmación de edad <span class="age-badge">${minAge}+</span></h3>
        <p>Para continuar, confirmá que sos mayor de ${minAge} años. Jugá responsable.</p>
        <div class="age-actions">
          <button id="ageYes" class="btn ok">Sí, soy mayor</button>
          <button id="ageNo" class="btn warn">No, salir</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
    document.getElementById('ageYes')?.addEventListener('click', () => {
      localStorage.setItem('AGE_OK', '1'); backdrop.remove();
    });
    document.getElementById('ageNo')?.addEventListener('click', () => {
      window.location.href = 'https://www.google.com';
    });
  })();

  // ===== Modal "Más info" (spech) =====
  (function(){
    const modal   = document.getElementById('modalInfo');
    const btnOpen = document.getElementById('btnMasInfo');
    const btnClose= document.getElementById('modalClose');
    const btnOk   = document.getElementById('modalOk');
    const btnCopy = document.getElementById('copySpech');
    const spech   = document.getElementById('spechText');
    if (!modal || !btnOpen) return;
    const open  = ()=> { modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false'); };
    const close = ()=> { modal.classList.add('hidden');   modal.setAttribute('aria-hidden','true');  };
    btnOpen.addEventListener('click', open);
    btnClose?.addEventListener('click', close);
    btnOk?.addEventListener('click', close);
    modal.querySelector('.vb-modal__backdrop')?.addEventListener('click', e=>{ if (e.target.dataset.close) close(); });
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') close(); });
    btnCopy?.addEventListener('click', ()=>{
      const txt = spech?.innerText || '';
      (navigator.clipboard?.writeText(txt) || Promise.reject()).then(
        ()=> toast('Texto copiado ✅'),
        ()=> { const ta=document.createElement('textarea'); ta.value=txt; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast('Texto copiado ✅'); }
      );
    });
  })();
})();
