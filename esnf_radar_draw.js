/* ============================================================
   RADAR ESNF — Modulo de dibujo (canvas)
   ============================================================ */

const cv = document.getElementById('rc');
const ctx = cv.getContext('2d');
const trailHistory = {}; // {targetId: [{x,y,t}, ...]}
const osTrailHistory = [];

function txt(x,y,str,font,color,screenRot){
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(d2r(screenRot));
  ctx.fillStyle=color; ctx.font=font;
  ctx.fillText(str,0,0);
  ctx.restore();
}

function drawRadar(os){
  const wrap = document.getElementById('radar-wrap');
  const W = wrap.clientWidth, H = wrap.clientHeight;
  cv.width = W; cv.height = H;
  // Centro de la pantalla desplazado por off-center (en pixeles)
  const PX = Math.min(W,H)*0.43/ST.RNG;
  const CX = W/2 + ST.offX*PX;
  const CY = H/2 - ST.offY*PX;

  ctx.fillStyle = '#000'; ctx.fillRect(0,0,W,H);

  // Interference noise
  if(ST.INTERFERENCE){
    ctx.fillStyle = 'rgba(0,255,65,0.5)';
    for(let i=0;i<140;i++){
      const ang = Math.random()*Math.PI*2;
      const r = Math.random()*Math.min(W,H)*0.43;
      const x = CX+Math.cos(ang)*r, y = CY+Math.sin(ang)*r;
      ctx.fillRect(x,y,1.5,1.5);
    }
  }

  let screenRot = 0;
  if(ST.ORI==='course' || ST.ORI==='head') screenRot = os.hdg;

  ctx.save();
  ctx.translate(CX,CY);
  ctx.rotate(d2r(-screenRot));
  ctx.translate(-CX,-CY);

  function ts(nx,ny){ return [CX+nx*PX, CY-ny*PX]; }

  // Rings
  if(ST.RINGS){
    const rings = [0.25,0.5,1,2,3,4,6,8,10,12,16,24].filter(r=>r<=ST.RNG && r>0);
    ctx.lineWidth=0.5;
    rings.forEach(r=>{
      ctx.strokeStyle = (r===ST.RNG) ? '#1a5a2a' : '#0a2a0a';
      ctx.beginPath(); ctx.arc(CX,CY,r*PX,0,Math.PI*2); ctx.stroke();
      txt(CX+r*PX+2,CY-2,r+' NM','9px Courier New','#1a5a2a',screenRot);
    });
  }

  // Bearing lines
  ctx.strokeStyle='#0a2a0a'; ctx.setLineDash([2,6]);
  for(let a=0;a<360;a+=30){
    const rad=d2r(a), rr=ST.RNG*PX;
    ctx.beginPath(); ctx.moveTo(CX,CY); ctx.lineTo(CX+Math.sin(rad)*rr,CY-Math.cos(rad)*rr); ctx.stroke();
    const lx=CX+Math.sin(rad)*rr*0.94, ly=CY-Math.cos(rad)*rr*0.94;
    txt(lx-10,ly+4,String(a).padStart(3,'0'),'9px Courier New','#1a6a3a',screenRot);
  }
  ctx.setLineDash([]);

  // GAIN/SEA/RAIN cosmetic clutter (decorative speckle near center, density from sliders)
  const clutterDensity = Math.round((ST.SEA/100)*40);
  ctx.fillStyle='rgba(0,200,50,0.25)';
  for(let i=0;i<clutterDensity;i++){
    const ang=Math.random()*Math.PI*2;
    const r=Math.random()*Math.min(W,H)*0.12;
    const [x,y]=[CX+Math.cos(ang)*r, CY+Math.sin(ang)*r];
    ctx.fillRect(x,y,1,1);
  }
  const rainDensity = Math.round((ST.RAIN/100)*60);
  ctx.fillStyle='rgba(0,255,65,0.12)';
  for(let i=0;i<rainDensity;i++){
    const x=Math.random()*W, y=Math.random()*H;
    ctx.fillRect(x,y,1,1);
  }

  // === OS own ship trail (TM mode tracks position drift; RM mode stays at center) ===
  if(ST.TRAIL && ST.MODE==='TM'){
    ctx.strokeStyle='rgba(0,255,65,0.4)'; ctx.lineWidth=1;
    ctx.beginPath();
    osTrailHistory.forEach((p,i)=>{ const [x,y]=ts(p.x,p.y); if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
    ctx.stroke();
    ctx.fillStyle='rgba(0,255,65,0.5)';
    osTrailHistory.forEach((p,i)=>{
      if(i % 3 !== 0) return;
      const [x,y]=ts(p.x,p.y);
      ctx.beginPath(); ctx.arc(x,y,1.6,0,Math.PI*2); ctx.fill();
    });
  }

  // === Targets ===
  ST.targets.forEach(tgt=>{
    const sol = computeTargetSolution(os, tgt);
    const isSelected = ST.selectedTargets.includes(tgt.id);
    const [txs,tys] = ts(sol.pos.x, sol.pos.y);

    // trail (linea + marcas de huella, estilo ARPA real)
    if(ST.TRAIL){
      if(!trailHistory[tgt.id]) trailHistory[tgt.id]=[];
      const hist = trailHistory[tgt.id];
      ctx.strokeStyle='rgba(255,255,0,0.3)'; ctx.lineWidth=1;
      ctx.beginPath();
      hist.forEach((p,i)=>{ const [x,y]=ts(p.x,p.y); if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
      ctx.stroke();
      ctx.fillStyle='rgba(255,255,0,0.45)';
      hist.forEach((p,i)=>{
        if(i % 3 !== 0) return; // una marca cada 3 puntos para no saturar
        const [x,y]=ts(p.x,p.y);
        ctx.beginPath(); ctx.arc(x,y,1.6,0,Math.PI*2); ctx.fill();
      });
    }

    const proj = ST.VECMIN/60;

    // CPA dot + line (only for selected target, ARPA-style)
    if(isSelected && !isNaN(sol.tcpa) && sol.tcpa>0){
      const th = sol.tcpa/60;
      const [cpx,cpy] = ts(sol.pos.x+sol.rvx*th, sol.pos.y+sol.rvy*th);
      ctx.strokeStyle='rgba(255,50,50,0.4)'; ctx.lineWidth=0.8; ctx.setLineDash([3,4]);
      ctx.beginPath(); ctx.moveTo(CX,CY); ctx.lineTo(cpx,cpy); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle='#ff3333';
      ctx.beginPath(); ctx.arc(cpx,cpy,5,0,Math.PI*2); ctx.fill();
      txt(cpx+7,cpy-3,'CPA '+sol.cpa.toFixed(2),'bold 9px Courier New','#ff8888',screenRot);
    }

    // BCR circle (selected only)
    if(isSelected && sol.bcr!==null && sol.bct!==null && sol.bct<9999 && sol.bct>0){
      const [bcx,bcy] = ts(0, sol.bcr);
      ctx.strokeStyle='#44ff88'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(bcx,bcy,6,0,Math.PI*2); ctx.stroke();
      txt(bcx+8,bcy+4,'BCR','bold 9px Courier New','#44ff88',screenRot);
    }

    // True COG/SOG vector (dashed, always)
    const [tvex,tvey] = ts(sol.pos.x+sol.tgt_cog_vec.x*proj, sol.pos.y+sol.tgt_cog_vec.y*proj);
    ctx.strokeStyle='rgba(255,255,0,0.55)'; ctx.lineWidth=1.2; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.moveTo(txs,tys); ctx.lineTo(tvex,tvey); ctx.stroke();
    ctx.setLineDash([]);

    // Heading line (solid, gyro)
    const thrad = d2r(tgt.hdg);
    const [hlx,hly] = ts(sol.pos.x+Math.sin(thrad)*1.4, sol.pos.y+Math.cos(thrad)*1.4);
    ctx.strokeStyle='#ffff00'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(txs,tys); ctx.lineTo(hlx,hly); ctx.stroke();

    // Target dot
    ctx.fillStyle = isSelected ? '#ffff00' : 'rgba(255,255,0,0.55)';
    ctx.beginPath(); ctx.arc(txs,tys,isSelected?7:5,0,Math.PI*2); ctx.fill();
    if(isSelected){
      ctx.strokeStyle='#ffff00'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(txs,tys,11,0,Math.PI*2); ctx.stroke();
    }
    txt(txs+9,tys-8,tgt.name.split(' ')[0],'bold 9px Courier New','#ffff00',screenRot);

    // ARPA relative vector (thick, selected only)
    if(isSelected){
      const [rvex,rvey] = ts(sol.pos.x+sol.rvx*proj, sol.pos.y+sol.rvy*proj);
      const ang = Math.atan2(rvex-txs,-(rvey-tys));
      ctx.strokeStyle='#ffff00'; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.moveTo(txs,tys); ctx.lineTo(rvex,rvey); ctx.stroke();
      ctx.fillStyle='#ffff00';
      ctx.beginPath();
      ctx.moveTo(rvex+Math.sin(ang)*7,rvey-Math.cos(ang)*7);
      ctx.lineTo(rvex+Math.sin(ang-2.4)*4,rvey-Math.cos(ang-2.4)*4);
      ctx.lineTo(rvex+Math.sin(ang+2.4)*4,rvey-Math.cos(ang+2.4)*4);
      ctx.closePath(); ctx.fill();
    }
  });

  // === Capa de objetos de navegacion (boyas, balizas, puentes) ===
  if(ST.SHOW_OBJECTS && NAV_OBJECTS.length > 0){
    const osLat = os.lat, osLon = os.lon;
    if(osLat !== null && osLon !== null){
      NAV_OBJECTS.forEach(obj=>{
        const {brg, rng} = brgRngBetween(osLat, osLon, obj.lat, obj.lon);
        if(rng > ST.RNG * 1.05) return; // fuera del rango visible
        const nx = rng*Math.sin(d2r(brg));
        const ny = rng*Math.cos(d2r(brg));
        const [ox, oy] = ts(nx, ny);
        const st = OBJ_STYLE[obj.t] || OBJ_STYLE.baliza;
        ctx.fillStyle = st.color;
        ctx.strokeStyle = st.color;
        ctx.lineWidth = 1;
        const s = st.size;
        switch(st.shape){
          case 'circle':
            ctx.beginPath(); ctx.arc(ox,oy,s,0,Math.PI*2); ctx.fill();
            break;
          case 'triangle':
            // Verde apunta arriba (babor), rojo apunta abajo (estribor)
            const flip = obj.t==='rojo' ? 1 : -1;
            ctx.beginPath();
            ctx.moveTo(ox, oy + flip*s);
            ctx.lineTo(ox - s, oy - flip*s);
            ctx.lineTo(ox + s, oy - flip*s);
            ctx.closePath(); ctx.fill();
            break;
          case 'diamond':
            ctx.beginPath();
            ctx.moveTo(ox, oy-s); ctx.lineTo(ox+s, oy);
            ctx.lineTo(ox, oy+s); ctx.lineTo(ox-s, oy);
            ctx.closePath(); ctx.fill();
            break;
          case 'square':
            ctx.fillRect(ox-s, oy-s, s*2, s*2);
            break;
          case 'cross':
            ctx.beginPath();
            ctx.moveTo(ox-s,oy); ctx.lineTo(ox+s,oy);
            ctx.moveTo(ox,oy-s); ctx.lineTo(ox,oy+s);
            ctx.stroke();
            break;
          case 'star':
            ctx.beginPath(); ctx.arc(ox,oy,s,0,Math.PI*2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(ox,oy-s*1.6); ctx.lineTo(ox,oy+s*1.6);
            ctx.moveTo(ox-s*1.6,oy); ctx.lineTo(ox+s*1.6,oy);
            ctx.stroke();
            break;
        }
      });
    }
  }

  // === OS own ship ===
  const osr = d2r(os.hdg);
  function rot(px,py){ return [CX+px*Math.cos(osr)-py*Math.sin(osr), CY+px*Math.sin(osr)+py*Math.cos(osr)]; }

  // OS COG/SOG dashed
  const proj2 = ST.VECMIN/60;
  const [ovex,ovey] = ts(os.cog_vec.x*proj2, os.cog_vec.y*proj2);
  ctx.strokeStyle='rgba(0,255,65,0.6)'; ctx.lineWidth=1.2; ctx.setLineDash([5,4]);
  ctx.beginPath(); ctx.moveTo(CX,CY); ctx.lineTo(ovex,ovey); ctx.stroke();
  ctx.setLineDash([]);

  // OS heading line (solid) — va del centro hasta el borde del rango visible
  const rr = ST.RNG*PX;
  const [hlOx,hlOy] = [CX+Math.sin(osr)*rr, CY-Math.cos(osr)*rr];
  ctx.strokeStyle='#00ff41'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(CX,CY); ctx.lineTo(hlOx,hlOy); ctx.stroke();

  // OS triangle
  ctx.fillStyle='#00ff41';
  ctx.beginPath();
  const [p1x,p1y]=rot(0,-9), [p2x,p2y]=rot(-5,5), [p3x,p3y]=rot(5,5);
  ctx.moveTo(p1x,p1y); ctx.lineTo(p2x,p2y); ctx.lineTo(p3x,p3y); ctx.closePath(); ctx.fill();
  const stLabel = (ST.SOURCE==='live' && ST.miNombre) ? ST.miNombre : ST.stationNameManual;
  txt(CX-7,CY+16, ST.SOURCE==='live' ? stLabel+' ▶VIVO' : stLabel, 'bold 9px Courier New','#00ff41',screenRot);

  // VRM rings
  [ST.vrm1, ST.vrm2].forEach((v,i)=>{
    if(v.on){
      ctx.strokeStyle = i===0 ? '#00ccff' : '#ff66ff';
      ctx.lineWidth=1; ctx.setLineDash([2,2]);
      ctx.beginPath(); ctx.arc(CX,CY,v.dist*PX,0,Math.PI*2); ctx.stroke();
      ctx.setLineDash([]);
      const [lx,ly]=ts(0.1, v.dist-0.1);
      txt(lx,ly,'VRM'+(i+1)+' '+v.dist.toFixed(2),'9px Courier New', i===0?'#00ccff':'#ff66ff',screenRot);
    }
  });

  // EBL lines
  [ST.ebl1, ST.ebl2].forEach((e,i)=>{
    if(e.on){
      const rad=d2r(e.brg), rr=ST.RNG*PX;
      ctx.strokeStyle = i===0 ? '#00ccff' : '#ff66ff';
      ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(CX,CY); ctx.lineTo(CX+Math.sin(rad)*rr,CY-Math.cos(rad)*rr); ctx.stroke();
      const lx=CX+Math.sin(rad)*rr*0.5, ly=CY-Math.cos(rad)*rr*0.5;
      txt(lx+4,ly,'EBL'+(i+1)+' '+String(Math.round(e.brg)).padStart(3,'0')+'°','9px Courier New',i===0?'#00ccff':'#ff66ff',screenRot);
    }
  });

  // Index line (parallel index)
  if(ST.indexLine.on){
    const rad=d2r(ST.indexLine.brg), rr=ST.RNG*PX;
    const perpX=Math.cos(rad)*ST.indexLine.offset*PX, perpY=Math.sin(rad)*ST.indexLine.offset*PX;
    ctx.strokeStyle='#ffaa00'; ctx.lineWidth=1; ctx.setLineDash([8,4]);
    ctx.beginPath();
    ctx.moveTo(CX+perpX-Math.sin(rad)*rr, CY-perpY+Math.cos(rad)*rr);
    ctx.lineTo(CX+perpX+Math.sin(rad)*rr, CY-perpY-Math.cos(rad)*rr);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // MOB marker
  if(ST.MOB && ST.mobPos){
    const dlat=(ST.mobPos.lat-os.lat)*60, dlon=(ST.mobPos.lon-os.lon)*60*Math.cos(d2r(os.lat));
    const [mx,my]=ts(dlon,dlat);
    ctx.strokeStyle='#ff3333'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(mx,my,10,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mx-12,my); ctx.lineTo(mx+12,my); ctx.moveTo(mx,my-12); ctx.lineTo(mx,my+12); ctx.stroke();
    txt(mx+13,my,'MOB','bold 10px Courier New','#ff3333',screenRot);
  }

  // compass N/S/E/W
  txt(CX-4,12,'N','bold 10px Courier New','#2a6a3a',screenRot);
  txt(CX-3,H-4,'S','bold 10px Courier New','#2a6a3a',screenRot);
  txt(W-14,CY+4,'E','bold 10px Courier New','#2a6a3a',screenRot);
  txt(4,CY+4,'W','bold 10px Courier New','#2a6a3a',screenRot);

  ctx.restore();

  // === Fixed screen overlays (not rotated) ===
  const oriLabel = ST.ORI==='north'?'NORTH UP':(ST.ORI==='course'?'COURSE UP':'HEAD UP');
  ctx.fillStyle='#0a2a0a'; ctx.fillRect(6,6,84,16);
  ctx.strokeStyle='#1a5a2a'; ctx.lineWidth=1; ctx.strokeRect(6,6,84,16);
  ctx.fillStyle='#44ff88'; ctx.font='bold 9px Courier New';
  ctx.fillText(oriLabel+' / '+ST.MODE,11,18);

  // Heading-up triangle marker at top of screen when in head/course mode at true heading 0 offset
  if(ST.ORI!=='north'){
    ctx.fillStyle='#ffff00';
    ctx.beginPath();
    ctx.moveTo(CX,8); ctx.lineTo(CX-5,18); ctx.lineTo(CX+5,18); ctx.closePath(); ctx.fill();
  }

  // Off-center indicator — small circle showing where OS actually is when off-center
  if(ST.offX!==0 || ST.offY!==0){
    ctx.strokeStyle='rgba(0,255,65,0.4)'; ctx.lineWidth=1; ctx.setLineDash([2,4]);
    ctx.beginPath(); ctx.arc(CX,CY,8,0,Math.PI*2); ctx.stroke();
    ctx.setLineDash([]);
    // Reset button hint
    ctx.fillStyle='rgba(0,255,65,0.6)'; ctx.font='8px Courier New';
    ctx.fillText('OFF-CTR  [dbl-click]=reset', W/2-55, H-8);
  }

  // Cursor cross + BRG/RNG readout
  if(ST._cursorX!==null && ST._cursorY!==null){
    const mx=ST._cursorX, my=ST._cursorY;
    const sz=12;
    ctx.strokeStyle='#ffffff'; ctx.lineWidth=1;
    ctx.beginPath();
    ctx.moveTo(mx-sz,my); ctx.lineTo(mx+sz,my);
    ctx.moveTo(mx,my-sz); ctx.lineTo(mx,my+sz);
    ctx.stroke();
    // Small gap in center (classic radar cursor style)
    ctx.clearRect(mx-3,my-3,6,6);

    // BRG/RNG from OS to cursor
    const dxNM = (mx - CX)/PX;
    const dyNM = (CY - my)/PX;
    // Rotate back from screen orientation to true north
    let screenRot2 = 0;
    if(ST.ORI==='head') screenRot2 = os.hdg;
    else if(ST.ORI==='course') screenRot2 = os.cog;
    const sinR=Math.sin(d2r(screenRot2)), cosR=Math.cos(d2r(screenRot2));
    const trueDX = dxNM*cosR + dyNM*sinR;
    const trueDY = -dxNM*sinR + dyNM*cosR;
    const cursorBrg = norm360(r2d(Math.atan2(trueDX, trueDY)));
    const cursorRng = Math.sqrt(trueDX*trueDX + trueDY*trueDY);

    const label = String(Math.round(cursorBrg)).padStart(3,'0')+'°  '+cursorRng.toFixed(2)+' NM';
    ctx.font='bold 10px Courier New';
    const tw=ctx.measureText(label).width;
    let lx=mx+14, ly=my-8;
    if(lx+tw+6>W) lx=mx-tw-14;
    if(ly-4<0) ly=my+18;
    ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(lx-3,ly-11,tw+6,14);
    ctx.fillStyle='#ffffff'; ctx.fillText(label,lx,ly);
  }
}

function updateTrailHistory(os){
  const now = Date.now();
  const cutoff = now - ST.TRAILMIN*60*1000;

  ST.targets.forEach(tgt=>{
    const sol = computeTargetSolution(os, tgt);
    if(!trailHistory[tgt.id]) trailHistory[tgt.id]=[];
    trailHistory[tgt.id].push({x:sol.pos.x, y:sol.pos.y, t:now});
    trailHistory[tgt.id] = trailHistory[tgt.id].filter(p=>p.t>cutoff).slice(-200);
  });

  // OS trail: solo tiene sentido en True Motion, donde el OS se desplaza
  // realmente por la pantalla. En Relative Motion el OS esta siempre fijo
  // en el centro por definicion, asi que no hay rastro que mostrar.
  if(ST.MODE==='TM'){
    if(!ST._osTrailOriginLat) { ST._osTrailOriginLat = os.lat; ST._osTrailOriginLon = os.lon; }
    const dLat = (os.lat - ST._osTrailOriginLat)*60;
    const dLon = (os.lon - ST._osTrailOriginLon)*60*Math.cos(d2r(os.lat));
    osTrailHistory.push({x:dLon, y:dLat, t:now});
    while(osTrailHistory.length && osTrailHistory[0].t<=cutoff) osTrailHistory.shift();
    if(osTrailHistory.length>200) osTrailHistory.shift();
  } else {
    osTrailHistory.length = 0; // limpiar al volver a RM
    ST._osTrailOriginLat = null; ST._osTrailOriginLon = null;
  }
}
