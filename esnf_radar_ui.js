/* ============================================================
   RADAR ESNF — Modulo de interfaz (controles + sidebar)
   ============================================================ */

function buildControlStrip(){
  const el = document.getElementById('ctrl-strip');
  el.innerHTML = `
    <div class="ctrl-row">
      <span class="ctrl-label">ORIENTACION</span>
      <button class="btn on" data-ori="north">NORTH UP</button>
      <button class="btn" data-ori="course">COURSE UP</button>
      <button class="btn" data-ori="head">HEAD UP</button>
      <div class="divider"></div>
      <span class="ctrl-label">MODO</span>
      <button class="btn on" data-mode="RM">REL. MOTION</button>
      <button class="btn" data-mode="TM">TRUE MOTION</button>
      <div class="divider"></div>
      <span class="ctrl-label">FUENTE OS</span>
      <button class="btn on" data-src="manual">MANUAL</button>
      <button class="btn" data-src="live">VIVO (VS)</button>
      <span id="live-status" style="font-size:8px;color:#664400;margin-left:6px">○ Desconectado</span>
    </div>

    <div class="ctrl-row">
      <span class="ctrl-label">RANGO (NM)</span>
      <button class="btn btn-sm" data-rng="0.5">0.5</button>
      <button class="btn btn-sm" data-rng="1">1</button>
      <button class="btn btn-sm" data-rng="2">2</button>
      <button class="btn btn-sm on" data-rng="4">4</button>
      <button class="btn btn-sm" data-rng="6">6</button>
      <button class="btn btn-sm" data-rng="8">8</button>
      <button class="btn btn-sm" data-rng="12">12</button>
      <button class="btn btn-sm" data-rng="16">16</button>
      <button class="btn btn-sm" data-rng="24">24</button>
      <div class="divider"></div>
      <span class="ctrl-label">VECTOR (min)</span>
      <button class="btn btn-sm" data-vec="3">3</button>
      <button class="btn btn-sm on" data-vec="6">6</button>
      <button class="btn btn-sm" data-vec="10">10</button>
      <button class="btn btn-sm" data-vec="15">15</button>
      <button class="btn btn-sm" data-vec="20">20</button>
      <button class="btn btn-sm" data-vec="30">30</button>
      <div class="divider"></div>
      <button class="btn on" id="toggle-rings">ANILLOS</button>
      <button class="btn" id="toggle-trail">TRAIL</button>
      <button class="btn warn" id="toggle-interference">INTERFER.</button>
    </div>

    <div class="ctrl-row">
      <span class="ctrl-label">GAIN</span>
      <div class="slider-mini"><input type="range" id="gain" min="0" max="100" value="70"><span id="gain-v">70</span></div>
      <span class="ctrl-label" style="min-width:34px">SEA</span>
      <div class="slider-mini"><input type="range" id="sea" min="0" max="100" value="30"><span id="sea-v">30</span></div>
      <span class="ctrl-label" style="min-width:34px">RAIN</span>
      <div class="slider-mini"><input type="range" id="rain" min="0" max="100" value="10"><span id="rain-v">10</span></div>
      <div class="divider"></div>
      <button class="btn danger" id="btn-mob">MOB</button>
    </div>

    <div class="ctrl-row">
      <span class="ctrl-label">VRM1</span>
      <button class="btn btn-sm" id="vrm1-toggle">OFF</button>
      <div class="slider-mini"><input type="range" id="vrm1-dist" min="0.1" max="24" step="0.1" value="1.0"><span id="vrm1-v">1.0</span></div>
      <span class="ctrl-label" style="min-width:34px">VRM2</span>
      <button class="btn btn-sm" id="vrm2-toggle">OFF</button>
      <div class="slider-mini"><input type="range" id="vrm2-dist" min="0.1" max="24" step="0.1" value="2.0"><span id="vrm2-v">2.0</span></div>
      <div class="divider"></div>
      <span class="ctrl-label">EBL1</span>
      <button class="btn btn-sm" id="ebl1-toggle">OFF</button>
      <div class="slider-mini"><input type="range" id="ebl1-brg" min="0" max="359" step="1" value="0"><span id="ebl1-v">000°</span></div>
      <span class="ctrl-label" style="min-width:34px">EBL2</span>
      <button class="btn btn-sm" id="ebl2-toggle">OFF</button>
      <div class="slider-mini"><input type="range" id="ebl2-brg" min="0" max="359" step="1" value="90"><span id="ebl2-v">090°</span></div>
    </div>

    <div class="ctrl-row" id="manual-os-row">
      <span class="ctrl-label">OS HDG</span>
      <div class="slider-mini"><input type="range" id="os-hdg" min="0" max="359" step="1" value="0"><span id="os-hdg-v">000°</span></div>
      <span class="ctrl-label" style="min-width:34px">OS STW</span>
      <div class="slider-mini"><input type="range" id="os-stw" min="0" max="25" step="0.5" value="10"><span id="os-stw-v">10.0</span></div>
      <div class="divider"></div>
      <span class="ctrl-label">CORRIENTE</span>
      <div class="slider-mini"><input type="range" id="cur-dir" min="0" max="359" step="1" value="0"><span id="cur-dir-v">000°</span></div>
      <div class="slider-mini"><input type="range" id="cur-spd" min="0" max="3" step="0.1" value="0"><span id="cur-spd-v">0.0</span></div>
      <div class="divider"></div>
      <span class="ctrl-label">VIENTO</span>
      <div class="slider-mini"><input type="range" id="wind-dir" min="0" max="359" step="1" value="0"><span id="wind-dir-v">000°</span></div>
      <div class="slider-mini"><input type="range" id="wind-spd" min="0" max="60" step="1" value="0"><span id="wind-spd-v">0</span></div>
    </div>
  `;

  // Orientation
  el.querySelectorAll('[data-ori]').forEach(b=>b.addEventListener('click',()=>{
    el.querySelectorAll('[data-ori]').forEach(x=>x.classList.remove('on'));
    b.classList.add('on'); ST.ORI=b.dataset.ori;
    document.getElementById('info-orient').innerHTML='<b>'+b.textContent+'</b>';
    upd();
  }));

  // Mode RM/TM
  el.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{
    el.querySelectorAll('[data-mode]').forEach(x=>x.classList.remove('on'));
    b.classList.add('on'); ST.MODE=b.dataset.mode;
    document.getElementById('info-mode').innerHTML='<b>'+b.dataset.mode+'</b>';
    upd();
  }));

  // Source manual/live
  el.querySelectorAll('[data-src]').forEach(b=>b.addEventListener('click',()=>{
    el.querySelectorAll('[data-src]').forEach(x=>x.classList.remove('on'));
    b.classList.add('on'); ST.SOURCE=b.dataset.src;
    document.getElementById('manual-os-row').style.opacity = (ST.SOURCE==='live')?'0.4':'1';
    document.getElementById('manual-os-row').querySelectorAll('input').forEach(i=>i.disabled=(ST.SOURCE==='live'));
    if(ST.SOURCE==='live' && !ST.ws) connectWS();
    upd();
  }));

  // Range
  el.querySelectorAll('[data-rng]').forEach(b=>b.addEventListener('click',()=>{
    el.querySelectorAll('[data-rng]').forEach(x=>x.classList.remove('on'));
    b.classList.add('on'); ST.RNG=parseFloat(b.dataset.rng);
    document.getElementById('info-range').innerHTML='<b>RNG '+ST.RNG+'NM</b>';
    upd();
  }));

  // Vector minutes
  el.querySelectorAll('[data-vec]').forEach(b=>b.addEventListener('click',()=>{
    el.querySelectorAll('[data-vec]').forEach(x=>x.classList.remove('on'));
    b.classList.add('on'); ST.VECMIN=parseFloat(b.dataset.vec);
    document.getElementById('info-vector').innerHTML='<b>'+(ST.MODE==='TM'?'TRUE-V ':'REL-V ')+ST.VECMIN+'min</b>';
    upd();
  }));

  // Toggles
  document.getElementById('toggle-rings').addEventListener('click',function(){
    ST.RINGS=!ST.RINGS; this.classList.toggle('on',ST.RINGS); upd();
  });
  document.getElementById('toggle-trail').addEventListener('click',function(){
    ST.TRAIL=!ST.TRAIL; this.classList.toggle('on',ST.TRAIL); upd();
  });
  document.getElementById('toggle-interference').addEventListener('click',function(){
    ST.INTERFERENCE=!ST.INTERFERENCE; this.classList.toggle('on',ST.INTERFERENCE); upd();
  });

  // Gain/Sea/Rain
  ['gain','sea','rain'].forEach(id=>{
    document.getElementById(id).addEventListener('input',function(){
      ST[id.toUpperCase()]=+this.value;
      document.getElementById(id+'-v').textContent=this.value;
      upd();
    });
  });

  // MOB
  document.getElementById('btn-mob').addEventListener('click',function(){
    ST.MOB=!ST.MOB;
    this.classList.toggle('on',ST.MOB);
    document.getElementById('mob-alert').classList.toggle('show',ST.MOB);
    if(ST.MOB){
      const os = computeOwnShip();
      ST.mobPos = {lat:os.lat,lon:os.lon};
    }
    upd();
  });

  // VRM1/2
  document.getElementById('vrm1-toggle').addEventListener('click',function(){
    ST.vrm1.on=!ST.vrm1.on; this.textContent=ST.vrm1.on?'ON':'OFF'; this.classList.toggle('on',ST.vrm1.on); upd();
  });
  document.getElementById('vrm2-toggle').addEventListener('click',function(){
    ST.vrm2.on=!ST.vrm2.on; this.textContent=ST.vrm2.on?'ON':'OFF'; this.classList.toggle('on',ST.vrm2.on); upd();
  });
  document.getElementById('vrm1-dist').addEventListener('input',function(){
    ST.vrm1.dist=+this.value; document.getElementById('vrm1-v').textContent=(+this.value).toFixed(1); upd();
  });
  document.getElementById('vrm2-dist').addEventListener('input',function(){
    ST.vrm2.dist=+this.value; document.getElementById('vrm2-v').textContent=(+this.value).toFixed(1); upd();
  });

  // EBL1/2
  document.getElementById('ebl1-toggle').addEventListener('click',function(){
    ST.ebl1.on=!ST.ebl1.on; this.textContent=ST.ebl1.on?'ON':'OFF'; this.classList.toggle('on',ST.ebl1.on); upd();
  });
  document.getElementById('ebl2-toggle').addEventListener('click',function(){
    ST.ebl2.on=!ST.ebl2.on; this.textContent=ST.ebl2.on?'ON':'OFF'; this.classList.toggle('on',ST.ebl2.on); upd();
  });
  document.getElementById('ebl1-brg').addEventListener('input',function(){
    ST.ebl1.brg=+this.value; document.getElementById('ebl1-v').textContent=String(this.value).padStart(3,'0')+'°'; upd();
  });
  document.getElementById('ebl2-brg').addEventListener('input',function(){
    ST.ebl2.brg=+this.value; document.getElementById('ebl2-v').textContent=String(this.value).padStart(3,'0')+'°'; upd();
  });

  // Manual OS
  document.getElementById('os-hdg').addEventListener('input',function(){
    ST.os.hdg=+this.value; document.getElementById('os-hdg-v').textContent=String(this.value).padStart(3,'0')+'°'; upd();
  });
  document.getElementById('os-stw').addEventListener('input',function(){
    ST.os.stw=+this.value; document.getElementById('os-stw-v').textContent=(+this.value).toFixed(1); upd();
  });
  document.getElementById('cur-dir').addEventListener('input',function(){
    ST.current.dir=+this.value; document.getElementById('cur-dir-v').textContent=String(this.value).padStart(3,'0')+'°'; upd();
  });
  document.getElementById('cur-spd').addEventListener('input',function(){
    ST.current.spd=+this.value; document.getElementById('cur-spd-v').textContent=(+this.value).toFixed(1); upd();
  });
  document.getElementById('wind-dir').addEventListener('input',function(){
    ST.wind.dir=+this.value; document.getElementById('wind-dir-v').textContent=String(this.value).padStart(3,'0')+'°'; upd();
  });
  document.getElementById('wind-spd').addEventListener('input',function(){
    ST.wind.spd=+this.value; document.getElementById('wind-spd-v').textContent=this.value; upd();
  });
}

