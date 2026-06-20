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
    buildTTSelect();
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

function init(){
  buildControlStrip();
  buildSidebar();
  syncManualSlidersFromState();
  setInterval(tick,1000); tick();
  setInterval(trailLoop,3000);
  upd();
}

init();
