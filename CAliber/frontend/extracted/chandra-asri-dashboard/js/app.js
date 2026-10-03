const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const P={
  dash:'<path d="M4 13h6V4H4zM14 20h6V11h-6zM4 20h6v-4H4zM14 7h6V4h-6z"/>',
  alert:'<path d="M6 8a6 6 0 0112 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 004 0"/>',
  report:'<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7"/>',
  set:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>'
};
const svg=k=>`<svg viewBox="0 0 24 24">${P[k]||''}</svg>`;

/* ===== NAV (no Laras in sidebar) ===== */
const NAV=[['dash','Executive Dashboard'],['set','Settings'],['alert','AI Alerts'],['report','Reports']];
const MACHINES=[['m_pu','PU-2101B'],['m_he','HE-3301'],['m_ko','KO-3201'],['m_pm','PM-4405B'],['m_bl','BL-5702']];

/* ===== MACHINE DATA (aligned with Chandra Asri dataset) ===== */
const MACHINE_DATA={
  'm_pu':{name:'PU-2101B',type:'Centrifugal Feed Pump',stat:'Critical',cls:'bad',dotCls:'red',
    statusMsg:'CRITICAL — Overall Vibration at 9.2 mm/s. Approaching TRIP threshold (11.22 mm/s). Bearing temperature co-rising. Risk of unplanned shutdown within 2–4 hours.',
    params:[
      {l:'Overall Vibration',v:'9.2',u:'mm/s',bad:true,limit:'< 7.1 | TRIP 11.22'},
      {l:'Bearing Temp',v:'95',u:'°C',bad:false,limit:'< 110'},
      {l:'Discharge Pressure',v:'9.54',u:'barg',bad:false,limit:'8–12'},
      {l:'Seal Flush Flow',v:'2.8',u:'L/min',bad:false,limit:'2.5–4.0'},
      {l:'Suction Pressure',v:'3.2',u:'barg',bad:false,limit:'2–5'},
      {l:'Motor Current',v:'128',u:'A',bad:false,limit:'< 150'},
      {l:'Differential Press.',v:'6.34',u:'barg',bad:false,limit:'4–8'},
      {l:'Running Hours',v:'8,420',u:'hrs',bad:false,limit:'—'}
    ],
    trend1:[3.8,4.1,4.3,5.2,6.8,8.1,9.2],trend1Label:'Overall Vibration (mm/s)',
    trend2:[78,80,82,85,88,92,95],trend2Label:'Bearing Temp (°C)',
    ops:[
      {l:'Running Hours',v:'8,420 hrs'},{l:'Last Maintenance',v:'2026-08-15'},
      {l:'Next Scheduled PM',v:'2026-10-15'},{l:'Manufacturer',v:'Sulzer AG'},
      {l:'Model',v:'MSD-D 150/6'},{l:'Rated Power',v:'185 kW'},
      {l:'Impeller Diameter',v:'380 mm'},{l:'Design Flow',v:'16 T/H'}
    ],
    shap:[{l:'Vibration Increase',v:0.62},{l:'Bearing Temp Rise',v:0.21},{l:'Seal Flush Drop',v:0.09},{l:'Motor Current',v:0.05},{l:'Discharge Press.',v:0.03}],
    historical:'2024-03-11: PU-2101A tripped at 11.22 mm/s — inner race bearing failure. Replaced SKF 6316, resumed in 7h.',
    corrective:'1. Reduce feed rate to 10 T/H immediately\n2. Dispatch field operator for vibration spectrum check\n3. Prepare standby pump PU-2101A\n4. Order bearing SKF 6316 (in stock, qty:4)',
    preventive:'Increase lubrication frequency. Install continuous online vibration monitoring. Set auto-alarm at 7.5 mm/s.',
    diagnosis:'<b>Root Cause Analysis (AI):</b><br><br>Vibration rising from 3.8 → 9.2 mm/s over 6 hours (exponential pattern). Co-rising bearing temperature (78°C → 95°C) strongly indicates progressive inner race bearing degradation.<ul><li><b>Primary (78% confidence):</b> Inner race bearing defect — 1x and 2x harmonic vibration spikes</li><li><b>Secondary (15%):</b> Impeller imbalance from abrasive particle erosion</li><li><b>Tertiary (7%):</b> Coupling misalignment after last PM</li></ul><b>AI Top Contributors:</b><ul><li>Overall Vibration trend: 62% contribution to anomaly score</li><li>Bearing Temp co-rise: 21%</li><li>Seal Flush Flow reduction: 9%</li></ul><b>Historical Match:</b> PU-2101A (2024-03-11) — same pattern, tripped at 11.22 mm/s, inner race confirmed.<br><br><b>Actions:</b><ol><li>⚠️ <b>Immediate:</b> Reduce feed rate to 10 T/H</li><li>📋 <b>1 hour:</b> Vibration spectrum analysis at DE/NDE</li><li>🔧 <b>4 hours:</b> Switchover to standby PU-2101A</li><li>🛑 <b>8 hours:</b> Shutdown for bearing replacement (SKF 6316, in stock)</li></ol><br><b>Est. downtime:</b> 6–8 hrs | <b>Financial impact:</b> ~$180k/day if trip occurs'
  },
  'm_he':{name:'HE-3301',type:'Fired Process Heater',stat:'Warning',cls:'warn',dotCls:'amber',
    statusMsg:'WARNING — Thermal efficiency declining at ~1%/hr over 6 hours (88% → 82%). Fuel consumption up 14%. Tube fouling suspected.',
    params:[
      {l:'Thermal Efficiency',v:'82',u:'%',bad:true,limit:'> 85'},
      {l:'Outlet Temp',v:'410',u:'°C',bad:false,limit:'400–420'},
      {l:'Fuel Flow',v:'3.2',u:'T/H',bad:false,limit:'2.5–3.5'},
      {l:'Stack Temp',v:'285',u:'°C',bad:false,limit:'< 320'},
      {l:'O₂ in Flue Gas',v:'3.1',u:'%',bad:false,limit:'2–4'},
      {l:'Draft Pressure',v:'-12',u:'mmWC',bad:false,limit:'-8 to -15'},
      {l:'Radiant Flux',v:'42.5',u:'kW/m²',bad:false,limit:'< 50'},
      {l:'Tube Skin Temp',v:'520',u:'°C',bad:false,limit:'< 560'}
    ],
    trend1:[88,87,85,84,83,82,82],trend1Label:'Thermal Efficiency (%)',
    trend2:[265,270,272,275,280,283,285],trend2Label:'Stack Temp (°C)',
    ops:[
      {l:'Running Hours',v:'12,050 hrs'},{l:'Last Decoking',v:'2026-06-20'},
      {l:'Next Scheduled',v:'2026-11-01'},{l:'Manufacturer',v:'Heurtey Petrochem'},
      {l:'Duty',v:'28 MW'},{l:'No. of Passes',v:'4'},
      {l:'Tube Material',v:'9Cr-1Mo Steel'},{l:'Design Pressure',v:'45 barg'}
    ],
    shap:[{l:'Efficiency Decline Rate',v:0.55},{l:'Stack Temp Rise',v:0.28},{l:'Fuel Flow Increase',v:0.12},{l:'Tube Skin Temp',v:0.05}],
    historical:'2023-09-05: HE-3301 efficiency dropped to 79% — tube hydroblast required, 3-day shutdown.',
    corrective:'1. Monitor tube skin temp closely (alarm at 540°C)\n2. Plan online spalling within 24h\n3. Review anti-fouling chemical injection rate\n4. Prepare hydroblast crew for next turnaround',
    preventive:'Install tube skin temperature distributed monitoring. Increase decoking frequency from 6m to 4m intervals.',
    diagnosis:'<b>Root Cause Analysis (AI):</b><br><br>Efficiency declining linearly at ~1%/hour (88% → 82%). Stack temperature rising concurrently (265°C → 285°C), confirming heat transfer degradation. Fuel flow increased 14% to maintain outlet temperature.<ul><li><b>Primary (85%):</b> Tube-side fouling/coking — deposits reducing heat transfer coefficient</li><li><b>Secondary (12%):</b> Burner tip degradation causing uneven flame</li><li><b>Tertiary (3%):</b> Air register misadjustment</li></ul><b>Actions:</b><ol><li>📊 <b>Now:</b> Monitor tube skin — reduce throughput if > 540°C</li><li>📋 <b>24 hrs:</b> Online spalling procedure</li><li>🔧 <b>Next shutdown:</b> Full hydroblast</li></ol><br><b>Financial impact:</b> ~$12,000/day in excess fuel'
  },
  'm_ko':{name:'KO-3201',type:'Knockout Drum',stat:'Normal',cls:'good',dotCls:'green',
    statusMsg:'NORMAL — All parameters within operating envelope. Liquid level stable, no carry-over detected.',
    params:[
      {l:'Liquid Level',v:'42',u:'%',bad:false,limit:'20–60'},
      {l:'Operating Pressure',v:'2.1',u:'barg',bad:false,limit:'1.5–3.0'},
      {l:'Inlet Temp',v:'65',u:'°C',bad:false,limit:'50–85'},
      {l:'Outlet Gas Flow',v:'18.4',u:'T/H',bad:false,limit:'12–24'},
      {l:'Liquid Drain Rate',v:'0.8',u:'T/H',bad:false,limit:'0–2.5'},
      {l:'ΔP (Mist Eliminator)',v:'0.12',u:'bar',bad:false,limit:'< 0.5'},
      {l:'Boot Level',v:'8',u:'%',bad:false,limit:'5–25'},
      {l:'Running Hours',v:'6,340',u:'hrs',bad:false,limit:'—'}
    ],
    trend1:[41,42,43,42,41,42,42],trend1Label:'Liquid Level (%)',
    trend2:[2.1,2.1,2.0,2.1,2.2,2.1,2.1],trend2Label:'Pressure (barg)',
    ops:[
      {l:'Running Hours',v:'6,340 hrs'},{l:'Last Inspection',v:'2026-05-10'},
      {l:'Next Inspection',v:'2027-05-10'},{l:'Manufacturer',v:'Frames Group'},
      {l:'Volume',v:'45 m³'},{l:'Design Pressure',v:'6 barg'},
      {l:'Mist Eliminator',v:'Wire Mesh Pad'},{l:'Vessel Material',v:'Carbon Steel'}
    ],
    shap:[{l:'Liquid Level',v:0.45},{l:'ΔP Mist Eliminator',v:0.30},{l:'Outlet Flow',v:0.15},{l:'Pressure',v:0.10}],
    historical:'No anomaly events in last 12 months.',
    corrective:'No corrective action required.',
    preventive:'Maintain quarterly mist eliminator inspection. Check boot level sensor calibration every 6 months.',
    diagnosis:'<b>AI Assessment:</b><br><br>KO-3201 is operating in normal condition. Liquid level stable at 42%, mist eliminator ΔP at 0.12 bar (well below 0.5 bar alarm). Gas-liquid separation is efficient.<ul><li>Boot level at 8% — no accumulation concern</li><li>No carry-over events in past 72 hours</li><li>ΔP across mist eliminator trending flat — no plugging</li></ul><b>No action required.</b>'
  },
  'm_pm':{name:'PM-4405B',type:'Process Pump',stat:'Normal',cls:'good',dotCls:'green',
    statusMsg:'NORMAL — All vibration and temperature parameters within design limits. Seal system functioning correctly.',
    params:[
      {l:'Overall Vibration',v:'3.1',u:'mm/s',bad:false,limit:'< 7.1'},
      {l:'Bearing Temp',v:'52',u:'°C',bad:false,limit:'< 110'},
      {l:'Discharge Pressure',v:'12.8',u:'barg',bad:false,limit:'10–16'},
      {l:'Seal Flush Flow',v:'3.2',u:'L/min',bad:false,limit:'2.5–4.0'},
      {l:'Suction Pressure',v:'2.1',u:'barg',bad:false,limit:'1.5–4'},
      {l:'Motor Current',v:'88',u:'A',bad:false,limit:'< 120'},
      {l:'Differential Press.',v:'10.7',u:'barg',bad:false,limit:'8–14'},
      {l:'Running Hours',v:'4,210',u:'hrs',bad:false,limit:'—'}
    ],
    trend1:[3.0,3.1,3.0,3.1,3.2,3.1,3.1],trend1Label:'Overall Vibration (mm/s)',
    trend2:[51,52,51,52,52,51,52],trend2Label:'Bearing Temp (°C)',
    ops:[
      {l:'Running Hours',v:'4,210 hrs'},{l:'Last Maintenance',v:'2026-07-20'},
      {l:'Next Scheduled PM',v:'2027-01-20'},{l:'Manufacturer',v:'Flowserve'},
      {l:'Model',v:'DVSH 150-400'},{l:'Rated Power',v:'110 kW'},
      {l:'Seal Type',v:'Mechanical Dual Seal'},{l:'Design Flow',v:'280 m³/hr'}
    ],
    shap:[{l:'Overall Vibration',v:0.50},{l:'Bearing Temp',v:0.28},{l:'Seal Flush Flow',v:0.14},{l:'Motor Current',v:0.08}],
    historical:'No anomaly events in last 12 months.',
    corrective:'No corrective action required.',
    preventive:'Maintain monthly vibration checks. Replace mechanical seal at 8,000 hrs or at next PM.',
    diagnosis:'<b>AI Assessment:</b><br><br>PM-4405B is operating in excellent condition. Overall vibration stable at 3.1 mm/s, bearing temperature at 52°C — both well within limits. Seal flush flow at 3.2 L/min confirms healthy seal system.<ul><li>Vibration trend flat over 6 hours — no degradation pattern</li><li>Seal flush flow consistent — no leakage indicators</li><li>Motor current at 88A — normal for current throughput</li></ul><b>No action required.</b> Next PM in 6 months.'
  },
  'm_bl':{name:'BL-5702',type:'Blower / Fan Unit',stat:'Normal',cls:'good',dotCls:'green',
    statusMsg:'NORMAL — Blower operating within all design parameters. Vibration and temperature levels are nominal.',
    params:[
      {l:'Overall Vibration',v:'2.4',u:'mm/s',bad:false,limit:'< 7.1'},
      {l:'Bearing Temp',v:'48',u:'°C',bad:false,limit:'< 100'},
      {l:'Discharge Pressure',v:'1.8',u:'barg',bad:false,limit:'1.2–2.5'},
      {l:'Motor Current',v:'72',u:'A',bad:false,limit:'< 95'},
      {l:'Air/Gas Flow',v:'14,200',u:'Nm³/hr',bad:false,limit:'10k–18k'},
      {l:'Inlet Temperature',v:'32',u:'°C',bad:false,limit:'10–45'},
      {l:'Shaft Speed',v:'1,480',u:'RPM',bad:false,limit:'1,440–1,500'},
      {l:'Running Hours',v:'3,850',u:'hrs',bad:false,limit:'—'}
    ],
    trend1:[2.3,2.4,2.4,2.3,2.4,2.5,2.4],trend1Label:'Overall Vibration (mm/s)',
    trend2:[47,48,47,48,48,48,48],trend2Label:'Bearing Temp (°C)',
    ops:[
      {l:'Running Hours',v:'3,850 hrs'},{l:'Last Maintenance',v:'2026-09-01'},
      {l:'Next Scheduled PM',v:'2027-03-01'},{l:'Manufacturer',v:'Howden'},
      {l:'Model',v:'HF 800'},{l:'Rated Power',v:'55 kW'},
      {l:'Impeller Type',v:'Backward Curved'},{l:'Design Pressure',v:'3 barg'}
    ],
    shap:[{l:'Overall Vibration',v:0.48},{l:'Bearing Temp',v:0.30},{l:'Motor Current',v:0.13},{l:'Discharge Press.',v:0.09}],
    historical:'No anomaly events in last 12 months.',
    corrective:'No corrective action required.',
    preventive:'Replace V-belt every 6 months. Clean inlet filter quarterly.',
    diagnosis:'<b>AI Assessment:</b><br><br>BL-5702 is in excellent health. Vibration at 2.4 mm/s and bearing temperature at 48°C are both nominal. Motor current at 72A reflects correct loading for current demand.<ul><li>Inlet filter ΔP within normal range — no blockage</li><li>Vibration spectrum clean — no dominant frequency peaks</li><li>Speed stable at 1,480 RPM — belt condition good</li></ul><b>No action required.</b>'
  }
};