function buildSidebar(){
  const el = document.getElementById('sidebar');
  el.innerHTML = `
    <div class="scenario-block">
      <div class="stitle">ESCENARIOS PREDEFINIDOS</div>
      <div class="scenario-btns">
        <button class="btn on" data-sc="maersk">MAERSK LABERINTO (real)</button>
        <button class="btn" data-sc="ladyj">LADY J (real)</button>
        <button class="btn" data-sc="multi">Multi-blanco + corriente</button>
        <button class="btn" data-sc="cruce">Cruce peligroso</button>
        <button class="btn" data-sc="frente">Frente a frente</button>
        <button class="btn" data-sc="alcance">Alcance</button>
        <button class="btn" data-sc="seguro">Paso seguro</button>
      </div>
    </div>

    <div class="panel">
      <div class="panel-title">
        DATOS PROPIOS (OS)
        <span class="src" id="src-indicator">MANUAL</span>
      </div>
      <div class="data-grid">
        <div class="data-item"><span class="dl">HDG (aguja)</span><span class="dv" id="d-hdg">000°</span></div>
        <div class="data-item"><span class="dl">STW (agua)</span><span class="dv" id="d-stw">0.0 kn</span></div>
        <div class="data-item"><span class="dl">COG (fondo)</span><span class="dv" id="d-cog">000°</span></div>
        <div class="data-item"><span class="dl">SOG (fondo)</span><span class="dv" id="d-sog">0.0 kn</span></div>
        <div class="data-item full"><span class="dl">POSICION</span><span class="dv pos" id="d-pos">— —</span></div>
        <div class="data-item"><span class="dl">CORRIENTE</span><span class="dv" id="d-cur" style="font-size:11px">000° / 0.0kn</span></div>
        <div class="data-item"><span class="dl">VIENTO REAL</span><span class="dv" id="d-windT" style="font-size:11px">000° / 0kn</span></div>
        <div class="data-item full"><span class="dl">VIENTO APARENTE</span><span class="dv" id="d-windA" style="font-size:11px">000° / 0kn</span></div>
      </div>
    </div>

    <div class="panel" id="vrm-ebl-panel">
      <div class="panel-title">VRM / EBL / IL</div>
      <div class="data-grid">
        <div class="data-item"><span class="dl">VRM1</span><span class="dv" id="d-vrm1" style="font-size:13px">OFF</span></div>
        <div class="data-item"><span class="dl">VRM2</span><span class="dv" id="d-vrm2" style="font-size:13px">OFF</span></div>
        <div class="data-item"><span class="dl">EBL1</span><span class="dv" id="d-ebl1" style="font-size:13px">OFF</span></div>
        <div class="data-item"><span class="dl">EBL2</span><span class="dv" id="d-ebl2" style="font-size:13px">OFF</span></div>
      </div>
    </div>

    <div class="tt-block">
      <div class="panel-title" style="margin-bottom:5px">PANEL TT / ACQ TARGETS</div>
      <div class="tt-select" id="tt-select"></div>
      <div id="tt-data"></div>
    </div>

    <div class="legend-box">
      <div class="li"><span class="dot" style="background:#00ff41"></span>OS — buque propio</div>
      <div class="li"><span class="dot" style="background:#ffff00"></span>TGT — blancos</div>
      <div class="li">━ línea continua = HDG (aguja)</div>
      <div class="li">┄ línea punteada = COG/SOG (deriva)</div>
      <div class="li">━ vector grueso = ARPA (relativo)</div>
      <div class="li"><span class="dot" style="background:#ff3333"></span>CPA &nbsp; <span class="dot" style="background:#44ff88"></span>BCR</div>
    </div>
  `;

  el.querySelectorAll('[data-sc]').forEach(b=>b.addEventListener('click',()=>{
    el.querySelectorAll('[data-sc]').forEach(x=>x.classList.remove('on'));
    b.classList.add('on');
    loadScenario(b.dataset.sc);
    syncManualSlidersFromState();
    buildTTSelect();
    upd();
  }));

  buildTTSelect();
}

