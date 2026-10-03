/* Laras AI Assistant — Powered by Google Gemini API */
const LARAS={name:'Laras',apiKey:localStorage.getItem('laras_gemini_key')||null};
let _av=0;
function larasAvatar(px,id){const ys=[26,46,64,82],cols=['#2575b8','#253f7a','#4dbfd9','#2575b8'],c='lc'+(_av++);
 const g=ys.map((y,i)=>`<g class="w w${i+1}"><path d="M0,${y} q15,-9 30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 V120 H0Z" transform="translate(${-i*14},0)" fill="${cols[i]}" stroke="#fff" stroke-width="2.4"/></g>`).join('');
 return `<svg class="av" ${id?`id="${id}"`:''} width="${px}" height="${px}" viewBox="0 0 100 100" role="img" aria-label="Laras AI"><defs><clipPath id="${c}"><circle cx="50" cy="50" r="48"/></clipPath></defs><g clip-path="url(#${c})"><rect width="100" height="100" fill="#4dbfd9"/>${g}</g></svg>`}

$('#lavw').innerHTML=larasAvatar(48,'lav');$('#favw').innerHTML=larasAvatar(40,'fav');
const SUG=['Full plant status report','Why is PU-2101B critical?','What should I do about HE-3301?','Compare all machines'];
$('#sugg').innerHTML=SUG.map(s=>`<button>${s}</button>`).join('');
$$('#sugg button').forEach(b=>b.onclick=()=>askAI(b.textContent));
const esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function addMsg(who,html,conf){const m=document.createElement('div');m.className='m '+(who=='u'?'u':'a');
 m.innerHTML=(who=='a'?larasAvatar(28):'')+`<div class="b">${who=='u'?esc(html):html}${conf?`<div class="conf"><i></i>${conf}</div>`:''}</div>`;
 $('#msgs').appendChild(m);$('#msgs').scrollTop=1e6;return m}

function openAI(){$('#ai').classList.add('open');$('#fab').classList.add('hide');updCtx();setTimeout(()=>$('#q').focus(),320)}
function closeAI(){$('#ai').classList.remove('open');$('#fab').classList.remove('hide')}
$('#fab').onclick=openAI;$('#aix').onclick=closeAI;

/* ===== GEMINI API ===== */
function buildSystemPrompt(){
  const md=typeof MACHINE_DATA!=='undefined'?MACHINE_DATA:{};
  let ctx='You are Laras AI, a highly knowledgeable AI operations assistant for Chandra Asri petrochemical plant in Cilegon, Indonesia. You are an expert in process engineering, rotating equipment, heat exchangers, knockout drums, blowers, and process pumps.\n\n';
  ctx+='CURRENT PLANT STATUS (LIVE DATA):\n';
  for(const[k,d]of Object.entries(md)){
    ctx+=`\n=== ${d.name} (${d.type}) — Status: ${d.stat} ===\n`;
    d.params.forEach(p=>{ctx+=`  ${p.l}: ${p.v} ${p.u} [Safe limit: ${p.limit}]${p.bad?' ⚠️ ANOMALY':''}\n`});
    ctx+=`  6-hour trend (${d.trend1Label}): ${d.trend1.join(' → ')}\n`;
    ctx+=`  6-hour trend (${d.trend2Label}): ${d.trend2.join(' → ')}\n`;
    ctx+=`  Operational: ${d.ops.map(o=>o.l+': '+o.v).join(', ')}\n`;
  }
  ctx+='\nACTIVE ALERTS:\n';
  if(typeof A!=='undefined')A.forEach(a=>{ctx+=`- [${a.tag}] ${a.t}: ${a.r}\n  Detail: ${a.x}\n`});
  ctx+='\nINSTRUCTIONS:\n- Give thorough, detailed, expert-level answers\n- Use bullet points and structured formatting\n- Include specific numerical values from the sensor data\n- Provide actionable recommendations with priority levels\n- If asked about a machine, include ALL its current parameters\n- Explain the engineering reasoning behind your analysis\n- You can discuss anything, but your domain expertise is petrochemical plant operations\n- Respond in the same language the user writes in\n- When giving long answers, use clear section headers';
  return ctx;
}