/* ===== MACHINE DATA (comprehensive) ===== */
// Removed duplicate data

/* ===== BUILD SIDEBAR ===== */
function buildNav(){
  let h=`<button data-t="Toggle menu" id="tg">${svg('menu')}<span class="lbl">Collapse</span></button>`;
  // Machines first (at top)
  h+=`<div class="section-label">PLANT ASSETS</div>`;
  MACHINES.forEach(([k])=>{
    const d=MACHINE_DATA[k];
    h+=`<button data-k="${k}" data-t="${d.name} — ${d.stat}"><span class="status-dot ${d.dotCls}"></span><span class="lbl">${d.name} (${d.type.split(' ')[0]})</span></button>`;
  });
  h+=`<div class="divider"></div><span class="sp"></span>`;
  NAV.forEach(([k,t])=>{
    h+=`<button data-k="${k}" data-t="${t}" class="${k=='dash'?'on':''}">${svg(k)}<span class="lbl">${t}</span></button>`;
  });
  $('#nav').innerHTML=h;
  $('#tg').onclick=()=>$('#side').classList.toggle('open');
  $$('.nav [data-k]').forEach(b=>b.onclick=()=>go(b.dataset.k));
}

const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(t._);t._=setTimeout(()=>t.classList.remove('show'),2200)};

