/* ============================================================
   RADAR ESNF — Modulo de datos y calculos
   Escuela Nacional Fluvial
   ============================================================ */

function d2r(d){return d*Math.PI/180}
function r2d(r){return r*180/Math.PI}
function norm360(d){return ((d%360)+360)%360}
function fmtTime(m){
  if(m===null||isNaN(m))return '—';
  if(Math.abs(m)>999)return (m<0?'-':'')+'>99:59';
  const mm=Math.abs(m)|0,ss=Math.round((Math.abs(m)-mm)*60);
  return (m<0?'-':'')+mm+':'+(ss<10?'0':'')+ss;
}
function fmtLatLon(lat,lon){
  if(lat===null||lon===null)return {lat:'— —',lon:'— —'};
  const latD=Math.abs(lat)|0, latM=((Math.abs(lat)-latD)*60).toFixed(3);
  const lonD=Math.abs(lon)|0, lonM=((Math.abs(lon)-lonD)*60).toFixed(3);
  return {
    lat: latD+'°'+latM+"'"+(lat>=0?'N':'S'),
    lon: lonD+'°'+lonM+"'"+(lon>=0?'E':'W')
  };
}

/* ===== ESTADO GLOBAL ===== */
const ST = {
  // Pantalla
  ORI: 'north',          // north | course | head
  MODE: 'RM',            // RM (relative motion) | TM (true motion)
  RNG: 4,                // millas nauticas de rango
  VECMIN: 6,             // minutos de proyeccion del vector
  RINGS: true,
  TRAIL: false,
  TRAILMIN: 6,
  INTERFERENCE: false,

  // Ganancias (cosmetico / educativo)
  GAIN: 70,
  SEA: 30,
  RAIN: 10,

  // Fuente de datos del buque propio
  SOURCE: 'manual',      // manual | live
  MOB: false,
  mobPos: null,

  // Buque propio (manual)
  os: {
    hdg: 0,     // rumbo de aguja (giro)
    stw: 10,    // velocidad sobre el agua
    lat: -34.55, lon: -58.45,
  },

  // Corriente (manual, solo aplica en modo manual)
  current: { dir: 0, spd: 0 },
  // Viento (manual)
  wind: { dir: 0, spd: 0 },

  // Datos en vivo (recibidos por WebSocket desde puente_nmea.py)
  live: {
    lat:null, lon:null, sog:null, cog:null, hdg:null, stw:null,
    conectado_vs:false, ultima_actualizacion:0
  },

  // VRM / EBL
  vrm1: { on:false, dist:1.0 },
  vrm2: { on:false, dist:2.0 },
  ebl1: { on:false, brg:0 },
  ebl2: { on:false, brg:90 },
  indexLine: { on:false, brg:0, offset:0 },

  // Blancos trackeados (TT - Target Tracking / ACQ)
  targets: [],
  selectedTarget: null,

  // Blancos remotos recibidos por la red AIS local (otras maquinas/cadetes)
  remoteAis: {}, // {nombre: {lat,lon,hdg,stw,cog,sog}}
  miNombre: null,

  ws: null,
  stationNameManual: 'OS',
  positionHidden: false,
  selectedTargets: [],  // hasta 3 blancos seleccionados simultaneamente para multi-panel
};

// Distancia (mn) y marcacion (grados) entre dos puntos lat/lon, aproximacion plana
// valida para distancias cortas tipicas de practica de radar (rios, puertos)
function brgRngBetween(lat1,lon1,lat2,lon2){
  const NM_PER_DEG_LAT = 60;
  const dy = (lat2-lat1)*NM_PER_DEG_LAT;
  const dx = (lon2-lon1)*NM_PER_DEG_LAT*Math.cos(d2r((lat1+lat2)/2));
  const rng = Math.sqrt(dx*dx+dy*dy);
  const brg = norm360(r2d(Math.atan2(dx,dy)));
  return { brg, rng };
}