let chatHistory=[];
async function callGemini(userMsg){
  const url=`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${LARAS.apiKey}`;
  chatHistory.push({role:'user',parts:[{text:userMsg}]});
  const body={system_instruction:{parts:[{text:buildSystemPrompt()}]},contents:chatHistory.slice(-20),generationConfig:{temperature:0.7,maxOutputTokens:2048,topP:0.9}};
  const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!res.ok){const err=await res.text();throw new Error(`API ${res.status}: ${err}`)}
  const data=await res.json();
  const reply=data.candidates?.[0]?.content?.parts?.[0]?.text||'Sorry, I could not generate a response.';
  chatHistory.push({role:'model',parts:[{text:reply}]});
  return reply;
}

function formatGeminiResponse(text){
  let html=esc(text);
  html=html.replace(/\*\*(.*?)\*\*/g,'<b>$1</b>');
  html=html.replace(/\*(.*?)\*/g,'<i>$1</i>');
  html=html.replace(/^[-•]\s+(.+)$/gm,'<li>$1</li>');
  html=html.replace(/(<li>.*<\/li>)/s,'<ul>$1</ul>');
  html=html.replace(/\n{2,}/g,'<br><br>');
  html=html.replace(/\n/g,'<br>');
  html=html.replace(/<\/ul>\s*<ul>/g,'');
  return html;
}