let names={};NAV.concat(MACHINES).forEach(([k,t])=>names[k]=t);

function go(k){
  if(k=='ai'){openAI();return}
  $$('.nav [data-k]').forEach(x=>x.classList.toggle('on',x.dataset.k==k));
  $('#cur').textContent=names[k]||k;
  const isMach=k.startsWith('m_');
  $('#grid').style.display=isMach?'none':'grid';
  $('#machine-grid').style.display=isMach?'grid':'none';
  if(isMach){renderMachine(k);return}
  if(k=='alert')$('#alerts').scrollIntoView({behavior:'smooth'});
  if(['report','set'].includes(k))toast(names[k]+' will be available in the next release');
}
$$('[data-go]').forEach(a=>a.onclick=()=>go(a.dataset.go));

/* ===== ALERTS ===== */
const A=[
  {id:1,c:'var(--rose)',tag:'Critical',t:'Vibration Anomaly on PU-2101B',m:'Feed Unit · Just now',
   r:'AI detected vibration spike to 16.5 mm/s — far above the 7.0 mm/s safe limit.',
   x:'<ul><li><b>Pattern:</b> Exponential increase over 3 hours (4.3 → 16.5 mm/s)</li><li><b>Cause:</b> Bearing inner race degradation (78% confidence)</li><li><b>Correlation:</b> Bearing temp rose from 78°C → 95°C</li><li><b>Time to trip:</b> Estimated 2–4 hours if unaddressed</li></ul><b>Actions Required:</b><ol><li>Reduce feed rate to 10 T/H immediately</li><li>Take portable vibration spectrum reading</li><li>Prepare standby pump PU-2101A</li></ol>'},
  {id:2,c:'var(--amber)',tag:'Warning',t:'HE-3301 Thermal Efficiency Declining',m:'Heater Unit · 1 hour ago',
   r:'Efficiency dropped from 88% to 82% over 6 hours. Fuel consumption up 4%.',
   x:'<ul><li><b>Pattern:</b> Linear decline ~1%/hour — consistent with tube fouling</li><li><b>Impact:</b> Extra 0.4 T/H fuel consumed (~$12,000/day loss)</li><li><b>Stack Temp:</b> 285°C and rising (alarm at 320°C)</li></ul><b>Actions Required:</b><ol><li>Monitor tube skin temperature closely</li><li>Plan online spalling within 24 hours</li><li>Schedule hydroblast at next shutdown</li></ol>'},
  {id:3,c:'var(--green)',tag:'Info',t:'KO-3201 Knockout Drum Normal',m:'Gas Processing · 2 hours ago',
   r:'Liquid level stable at 42%. No carry-over detected. Mist eliminator ΔP normal.',
   x:'<ul><li><b>Liquid Level:</b> 42% — within 20–60% range</li><li><b>ΔP Mist Eliminator:</b> 0.12 bar — no plugging</li><li><b>Boot Level:</b> 8% — no accumulation</li></ul><b>No action required.</b>'}
];
let st={};let flt='all';
function alerts(){
  const l=A.filter(a=>flt=='all'||(st[a.id]!='done'&&a.tag!=='Info'));
  // Make alerts expanded ('ex') by default to show root cause directly
  $('#alerts').innerHTML=l.map(a=>`<article class="al ${st[a.id]=='done'?'done':''} ex" style="--c:${a.c}"><div class="top"><h3>${a.t}</h3><span class="tag">${st[a.id]=='done'?'Resolved':a.tag}</span></div><div class="meta">${a.m}</div><div class="rec"><svg class="ic" viewBox="0 0 24 24"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/></svg><span>${a.r}</span></div><div class="more">${a.x}</div><div class="act"><button class="pri" data-a="done" data-i="${a.id}">${st[a.id]=='done'?'Reopen':'Mark Resolved'}</button><button data-a="mach" data-k="${a.id==1?'m_pu':(a.id==2?'m_he':'m_ko')}">View Machine Details</button><button data-a="ask" data-i="${a.id}">Ask AI</button></div></article>`).join('');
  const o=A.filter(a=>st[a.id]!='done'&&a.tag!=='Info').length;
  $('#asub').textContent=o?o+' require attention':'All resolved';
  $('#empty').style.display=l.length?'none':'block';
  $$('.act button').forEach(b=>b.onclick=()=>{
    const a=b.dataset.a;
    if(a=='done'){const i=+b.dataset.i;st[i]=st[i]=='done'?'':'done';toast(st[i]?'Marked as resolved':'Reopened');alerts();}
    else if(a=='mach'){go(b.dataset.k);}
    else if(a=='ask'){const i=+b.dataset.i;const al=A.find(x=>x.id==i);if(al)askAI('Explain in detail: '+al.t);}
  });
}
$$('#filt button').forEach(b=>b.onclick=()=>{flt=b.dataset.f;$$('#filt button').forEach(x=>x.classList.toggle('on',x==b));alerts()});