function syncManualSlidersFromState(){
  document.getElementById('os-hdg').value = ST.os.hdg;
  document.getElementById('os-hdg-v').textContent = String(ST.os.hdg).padStart(3,'0')+'°';
  document.getElementById('os-stw').value = ST.os.stw;
  document.getElementById('os-stw-v').textContent = ST.os.stw.toFixed(1);
  document.getElementById('cur-dir').value = ST.current.dir;
  document.getElementById('cur-dir-v').textContent = String(ST.current.dir).padStart(3,'0')+'°';
  document.getElementById('cur-spd').value = ST.current.spd;
  document.getElementById('cur-spd-v').textContent = ST.current.spd.toFixed(1);
}

function buildTTSelect(){
  const sel = document.getElementById('tt-select');
  sel.innerHTML = ST.targets.map(t=>
    `<button class="tt-btn ${t.id===ST.selectedTarget?'on':''}" data-tid="${t.id}">${t.isRemoteAis?'📡 ':''}${t.name}</button>`
  ).join('');
  sel.querySelectorAll('[data-tid]').forEach(b=>b.addEventListener('click',()=>{
    ST.selectedTarget = b.dataset.tid;
    sel.querySelectorAll('.tt-btn').forEach(x=>x.classList.remove('on'));
    b.classList.add('on');
    upd();
  }));
}