/* ===== DETAILED DEMO RESPONSES ===== */
function demoAnswer(q){
  const s=q.toLowerCase();
  const MD=typeof MACHINE_DATA!=='undefined'?MACHINE_DATA:{};

  if(/pu.?2101|feed|pump|vibra/i.test(s))
    return{h:`<b>🔴 PU-2101B — Centrifugal Feed Pump</b><br><br><b>Current Status: CRITICAL</b><br>This pump is experiencing a dangerous vibration anomaly that requires immediate intervention.<br><br><b>📊 Current Sensor Readings:</b><ul><li><b>Overall Vibration: 9.2 mm/s</b> — <span style="color:var(--rose)">⚠️ 30% above the 7.1 mm/s safe threshold (TRIP at 11.22 mm/s)</span></li><li>Bearing Temperature: 95°C (limit: &lt; 110°C) — elevated, correlating with vibration</li><li>Discharge Pressure: 9.54 barg (normal range: 8–12 barg)</li><li>Seal Flush Flow: 2.8 L/min (normal range: 2.5–4.0 L/min)</li><li>Motor Current: 128A (limit: &lt; 150A) — stable, ruling out process blockage</li><li>Suction Pressure: 3.2 barg | Differential: 6.34 barg</li></ul><b>📈 Trend Analysis (6 Hours):</b><br>Vibration: 3.8 → 4.1 → 4.3 → 5.2 → 6.8 → 8.1 → <b>9.2 mm/s</b><br>The exponential acceleration started ~3 hours ago, suggesting progressive mechanical failure.<br><br><b>🔍 Root Cause Analysis:</b><ul><li><b>Primary (78% confidence):</b> Inner race bearing defect — 1x and 2x harmonic spikes</li><li><b>Secondary (15%):</b> Impeller erosion/imbalance from abrasive particles</li><li><b>Tertiary (7%):</b> Coupling misalignment from thermal growth</li></ul><b>📊 AI Feature Contributions:</b><ul><li>Vibration Increase: 62%</li><li>Bearing Temp Rise: 21%</li><li>Seal Flush Drop: 9%</li><li>Motor Current: 5%</li></ul><b>📁 Historical Match:</b> PU-2101A (2024-03-11) — same pattern, tripped at 11.22 mm/s, inner race confirmed.<br><br><b>⚡ Recommended Actions:</b><ol><li><b>IMMEDIATE:</b> Reduce feed rate to 10 T/H to lower mechanical stress</li><li><b>Within 1 hour:</b> Take portable vibration spectrum to confirm defect frequency</li><li><b>Within 4 hours:</b> Prepare standby pump PU-2101A for switchover</li><li><b>Within 8 hours:</b> Shut down for bearing replacement (est. 6–8 hours downtime)</li></ol><b>Spare Parts:</b> SKF 6316 bearings available in warehouse (qty: 4)<br><b>Running Hours:</b> 8,420 hrs | Last PM: 2026-08-15 | Manufacturer: Sulzer AG`,c:'High confidence · 8 sensor parameters analyzed'};

  if(/he.?3301|heater|efficien|fouling/i.test(s))
    return{h:`<b>🟡 HE-3301 — Fired Process Heater</b><br><br><b>Current Status: WARNING</b><br>Thermal efficiency is in steady decline, indicating tube fouling that will worsen without intervention.<br><br><b>📊 Current Sensor Readings:</b><ul><li><b>Thermal Efficiency: 82%</b> — <span style="color:var(--amber)">⚠️ Below 85% minimum target</span></li><li>Outlet Temperature: 410°C (target: 400–420°C) — maintained by burning more fuel</li><li>Fuel Flow: 3.2 T/H (increased from baseline 2.8 T/H — up 14%)</li><li>Stack Temperature: 285°C (alarm at 320°C) — rising due to wasted heat</li><li>O₂ in Flue Gas: 3.1% | Draft: -12 mmWC | Radiant Flux: 42.5 kW/m²</li><li>Tube Skin Temp: 520°C (limit: &lt; 560°C) — trending upward</li></ul><b>📈 Trend Analysis:</b><br>Efficiency: 88% → 87% → 85% → 84% → 83% → 82% → 82%<br>Stack Temp: 265°C → 270°C → 272°C → 275°C → 280°C → 283°C → 285°C<br>Linear decline at ~1%/hour confirms progressive fouling.<br><br><b>🔍 Root Cause:</b><ul><li><b>Primary (85%):</b> Tube-side coking/fouling reducing heat transfer coefficient</li><li><b>Secondary (12%):</b> Burner tip degradation causing uneven flame</li><li><b>Tertiary (3%):</b> Air register misadjustment</li></ul><b>⚡ Actions:</b><ol><li><b>NOW:</b> Monitor tube skin temp — reduce throughput if it exceeds 540°C</li><li><b>Within 24 hrs:</b> Plan online spalling to remove soft deposits</li><li><b>Next shutdown:</b> Full hydroblast cleaning</li><li><b>Long-term:</b> Review anti-fouling chemical injection program</li></ol><b>Financial Impact:</b> If unaddressed, ~$12,000/day in excess fuel costs<br><b>Running Hours:</b> 12,050 hrs | Last Decoking: 2026-06-20 | Duty: 28 MW`,c:'Medium confidence · trend analysis'};

  if(/ko.?3201|knockout|drum/i.test(s))
    return{h:`<b>🟢 KO-3201 — Knockout Drum</b><br><br><b>Current Status: NORMAL — All parameters within operating envelope</b><br><br><b>📊 All Parameters:</b><ul><li>Liquid Level: <b>42%</b> (range: 20–60%) — stable</li><li>Operating Pressure: 2.1 barg (range: 1.5–3.0 barg)</li><li>Inlet Temp: 65°C (range: 50–85°C)</li><li>Outlet Gas Flow: 18.4 T/H | Liquid Drain: 0.8 T/H</li><li>ΔP Mist Eliminator: 0.12 bar (limit: &lt; 0.5 bar) — no plugging</li><li>Boot Level: 8% | Running Hours: 6,340 hrs</li></ul><b>Equipment Info:</b> Frames Group, 45 m³ volume, wire mesh pad mist eliminator<br><br><b>✅ No action required.</b> Next inspection 2027-05-10.`,c:'High confidence · sensor data'};

  if(/pm.?4405|process pump/i.test(s))
    return{h:`<b>🟢 PM-4405B — Process Pump</b><br><br><b>Current Status: NORMAL</b><br><br><b>📊 All Parameters:</b><ul><li>Overall Vibration: <b>3.1 mm/s</b> (limit: &lt; 7.1 mm/s) — well within limits</li><li>Bearing Temp: 52°C (limit: &lt; 110°C)</li><li>Discharge Pressure: 12.8 barg (range: 10–16 barg)</li><li>Seal Flush Flow: 3.2 L/min (range: 2.5–4.0 L/min)</li><li>Motor Current: 88A (limit: &lt; 120A)</li><li>Differential Pressure: 10.7 barg</li></ul><b>Equipment Info:</b> Flowserve DVSH 150-400, 110 kW, Mechanical Dual Seal<br>Running Hours: 4,210 hrs | Next PM: 2027-01-20<br><br><b>✅ No action required.</b>`,c:'High confidence · sensor data'};

  if(/bl.?5702|blower|fan/i.test(s))
    return{h:`<b>🟢 BL-5702 — Blower / Fan Unit</b><br><br><b>Current Status: NORMAL</b><br><br><b>📊 All Parameters:</b><ul><li>Overall Vibration: <b>2.4 mm/s</b> (limit: &lt; 7.1 mm/s)</li><li>Bearing Temp: 48°C (limit: &lt; 100°C)</li><li>Discharge Pressure: 1.8 barg (range: 1.2–2.5 barg)</li><li>Motor Current: 72A (limit: &lt; 95A)</li><li>Air/Gas Flow: 14,200 Nm³/hr (range: 10k–18k)</li><li>Shaft Speed: 1,480 RPM (range: 1,440–1,500)</li></ul><b>Equipment Info:</b> Howden HF 800, 55 kW, Backward Curved Impeller<br>Running Hours: 3,850 hrs | Next PM: 2027-03-01<br><br><b>✅ No action required.</b>`,c:'High confidence · sensor data'};

  if(/summar|full|all|overview|report|status|compare/i.test(s))
    return{h:`<b>📋 Full Plant Status Report — ${new Date().toLocaleString('en-US',{dateStyle:'medium',timeStyle:'short'})}</b><br><br><b>CRITICAL ISSUES (1):</b><br>🔴 <b>PU-2101B (Feed Pump)</b> — Overall Vibration at 9.2 mm/s (limit: 7.1, TRIP: 11.22). Bearing degradation suspected. Bearing temp rising to 95°C. Risk of pump trip within 2–4 hours if unaddressed. <i>Action: Reduce load, prepare standby pump, plan emergency bearing replacement.</i><br><br><b>WARNINGS (1):</b><br>🟡 <b>HE-3301 (Heater)</b> — Efficiency at 82% (target: &gt;85%). Fuel consumption up 14%. Stack temp rising (285°C). Tube fouling confirmed by trend analysis. <i>Action: Plan online spalling within 24 hrs, schedule hydroblast at next shutdown.</i><br><br><b>NORMAL OPERATIONS (3):</b><br>🟢 <b>KO-3201 (Knockout Drum)</b> — Liquid Level 42%, pressure stable, no carry-over detected<br>🟢 <b>PM-4405B (Process Pump)</b> — Vibration 3.1 mm/s, bearing temp 52°C, seal system healthy<br>🟢 <b>BL-5702 (Blower)</b> — Vibration 2.4 mm/s, motor current 72A, all parameters nominal<br><br><b>OVERALL ASSESSMENT:</b><br>Plant is at <b>60% health</b> due to 1 critical + 1 warning condition. Immediate priority is PU-2101B to prevent unplanned shutdown. HE-3301 can be managed with planned maintenance but should not be delayed beyond 48 hours.<br><br><b>ESTIMATED FINANCIAL IMPACT:</b><ul><li>PU-2101B trip: ~$180,000/day in lost production</li><li>HE-3301 inefficiency: ~$12,000/day in excess fuel</li></ul>`,c:'High confidence · full plant analysis'};

  if(/anomal|alert|warning|critical|issue/i.test(s))
    return{h:`<b>Active Anomalies Report</b><br><br><b>🔴 CRITICAL — PU-2101B Vibration</b><br>Overall vibration spiked to 9.2 mm/s (safe limit: 7.1, TRIP: 11.22). 6-hour trend: 3.8 → 4.1 → 4.3 → 5.2 → 6.8 → 8.1 → 9.2. Bearing temp correlated at 95°C. Suspected bearing inner race defect. Estimated time to trip: 2–4 hours.<br><br><b>🟡 WARNING — HE-3301 Efficiency</b><br>Thermal efficiency declined from 88% to 82% over 6 hours (linear rate: ~1%/hour). Stack temp rising from 265°C to 285°C. Fuel consumption increased 14% to compensate. Tube fouling is the most likely cause.<br><br><b>Priority Order:</b> PU-2101B first (safety-critical), then HE-3301 (economic impact).`,c:'High confidence · alert system'};

  return{h:`I'm in <b>demo mode</b> with pre-set responses for machine-specific queries. To unlock full conversational AI (like chatting with Gemini), connect your API key using the 🔑 button below.<br><br><b>Try these questions:</b><ul><li>"Full plant status report"</li><li>"Why is PU-2101B critical?"</li><li>"What should I do about HE-3301?"</li><li>"Compare all machines"</li><li>"Status of KO-3201 knockout drum"</li><li>"How is PM-4405B?"</li><li>"BL-5702 blower status"</li></ul>`};
}