/* ===== OVERVIEW CARDS ===== */
function renderOverview(){
  let html='';
  let c=0,w=0,n=0;
  MACHINES.forEach(([k])=>{
    const d=MACHINE_DATA[k];
    if(d.stat=='Critical')c++;
    else if(d.stat=='Warning')w++;
    else n++;
    html+=`<div class="m-card" onclick="go('${k}')">
      <div class="m-card-top">
        <div class="m-card-title"><span class="status-dot ${d.dotCls}"></span> ${d.name}</div>
        <div class="m-card-status ${d.cls}">${d.stat}</div>
      </div>
      <div class="m-card-type">${d.type}</div>
      <div class="m-card-grid">
        <div class="m-card-kpi">${d.params[0].l}<strong>${d.params[0].v} <small>${d.params[0].u}</small></strong></div>
        <div class="m-card-kpi">${d.params[1].l}<strong>${d.params[1].v} <small>${d.params[1].u}</small></strong></div>
      </div>
      <div style="font-size:11px;color:var(--mute);margin-top:12px;text-align:right">Updated: Live</div>
    </div>`;
  });
  $('#machines-overview-grid').innerHTML=html;
  const ploss = c*180 + w*12; // Example financial impact based on data
  if($('#kpi-summary')) {
    $('#kpi-summary').innerHTML=`<div class="kpi-item"><div class="kpi-label">Production Output</div><div class="kpi-val">2,140 / 2,200 <small>T</small></div></div><div class="kpi-item"><div class="kpi-label">Equipment Health (OEE)</div><div class="kpi-val" style="color:var(--amber)">88.4%</div></div><div class="kpi-item"><div class="kpi-label">Incidents (Live)</div><div class="kpi-val" style="color:var(--rose)">${c} Critical</div></div><div class="kpi-item"><div class="kpi-label">Maint. Overtime</div><div class="kpi-val">12 <small>hrs</small></div></div>`;
  }
}