function updateSidebarData(){
  const os = computeOwnShip();
  document.getElementById('d-hdg').textContent = String(Math.round(os.hdg)).padStart(3,'0')+'°';
  document.getElementById('d-stw').textContent = os.stw.toFixed(1)+' kn';
  document.getElementById('d-cog').textContent = String(Math.round(os.cog)).padStart(3,'0')+'°';
  document.getElementById('d-sog').textContent = os.sog.toFixed(1)+' kn';
  const ll = fmtLatLon(os.lat, os.lon);
  document.getElementById('d-pos').textContent = ll.lat+'  '+ll.lon;
  document.getElementById('d-cur').textContent = String(Math.round(os.curdir)).padStart(3,'0')+'° / '+os.curspd.toFixed(1)+'kn';

  const srcInd = document.getElementById('src-indicator');
  if(ST.SOURCE==='live'){
    srcInd.textContent = ST.live.conectado_vs ? 'VIVO ●' : 'VIVO (sin datos)';
    srcInd.classList.toggle('live', ST.live.conectado_vs);
  } else {
    srcInd.textContent = 'MANUAL'; srcInd.classList.remove('live');
  }

  // Wind: true vs apparent
  // True wind given directly. Apparent = true wind vector minus OS movement vector (vector subtraction as felt on deck)
  const windTrue = vecFromHdgSpd(ST.wind.dir, ST.wind.spd);
  const osVec = os.cog_vec;
  const appX = windTrue.x - osVec.x, appY = windTrue.y - osVec.y;
  const appSpd = Math.sqrt(appX*appX+appY*appY);
  const appDir = norm360(r2d(Math.atan2(appX,appY)));
  document.getElementById('d-windT').textContent = String(ST.wind.dir).padStart(3,'0')+'° / '+ST.wind.spd+'kn';
  document.getElementById('d-windA').textContent = String(Math.round(appDir)).padStart(3,'0')+'° / '+appSpd.toFixed(1)+'kn';

  // VRM/EBL readouts
  document.getElementById('d-vrm1').textContent = ST.vrm1.on ? ST.vrm1.dist.toFixed(2)+' NM' : 'OFF';
  document.getElementById('d-vrm2').textContent = ST.vrm2.on ? ST.vrm2.dist.toFixed(2)+' NM' : 'OFF';
  document.getElementById('d-ebl1').textContent = ST.ebl1.on ? String(ST.ebl1.brg).padStart(3,'0')+'°' : 'OFF';
  document.getElementById('d-ebl2').textContent = ST.ebl2.on ? String(ST.ebl2.brg).padStart(3,'0')+'°' : 'OFF';

  // TT panel for selected target
  const ttDiv = document.getElementById('tt-data');
  const tgt = ST.targets.find(t=>t.id===ST.selectedTarget);
  if(!tgt){ ttDiv.innerHTML = '<div style="font-size:9px;color:#336633">Sin blanco seleccionado</div>'; return os; }

  const sol = computeTargetSolution(os, tgt);
  const cpaClass = (!isNaN(sol.cpa) && sol.cpa<0.5) ? 'danger' : (!isNaN(sol.cpa) && sol.cpa<2 ? 'warn' : 'ok');

  ttDiv.innerHTML = `
    <div class="tt-row"><span class="lbl">NOMBRE</span><span class="val" style="color:#ffff00">${tgt.name}</span></div>
    <div class="tt-row"><span class="lbl">MMSI</span><span class="val">${tgt.mmsi}</span></div>
    <div class="tt-row"><span class="lbl">BRG</span><span class="val">${String(Math.round(tgt.brg)).padStart(3,'0')}°R</span></div>
    <div class="tt-row"><span class="lbl">RNG</span><span class="val">${tgt.dst.toFixed(3)} NM</span></div>
    <div class="tt-row"><span class="lbl">HDG</span><span class="val">${String(Math.round(tgt.hdg)).padStart(3,'0')}°</span></div>
    <div class="tt-row"><span class="lbl">STW</span><span class="val">${tgt.stw.toFixed(1)} kn</span></div>
    <div class="tt-row"><span class="lbl">COG</span><span class="val" style="color:#aaffaa">${String(Math.round(sol.tgt_cog)).padStart(3,'0')}°</span></div>
    <div class="tt-row"><span class="lbl">SOG</span><span class="val" style="color:#aaffaa">${sol.tgt_sog.toFixed(1)} kn</span></div>
    <div class="tt-row"><span class="lbl">CPA</span><span class="val ${cpaClass}">${isNaN(sol.cpa)?'—':sol.cpa.toFixed(3)+' NM'}</span></div>
    <div class="tt-row"><span class="lbl">TCPA</span><span class="val ${cpaClass}">${fmtTime(sol.tcpa)}</span></div>
    <div class="tt-row"><span class="lbl">BCR</span><span class="val">${sol.bcr!==null?sol.bcr.toFixed(3)+' NM':'—'}</span></div>
    <div class="tt-row"><span class="lbl">BCT</span><span class="val">${sol.bct!==null?fmtTime(sol.bct):'—'}</span></div>
    <div class="tt-row"><span class="lbl">STATUS</span><span class="val">${tgt.status}</span></div>
  `;

  return os;
}