/* ===== MAIN ASK ===== */
let busy=false;
async function askAI(q,ctx){
  q=(q||'').trim();if(!q||busy)return;busy=true;openAI();addMsg('u',q);
  const t=addMsg('a','<div class="dots"><i></i><i></i><i></i></div>');
  ['lav','fav'].forEach(i=>$('#'+i).classList.add('busy'));
  let r;
  try{
    if(LARAS.apiKey){
      try{
        const reply=await callGemini(q);
        r={h:formatGeminiResponse(reply),c:'Gemini AI · real-time plant context'};
      }catch(e){
        console.error(e);
        let msg='Could not connect to Gemini AI.';
        if(e.message.includes('API_KEY_INVALID')||e.message.includes('not valid')){
          msg='Your API key is invalid. Please enter a valid Gemini API key.';
          LARAS.apiKey=null;localStorage.removeItem('laras_gemini_key');
        }else if(e.message.includes('QUOTA')){
          msg='API quota exceeded. Please wait a moment and try again.';
        }else if(e.message.includes('403')){
          msg='Access denied. Make sure your API key has the Gemini API enabled.';
        }
        r={h:`<b style="color:var(--rose)">⚠️ ${msg}</b><br><br>Switching to demo mode. You can reconnect anytime using the 🔑 button below.<br><br><button onclick="document.getElementById('apiModal').classList.add('show')" style="padding:8px 16px;border-radius:10px;background:var(--navy);color:#fff;border:none;cursor:pointer;font-size:13px;">🔑 Re-enter API Key</button>`};
        await sleep(300);
        const demo=demoAnswer(q);
        r.h+=`<br><br><div style="border-top:1px solid var(--line);margin-top:12px;padding-top:12px;"><b>Demo Response:</b><br>${demo.h}</div>`;
      }
    }else{
      await sleep(800+Math.random()*400);r=demoAnswer(q);
    }
  }catch(e){console.error(e);r={h:'<b style="color:var(--rose)">Something went wrong.</b> Please try again.'}}
  t.remove();['lav','fav'].forEach(i=>$('#'+i).classList.remove('busy'));addMsg('a',r.h,r.c);busy=false}

