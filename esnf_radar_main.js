/* ============================================================
   RADAR ESNF — Modulo principal
   ============================================================ */

function connectWS(){
  try{
    ST.ws = new WebSocket('ws://localhost:8765');
    ST.ws.onopen = ()=>{
      const st = document.getElementById('live-status');
      st.textContent='● Conectando al puente...'; st.style.color='#ffaa00';
    };
    ST.ws.onmessage = (ev)=>{
      try{
        const payload = JSON.parse(ev.data);
        ST.live = payload.propio;
        ST.remoteAis = payload.blancos || {};
        ST.realAis = payload.ais || {};
        ST.miNombre = payload.mi_nombre || null;
        const st = document.getElementById('live-status');
        const nCompaneros = Object.keys(ST.remoteAis).length;
        if(ST.live.conectado_vs){
          st.textContent='● VIVO — '+(ST.miNombre||'')+' — '+nCompaneros+' compañero(s) en red';
          st.style.color='#44ff88';
        } else {
          st.textContent='○ Puente activo, esperando datos de Virtual Sailor...'; st.style.color='#ffaa00';
        }
        if(ST.SOURCE==='live') upd();
      }catch(e){}
    };
    ST.ws.onclose = ()=>{
      const st = document.getElementById('live-status');
      st.textContent='○ Desconectado del puente'; st.style.color='#664400';
      ST.ws=null;
      if(ST.SOURCE==='live') setTimeout(connectWS,3000);
    };
    ST.ws.onerror = ()=>{
      const st = document.getElementById('live-status');
      st.textContent='✕ Sin conexión — ¿está corriendo puente_nmea.py?'; st.style.color='#ff4444';
    };
  }catch(e){
    document.getElementById('live-status').textContent='✕ Error: '+e.message;
  }
}

function upd(){
  updateStationLabel();
  if(ST.SOURCE==='live'){
    const osPreview = computeOwnShip();
    syncRemoteAisTargets(osPreview.lat, osPreview.lon);
    syncRealAisTargets(osPreview.lat, osPreview.lon);
    buildTTSelect();
  }
  // Off-center button indicator
  const offBtn = document.getElementById('btn-offctr');
  if(offBtn){
    const isOff = ST.offX!==0 || ST.offY!==0;
    offBtn.textContent = isOff ? 'OFF-CTR: ACTIVO' : 'OFF-CTR: ON';
    offBtn.classList.toggle('warn', isOff);
  }
  const os = updateSidebarData();
  drawRadar(os);
}
function tick(){
  const n = new Date();
  document.getElementById('clk').textContent =
    String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0')+':'+String(n.getSeconds()).padStart(2,'0');
}

function trailLoop(){
  if(ST.TRAIL){
    const os = computeOwnShip();
    updateTrailHistory(os);
  }
}

window.addEventListener('resize', upd);

// ===== CURSOR Y OFF-CENTER =====
ST._cursorX = null;
ST._cursorY = null;

function initCanvasEvents(){
  const wrap = document.getElementById('radar-wrap');

  // Cursor — muestra cruz blanca y BRG/RNG al mover el mouse
  cv.addEventListener('mousemove', e=>{
    const rect = cv.getBoundingClientRect();
    ST._cursorX = e.clientX - rect.left;
    ST._cursorY = e.clientY - rect.top;
    upd();
  });

  cv.addEventListener('mouseleave', ()=>{
    ST._cursorX = null; ST._cursorY = null; upd();
  });

  // Click simple — mueve el OS al punto clickeado
  // Si clickeas abajo, el OS queda abajo y ganas vision hacia proa (arriba)
  cv.addEventListener('click', e=>{
    if(e.detail > 1) return; // ignorar doble click
    const rect = cv.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const W = cv.width, H = cv.height;
    const PX = Math.min(W,H)*0.47/ST.RNG;
    ST.offX = (mx - W/2) / PX;
    ST.offY = (H/2 - my) / PX;
    upd();
  });

  // Doble clic — resetea off-center
  cv.addEventListener('dblclick', e=>{
    e.stopPropagation();
    ST.offX=0; ST.offY=0; upd();
  });

  cv.style.cursor='crosshair';
}

function init(){
  buildControlStrip();
  buildSidebar();
  setInterval(tick,1000); tick();
  setInterval(trailLoop,3000);
  initCanvasEvents();
  loadNavObjects().then(()=>upd());
}

init();