// Convierte los blancos AIS remotos (de la red de companeros) a targets del radar,
// calculando su BRG/RNG en vivo respecto a la posicion actual del OS.
function syncRemoteAisTargets(osLat, osLon){
  if(osLat===null || osLon===null) return;
  const remoteIds = Object.keys(ST.remoteAis);
  // quitar targets remotos que ya no estan en la lista (companero desconectado)
  ST.targets = ST.targets.filter(t => !t.isRemoteAis || remoteIds.includes(t.id));
  remoteIds.forEach(nombre=>{
    const b = ST.remoteAis[nombre];
    if(b.lat===null || b.lon===null) return;
    const {brg,rng} = brgRngBetween(osLat, osLon, b.lat, b.lon);
    let existing = ST.targets.find(t=>t.id===nombre && t.isRemoteAis);
    if(!existing){
      existing = { id: nombre, name: nombre, mmsi: 'AIS-LAN', status: 'CADETE (red local)', isRemoteAis:true };
      ST.targets.push(existing);
      if(ST.selectedTarget===null) ST.selectedTarget = existing.id;
    }
    existing.brg = brg; existing.dst = rng;
    existing.hdg = (b.hdg!==null && b.hdg!==undefined) ? b.hdg : (b.cog||0);
    existing.stw = (b.stw!==null && b.stw!==undefined) ? b.stw : (b.sog||0);
  });
}


/* ===== ESCENARIOS PRE-ARMADOS (igual logica que antes) ===== */
const SCENARIOS = {
  maersk: {
    os:{hdg:0,stw:10}, current:{dir:0,spd:0},
    targets:[{id:'C',name:'MAERSK LABERINTO',mmsi:'219542000',hdg:100,stw:11,brg:60,dst:3,status:'UNDER WAY'}]
  },
  ladyj: {
    os:{hdg:0,stw:10}, current:{dir:0,spd:0},
    targets:[{id:'A',name:'LADY J',mmsi:'636022859',hdg:137,stw:12,brg:1,dst:4.4,status:'UNDER WAY'}]
  },
  cruce: {
    os:{hdg:0,stw:12}, current:{dir:0,spd:0},
    targets:[{id:'1',name:'BLANCO TGT-01',mmsi:'—',hdg:260,stw:14,brg:50,dst:5,status:'TT MAN'}]
  },
  frente: {
    os:{hdg:0,stw:10}, current:{dir:0,spd:0},
    targets:[{id:'2',name:'BLANCO TGT-02',mmsi:'—',hdg:178,stw:14,brg:2,dst:7,status:'TT MAN'}]
  },
  alcance: {
    os:{hdg:0,stw:14}, current:{dir:0,spd:0},
    targets:[{id:'3',name:'BLANCO TGT-03',mmsi:'—',hdg:5,stw:7,brg:170,dst:3,status:'TT MAN'}]
  },
  seguro: {
    os:{hdg:0,stw:10}, current:{dir:0,spd:0},
    targets:[{id:'4',name:'BLANCO TGT-04',mmsi:'—',hdg:80,stw:10,brg:40,dst:9,status:'TT MAN'}]
  },
  multi: {
    os:{hdg:0,stw:11}, current:{dir:140,spd:0.8},
    targets:[
      {id:'C',name:'MAERSK LABERINTO',mmsi:'219542000',hdg:100,stw:11,brg:60,dst:3,status:'UNDER WAY'},
      {id:'A',name:'LADY J',mmsi:'636022859',hdg:137,stw:12,brg:1,dst:4.4,status:'UNDER WAY'},
      {id:'5',name:'BLANCO TGT-05',mmsi:'—',hdg:300,stw:9,brg:290,dst:5.5,status:'TT MAN'}
    ]
  }
};

/* ===== CALCULOS NAUTICOS ===== */

// Devuelve el vector {x,y} (x=Este, y=Norte) de rumbo+velocidad
function vecFromHdgSpd(hdg,spd){
  return { x: spd*Math.sin(d2r(hdg)), y: spd*Math.cos(d2r(hdg)) };
}

// Posicion relativa (mn) de un blanco dado BRG/RNG desde el OS
function posFromBrgRng(brg,rng){
  return { x: rng*Math.sin(d2r(brg)), y: rng*Math.cos(d2r(brg)) };
}

