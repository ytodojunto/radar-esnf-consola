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
      <span id="live-status" style="display:none"></span>
      <div class="divider"></div>
      <span class="ctrl-label">BUQUE/ESTACION</span>
      <input type="text" id="station-input" value="OS" placeholder="Nombre" style="width:90px;background:#000;border:1px solid #1a3a1a;color:#ffff00;font-family:'Courier New',monospace;font-size:9px;padding:3px 5px;border-radius:2px">
      <div class="divider"></div>
      <button class="btn on" id="toggle-position">POSICION: VISIBLE</button>
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
      <button class="btn on" id="toggle-objects">BOYAS/BALIZAS</button>
      <button class="btn" id="toggle-trail">TRAIL</button>
      <span class="ctrl-label" style="min-width:auto">tiempo:</span>
      <button class="btn btn-sm" data-trailmin="3">3m</button>
      <button class="btn btn-sm on" data-trailmin="6">6m</button>
      <button class="btn btn-sm" data-trailmin="10">10m</button>
      <button class="btn btn-sm" data-trailmin="15">15m</button>
      <button class="btn btn-sm" data-trailmin="30">30m</button>
      <div class="divider"></div>
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
      <button class="btn" id="btn-offctr" title="Resetear centro (tambien doble clic en el radar)">OFF-CTR: ON</button>
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
    if(ST.SOURCE==='live' && !ST.ws) connectWS();
    updateStationLabel();
    upd();
  }));

  // Station/ship name (manual override; live mode shows MI_NOMBRE from puente)
  document.getElementById('station-input').addEventListener('input', function(){
    ST.stationNameManual = this.value || 'OS';
    updateStationLabel();
  });

  // Position visibility toggle (hide lat/lon so cadets must read the radar, not GPS)
  document.getElementById('toggle-position').addEventListener('click', function(){
    ST.positionHidden = !ST.positionHidden;
    this.textContent = 'POSICION: ' + (ST.positionHidden ? 'OCULTA' : 'VISIBLE');
    this.classList.toggle('warn', ST.positionHidden);
    upd();
  });

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
  document.getElementById('toggle-objects').addEventListener('click',function(){
    ST.SHOW_OBJECTS=!ST.SHOW_OBJECTS; this.classList.toggle('on',ST.SHOW_OBJECTS); upd();
  });
  document.getElementById('toggle-trail').addEventListener('click',function(){
    ST.TRAIL=!ST.TRAIL; this.classList.toggle('on',ST.TRAIL); upd();
  });
  el.querySelectorAll('[data-trailmin]').forEach(b=>b.addEventListener('click',()=>{
    el.querySelectorAll('[data-trailmin]').forEach(x=>x.classList.remove('on'));
    b.classList.add('on'); ST.TRAILMIN=parseFloat(b.dataset.trailmin);
    upd();
  }));
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

  // OFF-CENTER reset
  document.getElementById('btn-offctr').addEventListener('click',function(){
    ST.offX=0; ST.offY=0;
    this.textContent='OFF-CTR: ON';
    this.classList.remove('warn');
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

}

function buildSidebar(){
  const el = document.getElementById('sidebar');
  el.innerHTML = `
    <!-- TX / STBY indicator bar -->
    <div class="tx-bar stby" id="tx-bar" onclick="toggleTxStby()">
      STBY
    </div>

    <!-- Datos propios OS -->
    <div class="f-panel">
      <div class="f-title">OS — BUQUE PROPIO</div>
      <div class="f-grid2">
        <div>
          <div class="f-lbl">HDG</div>
          <div class="f-val large" id="d-hdg">000°</div>
        </div>
        <div>
          <div class="f-lbl">SPD (STW)</div>
          <div class="f-val large" id="d-stw">0.0<span class="f-unit">kn</span></div>
        </div>
      </div>
      <div class="f-sep"></div>
      <div class="f-grid2">
        <div>
          <div class="f-lbl">COG</div>
          <div class="f-val large" id="d-cog">000°</div>
        </div>
        <div>
          <div class="f-lbl">SOG</div>
          <div class="f-val large" id="d-sog">0.0<span class="f-unit">kn</span></div>
        </div>
      </div>
      <div class="f-sep"></div>
      <div class="f-lbl">OS POSIT</div>
      <div class="f-val small" id="d-pos">— —</div>
      <div style="margin-top:3px">
        <div class="f-lbl">CORRIENTE</div>
        <div class="f-val small" id="d-cur">000° / 0.0kn</div>
      </div>
    </div>

    <!-- VRM / EBL -->
    <div class="f-panel">
      <div class="f-title">VRM / EBL</div>
      <div class="f-grid2">
        <div class="f-instbox">
          <div class="f-inst-lbl">VRM1</div>
          <div class="f-inst-val" id="d-vrm1">OFF</div>
        </div>
        <div class="f-instbox">
          <div class="f-inst-lbl">VRM2</div>
          <div class="f-inst-val" id="d-vrm2">OFF</div>
        </div>
        <div class="f-instbox">
          <div class="f-inst-lbl">EBL1</div>
          <div class="f-inst-val" id="d-ebl1">OFF</div>
        </div>
        <div class="f-instbox">
          <div class="f-inst-lbl">EBL2</div>
          <div class="f-inst-val" id="d-ebl2">OFF</div>
        </div>
      </div>
    </div>

    <!-- ACQ Targets -->
    <div class="f-panel">
      <div class="f-title">ACQ TARGETS <span style="font-size:7px;color:#004400">(toca para seleccionar)</span></div>
      <div class="tt-select" id="tt-select"></div>
      <div id="tt-data"></div>
    </div>
  `;

  buildTTSelect();
}

function toggleTxStby(){
  const bar = document.getElementById('tx-bar');
  const srcBtns = document.querySelectorAll('[data-src]');
  if(ST.SOURCE==='live'){
    // Switch to STBY
    ST.SOURCE='manual';
    srcBtns.forEach(b=>{ b.classList.toggle('on', b.dataset.src==='manual'); });
  } else {
    // Switch to TX
    ST.SOURCE='live';
    srcBtns.forEach(b=>{ b.classList.toggle('on', b.dataset.src==='live'); });
    if(!ST.ws) connectWS();
  }
  updateTxBar();
  upd();
}

function updateTxBar(){
  const bar = document.getElementById('tx-bar');
  if(!bar) return;
  if(ST.SOURCE==='live'){
    if(ST.live && ST.live.conectado_vs){
      bar.textContent='TX — RECIBIENDO DATOS';
      bar.className='tx-bar tx';
    } else {
      bar.textContent='TX — CONECTANDO...';
      bar.className='tx-bar tx';
      bar.style.color='#ffaa00';
    }
  } else {
    bar.textContent='STBY';
    bar.className='tx-bar stby';
    bar.style.color='';
  }
}



function updateStationLabel(){
  const name = (ST.SOURCE==='live' && ST.miNombre) ? ST.miNombre : ST.stationNameManual;
  document.getElementById('station-name').textContent = 'BUQUE: ' + name;
}

function buildTTSelect(){
  const sel = document.getElementById('tt-select');
  // Migrate legacy single-selection into the new multi array, once
  if(ST.selectedTargets.length===0 && ST.selectedTarget){
    ST.selectedTargets = [ST.selectedTarget];
  }
  sel.innerHTML = ST.targets.map(t=>
    `<button class="tt-btn ${ST.selectedTargets.includes(t.id)?'on':''}" data-tid="${t.id}">${t.isRemoteAis?'📡 ':''}${t.name}</button>`
  ).join('');
  sel.querySelectorAll('[data-tid]').forEach(b=>b.addEventListener('click',()=>{
    const tid = b.dataset.tid;
    const idx = ST.selectedTargets.indexOf(tid);
    if(idx>=0){
      ST.selectedTargets.splice(idx,1);
    } else {
      if(ST.selectedTargets.length>=3) ST.selectedTargets.shift(); // drop oldest, keep max 3
      ST.selectedTargets.push(tid);
    }
    ST.selectedTarget = ST.selectedTargets[ST.selectedTargets.length-1] || null; // keep legacy field for ARPA vector on canvas
    buildTTSelect();
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
  document.getElementById('d-pos').textContent = ST.positionHidden ? '••• OCULTA •••' : (ll.lat+'  '+ll.lon);
  document.getElementById('d-cur').textContent = String(Math.round(os.curdir)).padStart(3,'0')+'° / '+os.curspd.toFixed(1)+'kn';

  updateTxBar();

  // VRM/EBL readouts
  document.getElementById('d-vrm1').textContent = ST.vrm1.on ? ST.vrm1.dist.toFixed(2)+' NM' : 'OFF';
  document.getElementById('d-vrm2').textContent = ST.vrm2.on ? ST.vrm2.dist.toFixed(2)+' NM' : 'OFF';
  document.getElementById('d-ebl1').textContent = ST.ebl1.on ? String(ST.ebl1.brg).padStart(3,'0')+'°' : 'OFF';
  document.getElementById('d-ebl2').textContent = ST.ebl2.on ? String(ST.ebl2.brg).padStart(3,'0')+'°' : 'OFF';

  // TT panel for ALL selected targets (up to 3), shown stacked compactly
  const ttDiv = document.getElementById('tt-data');
  if(ST.selectedTargets.length===0){
    ttDiv.innerHTML = '<div style="font-size:8px;color:#004400;padding:4px">Sin blancos — tocá uno arriba</div>';
    return os;
  }

  ttDiv.innerHTML = ST.selectedTargets.map(tid=>{
    const tgt = ST.targets.find(t=>t.id===tid);
    if(!tgt) return '';
    const sol = computeTargetSolution(os, tgt);
    const cpaC = (!isNaN(sol.cpa) && sol.cpa<0.5) ? 'danger' : (!isNaN(sol.cpa) && sol.cpa<2 ? 'warn' : '');
    const mmsiLabel = tgt.mmsi && tgt.mmsi!=='—' ? 'MMSI '+tgt.mmsi : tgt.status||'';
    return `
      <div class="f-tgt">
        <div class="f-tgt-hdr">
          <span>${tgt.isRemoteAis?'📡 ':tgt.isRealAis?'⚓ ':''}${tgt.name}</span>
          <span style="font-size:7px;color:#004400">${mmsiLabel}</span>
        </div>
        <div class="f-grid2">
          <div><div class="f-lbl">BRG</div><div class="f-val med">${String(Math.round(tgt.brg)).padStart(3,'0')}°R</div></div>
          <div><div class="f-lbl">RNG</div><div class="f-val med">${tgt.dst.toFixed(2)}<span class="f-unit">NM</span></div></div>
        </div>
        <div class="f-sep"></div>
        <div class="f-grid2">
          <div><div class="f-lbl">COG</div><div class="f-val med">${String(Math.round(sol.tgt_cog)).padStart(3,'0')}°</div></div>
          <div><div class="f-lbl">SOG</div><div class="f-val med">${sol.tgt_sog.toFixed(1)}<span class="f-unit">kn</span></div></div>
        </div>
        <div class="f-sep"></div>
        <div class="f-row"><span class="f-lbl">CPA</span><span class="f-val med ${cpaC}">${isNaN(sol.cpa)?'—':sol.cpa.toFixed(3)+' NM'}</span></div>
        <div class="f-row"><span class="f-lbl">TCPA</span><span class="f-val med ${cpaC}">${fmtTime(sol.tcpa)}</span></div>
        <div class="f-row"><span class="f-lbl">BCR</span><span class="f-val small">${sol.bcr!==null?sol.bcr.toFixed(2)+' NM':'—'}</span></div>
        <div class="f-row"><span class="f-lbl">BCT</span><span class="f-val small">${sol.bct!==null?fmtTime(sol.bct):'—'}</span></div>
      </div>
    `;
  }).join('');

  return os;
}