/* ===== MACHINE DETAIL ===== */
let mChart1=null,mChart2=null;
function renderMachine(k){
  const d=MACHINE_DATA[k];
  $('#m-name').textContent=d.name;
  $('#m-sub').textContent=d.type;

  // Status bar
  const stMap={good:'st-good',warn:'st-warn',bad:'st-bad'};
  $('#m-status-bar').className='detail-status-bar '+(stMap[d.cls]||'st-good');
  $('#m-status-bar').innerHTML=`<span class="status-dot ${d.dotCls}"></span>${d.statusMsg}`;

  // Params (8 cards)
  $('#m-specs').innerHTML=d.params.map(p=>`<div class="kpi"><span>${p.l}</span><strong style="${p.bad?'color:var(--rose)':''}">${p.v}</strong><em class="${p.bad?'dn':''}">${p.u} ${p.limit?'(limit: '+p.limit+')':''}</em></div>`).join('');

  // Alerts for this machine
  if(k==='m_pu') $('#m-alerts').innerHTML=A.filter(a=>a.id===1).map(a=>`<article class="al ex" style="--c:${a.c}"><div class="top"><h3>${a.t}</h3><span class="tag">${a.tag}</span></div><div class="meta">${a.m}</div><div class="rec"><svg class="ic" viewBox="0 0 24 24"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/></svg><span>${a.r}</span></div><div class="more">${a.x}</div></article>`).join('');
  else if(k==='m_he') $('#m-alerts').innerHTML=A.filter(a=>a.id===2).map(a=>`<article class="al ex" style="--c:${a.c}"><div class="top"><h3>${a.t}</h3><span class="tag">${a.tag}</span></div><div class="meta">${a.m}</div><div class="rec"><svg class="ic" viewBox="0 0 24 24"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/></svg><span>${a.r}</span></div><div class="more">${a.x}</div></article>`).join('');
  else $('#m-alerts').innerHTML='<div class="empty" style="display:block;padding:20px;">No anomalies detected. This unit is operating within all normal parameters.</div>';

      // AI Diagnosis & Action Plan
    if (d.stat === 'Normal') {
      $('#m-ai-diagnosis').innerHTML='<div class="ai-diagnosis-card" style="border-left-color:var(--green);"><b>Status: Normal</b><br><br>No anomaly detected. All parameters within safe operating limits.</div>';
      $('#m-ai-shap').innerHTML='<div class="empty">No AI parameter contribution to display.</div>';
      $('#m-ai-historical').innerHTML='N/A';
      $('#m-ai-corr').innerHTML='N/A';
      $('#m-ai-prev').innerHTML='N/A';
    } else {
      $('#m-ai-diagnosis').innerHTML=`<div class="ai-diagnosis-card">${d.diagnosis}</div>`;
      if(d.shap){
        $('#m-ai-shap').innerHTML=d.shap.map(s=>`<div class="shap-bar"><div class="shap-lbl">${s.l}</div><div class="shap-track"><div class="shap-fill" style="width:${s.v*100}%"></div></div><div class="shap-val">${(s.v*100).toFixed(0)}%</div></div>`).join('');
      } else {
        $('#m-ai-shap').innerHTML='<div class="empty">No AI data available</div>';
      }
      if(d.historical) $('#m-ai-historical').innerHTML=d.historical;
      else $('#m-ai-historical').innerHTML='No exact historical match found.';
      if(d.corrective) $('#m-ai-corr').innerHTML=d.corrective.replace(/\n/g,'<br><br>');
      else $('#m-ai-corr').innerHTML='N/A';
      if(d.preventive) $('#m-ai-prev').innerHTML=d.preventive.replace(/\n/g,'<br><br>');
      else $('#m-ai-prev').innerHTML='N/A';
    }    // Operational info
  $('#m-opinfo').innerHTML=d.ops.map(o=>`<div class="op-info-item"><div class="op-label">${o.l}</div><div class="op-value">${o.v}</div></div>`).join('');

  // Charts
  let labels = ['-6h','-5h','-4h','-3h','-2h','-1h','Now'];
  if (window.dateFilter === 'day') labels = ['00:00','04:00','08:00','12:00','16:00','20:00','24:00'];
  if (window.dateFilter === 'week') labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  if (window.dateFilter === 'month') labels = ['1st','5th','10th','15th','20th','25th','30th'];
  if (window.dateFilter === 'year') labels = ['Jan','Mar','May','Jul','Sep','Nov','Dec'];
  const isBad=d.cls!=='good';
  const chartOpts=(label)=>({
    type:'line',
    data:{labels,datasets:[{
      label, data:[], borderWidth:3, tension:0.4, pointRadius:5,
      pointBackgroundColor:'#fff', pointBorderWidth:2.5, fill:true
    }]},
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:true,position:'top',labels:{font:{size:11,family:'Open Sans'},usePointStyle:true,padding:12}}},
      scales:{x:{grid:{display:false},ticks:{font:{size:10}}},y:{grid:{color:'rgba(0,0,0,0.06)'},ticks:{font:{size:10}}}},
      interaction:{intersect:false,mode:'index'},elements:{point:{hoverRadius:7}}
    }
  });

  // Chart 1
  const ctx1=document.getElementById('m-chart').getContext('2d');
  if(mChart1)mChart1.destroy();
  const c1=chartOpts(d.trend1Label);
  c1.data.datasets[0].data=d.trend1;
  c1.data.datasets[0].borderColor=isBad?'#d4685f':'#4fae8a';
  c1.data.datasets[0].backgroundColor=isBad?'rgba(212,104,95,0.08)':'rgba(79,174,138,0.08)';
  c1.data.datasets[0].pointBorderColor=isBad?'#d4685f':'#4fae8a';
  mChart1=new Chart(ctx1,c1);

  // Chart 2
  const ctx2=document.getElementById('m-chart2').getContext('2d');
  if(mChart2)mChart2.destroy();
  const c2=chartOpts(d.trend2Label);
  c2.data.datasets[0].data=d.trend2;
  c2.data.datasets[0].borderColor='#2575b8';
  c2.data.datasets[0].backgroundColor='rgba(37,117,184,0.08)';
  c2.data.datasets[0].pointBorderColor='#2575b8';
  mChart2=new Chart(ctx2,c2);
}