// Calcula el estado completo del buque propio para este frame
function computeOwnShip(){
  let hdg, stw, curdir, curspd, lat, lon;

  if(ST.SOURCE==='live' && ST.live.conectado_vs && ST.live.hdg!==null){
    hdg = ST.live.hdg;
    stw = (ST.live.stw!==null) ? ST.live.stw : (ST.live.sog||0);
    lat = ST.live.lat; lon = ST.live.lon;
    if(ST.live.cog!==null && ST.live.sog!==null){
      const oh = vecFromHdgSpd(hdg,stw);
      const og = vecFromHdgSpd(ST.live.cog, ST.live.sog);
      const cdx=og.x-oh.x, cdy=og.y-oh.y;
      curdir = norm360(r2d(Math.atan2(cdx,cdy)));
      curspd = Math.sqrt(cdx*cdx+cdy*cdy);
    } else { curdir=0; curspd=0; }
  } else {
    hdg = ST.os.hdg; stw = ST.os.stw;
    curdir = ST.current.dir; curspd = ST.current.spd;
    lat = ST.os.lat; lon = ST.os.lon;
  }

  const heading_vec = vecFromHdgSpd(hdg,stw);
  const current_vec = vecFromHdgSpd(curdir,curspd);
  const cog_vec = { x: heading_vec.x+current_vec.x, y: heading_vec.y+current_vec.y };
  const cog = norm360(r2d(Math.atan2(cog_vec.x,cog_vec.y)));
  const sog = Math.sqrt(cog_vec.x*cog_vec.x+cog_vec.y*cog_vec.y);

  return { hdg, stw, cog, sog, cog_vec, heading_vec, curdir, curspd, lat, lon };
}

// Calcula CPA/TCPA/BCR/BCT para un blanco dado, usando vector relativo
function computeTargetSolution(os, tgt){
  const pos = posFromBrgRng(tgt.brg, tgt.dst);
  const tgt_heading_vec = vecFromHdgSpd(tgt.hdg, tgt.stw);
  const current_vec = vecFromHdgSpd(os.curdir, os.curspd);
  const tgt_cog_vec = { x: tgt_heading_vec.x+current_vec.x, y: tgt_heading_vec.y+current_vec.y };
  const tgt_cog = norm360(r2d(Math.atan2(tgt_cog_vec.x, tgt_cog_vec.y)));
  const tgt_sog = Math.sqrt(tgt_cog_vec.x**2 + tgt_cog_vec.y**2);

  const rvx = tgt_cog_vec.x - os.cog_vec.x;
  const rvy = tgt_cog_vec.y - os.cog_vec.y;
  const dot = pos.x*rvx + pos.y*rvy;
  const rs2 = rvx*rvx + rvy*rvy;

  let tcpa=NaN, cpa=NaN;
  if(rs2<0.0001){ tcpa=0; cpa=tgt.dst; }
  else {
    tcpa = (-dot/rs2)*60;
    const ch = tcpa/60;
    cpa = Math.sqrt((pos.x+rvx*ch)**2 + (pos.y+rvy*ch)**2);
  }

  let bcr=null, bct=null;
  if(Math.abs(rvx)>0.001){
    const tb = -pos.x/rvx;
    if(tb>=0){ bct=tb*60; bcr=pos.y+rvy*tb; }
  }

  return { pos, rvx, rvy, tcpa, cpa, bcr, bct, tgt_cog, tgt_sog, tgt_cog_vec, tgt_heading_vec };
}

// Carga un escenario predefinido en el estado
function loadScenario(key){
  const s = SCENARIOS[key];
  if(!s) return;
  ST.os.hdg = s.os.hdg; ST.os.stw = s.os.stw;
  ST.current.dir = s.current.dir; ST.current.spd = s.current.spd;
  ST.targets = s.targets.map(t=>({...t}));
  ST.selectedTarget = ST.targets.length ? ST.targets[0].id : null;
  ST.selectedTargets = ST.targets.length ? [ST.targets[0].id] : [];
}

// Init default scenario
loadScenario('maersk');