$('#send').onclick=()=>{const v=$('#q').value;$('#q').value='';askAI(v)};
$('#q').onkeydown=e=>{if(e.key=='Enter')$('#send').click()};

/* ===== API KEY MODAL ===== */
$('#apiSave').onclick=()=>{
  const key=$('#apiKeyInput').value.trim();
  if(key){LARAS.apiKey=key;localStorage.setItem('laras_gemini_key',key);chatHistory=[];$('#apiModal').classList.remove('show');
  toast('✅ Gemini AI connected!');addMsg('a','🚀 <b>Gemini AI is now connected!</b> I have full access to all 5 machine sensor readings, trends, and operational data. I can now answer any question in depth — try asking me for a detailed analysis or root cause investigation.','Gemini AI · connected')}};
$('#apiSkip').onclick=()=>{$('#apiModal').classList.remove('show');toast('Using demo mode.')};

function initLaras(){
  const greeting=LARAS.apiKey
    ?'Hello! I\'m <b>Laras AI</b>, your plant operations assistant powered by <b>Gemini</b>. I\'m monitoring all 5 machine units with 40+ sensor parameters in real-time.<br><br><b>⚠️ Immediate attention needed:</b><ul><li>🔴 <b>PU-2101B:</b> Critical vibration anomaly (9.2 mm/s)</li><li>🟡 <b>HE-3301:</b> Efficiency declining (82%)</li></ul>What would you like to investigate first?'
    :'Hello! I\'m <b>Laras AI</b>, your plant operations assistant. I\'m currently in <b>demo mode</b> — I can answer questions about specific machines with detailed pre-set responses.<br><br><b>⚠️ Current plant issues:</b><ul><li>🔴 PU-2101B: Critical vibration (9.2 mm/s)</li><li>🟡 HE-3301: Efficiency drop (82%)</li></ul>To unlock <b>full conversational AI</b> (like Gemini), click the button below.';
  addMsg('a',greeting,LARAS.apiKey?'Gemini AI · connected':'Demo mode');
  if(!LARAS.apiKey){const btn=document.createElement('div');btn.style.cssText='padding:8px 16px;';
    btn.innerHTML='<button onclick="document.getElementById(\'apiModal\').classList.add(\'show\')" style="width:100%;padding:12px;border-radius:12px;background:linear-gradient(135deg,#253f7a,#2575b8);color:#fff;font-size:14px;font-weight:600;cursor:pointer;border:none;">🔑 Connect Gemini AI for Full Conversations</button>';
    $('#msgs').appendChild(btn)}
  updCtx();
}
initLaras();