/* ===== UTILITIES (for laras.js) ===== */
window.dateFilter = 'live';
if($('#dateFilter')) {
  $('#dateFilter').onchange = (e) => {
    window.dateFilter = e.target.value;
    const txt = e.target.options[e.target.selectedIndex].text;
    toast('Fetching data for ' + txt + '...');
    const ck = document.querySelector('.nav button.on')?.dataset.k;
    if (ck && ck.startsWith('m_')) renderMachine(ck);
  };
}
$('#theme').onclick=()=>{const r=document.documentElement,d=r.dataset.theme=='dark'||(!r.dataset.theme&&matchMedia('(prefers-color-scheme:dark)').matches);r.dataset.theme=d?'light':'dark'};
const tick=()=>{const cl=$('#clock');if(cl)cl.textContent=new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})};tick();setInterval(tick,30000);
const TODAY='2026-10-01',MIN='2026-01-01',sum=a=>a.reduce((x,y)=>x+y,0),nf=(v,o)=>v.toLocaleString('en-US',o);
let DATE=TODAY,R='day';
const addD=(s,n)=>{const d=new Date(s+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
const fmt=(s,o)=>new Date(s+'T12:00:00Z').toLocaleDateString('en-US',Object.assign({timeZone:'UTC'},o));
function rng(str){let h=2166136261;for(const c of str){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const TG=[820,830,840,850,850,860,860,860,850,850,840,840];
function dayPts(s){const r=rng(s),bias=.965+r()*.045,sp=Math.floor(r()*12);return{t:TG,a:TG.map(v=>Math.round(v*(bias+(r()-.5)*.025))),e:TG.map((v,i)=>+(61+r()*3+(i==sp?3:0)).toFixed(1))}}
const hh=i=>String(i*2).padStart(2,'0')+':00';
function gen(rg,end){if(rg=='day'){const p=dayPts(end),h=Array.from({length:12},(_,i)=>hh(i));return{l:h,f:h.map(x=>fmt(end,{weekday:'long',day:'numeric',month:'short'})+' · '+x),t:p.t,a:p.a,e:p.e,u:'ton/h',m:2,dates:[]}}const n=rg=='week'?7:30,dates=Array.from({length:n},(_,i)=>addD(end,i-n+1)),pp=dates.map(dayPts);return{l:dates.map(s=>rg=='week'?fmt(s,{weekday:'short'})+' '+fmt(s,{day:'numeric'}):fmt(s,{day:'numeric',month:'short'})),f:dates.map(s=>fmt(s,{weekday:'long',day:'numeric',month:'long'})),t:pp.map(p=>sum(p.t)*2),a:pp.map(p=>sum(p.a)*2),e:pp.map(p=>+(sum(p.e)/12).toFixed(1)),u:'ton/day',m:1,dates}}
const KP=d=>{const ta=sum(d.t)*d.m,ac=sum(d.a)*d.m,p=ac/ta*100,o={maximumFractionDigits:1};return[['Target',nf(p,o)+'%'],['Production',nf(ac/1000,o)+' kt'],['Avg Energy',nf(sum(d.e)/d.e.length,o)+' GJ/t']]};
const period=()=>fmt(DATE,{weekday:'long',day:'numeric',month:'long',year:'numeric'});
function updCtx(){const e=$('#ctx');if(e)e.textContent='AI Assistant is reading: 5 plant machine units in real-time'}

function updateNavStatus() {
  MACHINES.forEach(([k]) => {
    const d = MACHINE_DATA[k];
    const btn = document.querySelector(`.nav button[data-k="${k}"]`);
    if (btn) {
      btn.innerHTML = `<span class="status-dot ${d.dotCls}"></span><span class="lbl">${d.name} (${d.type.split(' ')[0]})</span>`;
      btn.dataset.t = `${d.name} — ${d.stat}`;
    }
  });
}

buildNav();
renderOverview();
alerts();

/* ===== LIVE SIMULATION ===== */
let simTimer=null, simTick=0;
let BASE_DATA = null;

$('#btnDemo').onclick = () => {
  if (simTimer) {
    clearInterval(simTimer);
    simTimer = null;
    $('#btnDemo').innerHTML = '<svg class="ic" viewBox="0 0 24 24" style="fill:currentColor;stroke:none"><path d="M6 4l14 8-14 8z"/></svg> Live Demo';
    return;
  }
  
  // Store a deep copy of the original database if not done yet
  if (!BASE_DATA) BASE_DATA = JSON.parse(JSON.stringify(MACHINE_DATA));
  
  $('#btnDemo').innerHTML = '<svg class="ic" viewBox="0 0 24 24" style="fill:currentColor;stroke:none"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg> Stop Demo';
  simTick = 0;
  A.length = 0; // Clear all alerts

  // Reset PU-2101B to Normal state (baseline)
  let p = MACHINE_DATA.m_pu;
  p.stat = 'Normal'; p.cls = 'good'; p.dotCls = 'green';
  p.statusMsg = 'NORMAL — Operating within safe parameters.';
  p.params[0].v = '4.2'; p.params[0].bad = false;
  p.params[1].v = '78'; p.params[1].bad = false;
  p.trend1 = [4.1, 4.2, 4.0, 4.2, 4.1, 4.2, 4.2];
  p.trend2 = [77, 78, 77, 78, 78, 78, 78];

  // Reset HE-3301 to Normal state (baseline)
  let h = MACHINE_DATA.m_he;
  h.stat = 'Normal'; h.cls = 'good'; h.dotCls = 'green';
  h.statusMsg = 'NORMAL — Heater efficiency is optimal.';
  h.params[0].v = '88'; h.params[0].bad = false;
  h.trend1 = [88, 88, 87, 88, 88, 88, 88];

  alerts();
  renderOverview();
  updateNavStatus();
  const c = document.querySelector('.nav button.on')?.dataset.k;
  if (c && c.startsWith('m_')) renderMachine(c);

  simTimer = setInterval(() => {
    simTick++;
    // Add noise based on BASE_DATA so it doesn't drift away from the database
    MACHINES.forEach(([k]) => {
      const d = MACHINE_DATA[k];
      const base = BASE_DATA[k];
      
      d.params.forEach((param, i) => {
        let baseVal = parseFloat(base.params[i].v);
        
        // Special override for PU-2101B and HE-3301 during the start of demo (before escalation)
        if (k === 'm_pu' && i === 0 && simTick < 6) baseVal = 4.2;
        if (k === 'm_pu' && i === 1 && simTick < 6) baseVal = 78;
        if (k === 'm_he' && i === 0) baseVal = 88; // Keep HE normal for now
        
        if (!isNaN(baseVal) && !param.l.includes('Hours') && !param.l.includes('RPM')) {
          param.v = (baseVal + (Math.random() - 0.5) * (baseVal * 0.02)).toFixed(param.v.includes('.') ? 1 : 0);
        }
      });
      
      d.trend1.shift(); d.trend1.push(parseFloat(d.params[0].v));
      d.trend2.shift(); d.trend2.push(parseFloat(d.params[1].v));
    });

    // Escalation scenario for PU-2101B (suddenly jumps to the database critical values)
    if (simTick >= 2 && simTick < 6) {
      let pu = MACHINE_DATA.m_pu;
      // Interpolate towards the original database critical values (9.2 and 95)
      let currentVib = parseFloat(pu.params[0].v);
      let currentTemp = parseFloat(pu.params[1].v);
        let currentFlush = parseFloat(pu.params[3].v);
      
      pu.params[0].v = (currentVib + 1.5 + Math.random()*0.2).toFixed(1);
      pu.params[1].v = (currentTemp + 5.0).toFixed(0);
        pu.params[3].v = (currentFlush - 0.2).toFixed(1);
      
      pu.trend1[6] = parseFloat(pu.params[0].v);
      pu.trend2[6] = parseFloat(pu.params[1].v);
      
      if (parseFloat(pu.params[0].v) >= 7.1 && pu.cls !== 'bad') {
        pu.stat = 'Critical'; pu.cls = 'bad'; pu.dotCls = 'red'; pu.params[0].bad = true;
        pu.statusMsg = BASE_DATA.m_pu.statusMsg; // Use exact message from database
        A.push({
          id: 1, c: 'var(--rose)', tag: 'Critical', t: 'Vibration Spike on PU-2101B', m: 'Feed Unit · Just now',
          r: `AI detected sudden vibration spike to ${pu.params[0].v} mm/s, exceeding 7.1 mm/s safe limit.`,
          x: BASE_DATA.m_pu.diagnosis
        });
        toast('CRITICAL ALERT: PU-2101B');
        alerts();
        updateNavStatus(); // Update status dots in sidebar without destroying selection
      }
    } else if (simTick >= 6) {
      // Lock it exactly to the database values
      let pu = MACHINE_DATA.m_pu;
      pu.params[0].v = (9.2 + (Math.random() - 0.5) * 0.2).toFixed(1);
      pu.params[1].v = (95 + (Math.random() - 0.5) * 1).toFixed(0);
      pu.params[3].v = (2.4 + (Math.random() - 0.5) * 0.1).toFixed(1);
      pu.trend1[6] = parseFloat(pu.params[0].v);
      pu.trend2[6] = parseFloat(pu.params[1].v);
      
      if (parseFloat(pu.params[0].v) >= 7.1 && pu.cls !== 'bad') {
        pu.stat = 'Critical'; pu.cls = 'bad'; pu.dotCls = 'red'; pu.params[0].bad = true;
        pu.statusMsg = BASE_DATA.m_pu.statusMsg;
        A.push({
          id: 1, c: 'var(--rose)', tag: 'Critical', t: 'Vibration Spike on PU-2101B', m: 'Feed Unit  Just now',
          r: `AI detected sudden vibration spike to ${pu.params[0].v} mm/s, exceeding 7.1 mm/s safe limit.`,
          x: BASE_DATA.m_pu.diagnosis
        });
        toast('CRITICAL ALERT: PU-2101B');
        alerts();
        updateNavStatus();
      }
    }

    renderOverview();
    const ck = document.querySelector('.nav button.on')?.dataset.k;
    if (ck && ck.startsWith('m_')) renderMachine(ck);
  }, 1500);
};













// ==========================================
// CALIBER 2.0 - REAL DATA INTEGRATION (API)
// ==========================================
const API_URL = "http://127.0.0.1:5000/api";

async function fetchRealData() {
  try {
    const machines = ['PU-2101B','KO-3201','PM-4405B','HE-3301','BL-5702'];
    let totalDT = 0, totalAvail = 0, totalIncidents = 0, loaded = 0;
    
    for(const m of machines) {
      try {
        const res = await fetch(API_URL + "/kpi/" + m);
        if(res.ok) {
          const data = await res.json();
          const kpis = data.kpis;
          totalDT += parseFloat(kpis["Total Downtime (hours)"]?.value || 0);
          totalAvail += parseFloat(kpis["Availability (%)"]?.value || 100);
          totalIncidents += parseInt(kpis["No. of Failures (period)"]?.value || 0);
          loaded++;
        }
      } catch(e) {}
    }
    
    if(loaded > 0) {
      const avgOEE = (totalAvail / loaded).toFixed(1);
      let target = document.getElementById('kpi-summary');
      if(target) {
        target.innerHTML = `<div class="kpi-item"><div class="kpi-label">Avg. Availability (OEE)</div><div class="kpi-val" style="color:var(--green)">${avgOEE}%</div></div><div class="kpi-item"><div class="kpi-label">Total Downtime</div><div class="kpi-val" style="color:var(--amber)">${totalDT.toFixed(1)} <small>hrs</small></div></div><div class="kpi-item"><div class="kpi-label">Total Failures (6 mo)</div><div class="kpi-val" style="color:var(--rose)">${totalIncidents}</div></div><div class="kpi-item"><div class="kpi-label">API Status</div><div class="kpi-val" style="color:var(--green)">Connected</div></div>`;
      }
    }
  } catch(e) {
    console.log("API offline, using static data");
  }
}


setTimeout(fetchRealData, 1000);

