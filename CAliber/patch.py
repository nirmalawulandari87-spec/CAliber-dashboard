import os

app_js_path = 'C:/CAliber/frontend/extracted/chandra-asri-dashboard/js/app.js'
with open(app_js_path, 'r', encoding='utf-8') as f:
    content = f.read()

patch = r"""

// ==========================================
// CALIBER 2.0 - REAL DATA INTEGRATION (API)
// ==========================================
const API_URL = "http://127.0.0.1:5000/api";

async function fetchRealData() {
  try {
    const puKpiRes = await fetch(API_URL + "/kpi/PU-2101B");
    if(puKpiRes.ok) {
        const puKpi = await puKpiRes.json();
        const oee = puKpi.kpis["Availability (%)"]?.value || 99.5;
        const mtbf = puKpi.kpis["MTBF (hours)"]?.value || 4368;
        const dt = puKpi.kpis["Total Downtime (hours)"]?.value || 18.5;
        
        let kpiHtml = `<div class="kpi-item"><div class="kpi-label">Plant Availability (OEE)</div><div class="kpi-val">${parseFloat(oee).toFixed(1)}%</div></div>`;
        kpiHtml += `<div class="kpi-item"><div class="kpi-label">Mean Time Between Failure</div><div class="kpi-val">${mtbf} <small>hrs</small></div></div>`;
        kpiHtml += `<div class="kpi-item"><div class="kpi-label">Total Downtime</div><div class="kpi-val" style="color:var(--amber)">${dt} <small>hrs</small></div></div>`;
        kpiHtml += `<div class="kpi-item"><div class="kpi-label">API Status</div><div class="kpi-val" style="color:var(--green)">Connected</div></div>`;
        
        let target = document.getElementById('kpi-summary');
        if(target) target.innerHTML = kpiHtml;
    }
  } catch(e) {
    console.error("API Error", e);
  }
}

const _origRenderMachine = renderMachine;
renderMachine = async function(k) {
  _origRenderMachine(k);
  
  const d = MACHINE_DATA[k];
  const mName = d.name;
  
  try {
    const prodRes = await fetch(API_URL + "/production/" + mName);
    if (!prodRes.ok) return;
    const prodData = await prodRes.json();
    
    const equipRes = await fetch(API_URL + "/equipment/" + mName);
    const equipData = await equipRes.json();
    
    const latest = prodData.sensor_data[prodData.sensor_data.length - 1];
    
    let payload = {...latest};
    delete payload["Timestamp"];
    delete payload["RUN_STATUS"];
    delete payload["PLANT_RATE"];
    
    const predRes = await fetch(API_URL + "/predict", {
      method: "POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({machine: mName, sensor_data: payload})
    });
    const predData = await predRes.json();
    
    // UPDATE KPI Grid
    let kpiHtml = "";
    Object.keys(payload).forEach(key => {
        let val = payload[key];
        let isBad = false;
        let limitText = "";
        let u = "";
        equipData.alarm_trip_limits?.forEach(lim => {
            if(lim.parameter.toLowerCase().includes(key.toLowerCase().split("_")[1] || key)) {
                limitText = lim.alarm_trip;
                if(key.includes("VIB")) u = "mm/s";
                if(key.includes("TEMP")) u = "°C";
                if(key.includes("AMP")) u = "A";
                if(key.includes("FLOW")) u = "L/min";
            }
        });
        
        predData.violations?.forEach(v => {
            if(key.toLowerCase().includes(v.sensor.toLowerCase().split(" ")[0])) isBad = true;
        });
        
        let displayVal = typeof val === 'number' ? val.toFixed(2) : val;
        kpiHtml += `<div class="kpi"><span>${key}</span><strong style="${isBad?'color:var(--rose)':''}">${displayVal}</strong><em class="${isBad?'dn':''}">${u} ${limitText?'(Lim: '+limitText+')':''}</em></div>`;
    });
    document.getElementById('m-specs').innerHTML = kpiHtml;
    
    // AI Diagnosis Panel
    if(predData.status === "NORMAL" && !predData.limit_flag) {
       document.getElementById('m-ai-diagnosis').innerHTML = '<div class="ai-diagnosis-card" style="border-left-color:var(--green);"><b>Status: Normal</b><br><br>No anomaly detected by AI or Engineering Limits.</div>';
    } else {
       let dHtml = `<div class="ai-diagnosis-card"><b>Detected by: ${predData.detection_method}</b><br><br>`;
       if (predData.recommendation && predData.recommendation.action) {
           dHtml += `<b>Recommended Action:</b> ${predData.recommendation.action}<br><br>`;
           
           document.getElementById('m-ai-corr').innerHTML = predData.recommendation.capa.replace(/\n/g, '<br>') || "N/A";
           document.getElementById('m-ai-historical').innerHTML = `Matched RCA: ${predData.recommendation.source_rca} (Confidence: ${(predData.recommendation.match_confidence*100).toFixed(1)}%)`;
           document.getElementById('m-ai-prev').innerHTML = predData.recommendation.root_cause.replace(/\n/g, '<br>') || "N/A";
       }
       if(predData.violations && predData.violations.length > 0) {
           dHtml += "<b>Engineering Limit Violations:</b><ul>";
           predData.violations.forEach(v => {
               dHtml += `<li>${v.sensor} is ${v.value} (${v.severity} limit is ${v.severity==='TRIP'?v.trip:v.alarm})</li>`;
           });
           dHtml += "</ul>";
       }
       dHtml += `</div>`;
       document.getElementById('m-ai-diagnosis').innerHTML = dHtml;
       
       if(predData.explanation && predData.explanation.length > 0) {
           let sHtml = "";
           let total = predData.explanation.reduce((acc, curr) => acc + Math.abs(curr.contribution), 0);
           predData.explanation.forEach(s => {
               let pct = (Math.abs(s.contribution) / total) * 100;
               sHtml += `<div class="shap-bar"><div class="shap-lbl">${s.sensor}</div><div class="shap-track"><div class="shap-fill" style="width:${pct}%"></div></div><div class="shap-val">${pct.toFixed(0)}%</div></div>`;
           });
           document.getElementById('m-ai-shap').innerHTML = sHtml;
       }
    }
    
    // Operational Info
    if(equipData.info) {
        let opHtml = "";
        Object.keys(equipData.info).forEach(k => {
           opHtml += `<div class="op-info-item"><div class="op-label">${k}</div><div class="op-value">${equipData.info[k]}</div></div>`;
        });
        document.getElementById('m-opinfo').innerHTML = opHtml;
    }
    
    // Charts
    let histKeys = Object.keys(payload);
    if(histKeys.length >= 2) {
        let k1 = histKeys[0]; let k2 = histKeys[1];
        let d1 = [], d2 = [], labels = [];
        let slice = prodData.sensor_data.slice(-24);
        slice.forEach(r => {
            d1.push(r[k1]); d2.push(r[k2]); 
            let ts = new Date(r["Timestamp"]);
            labels.push(ts.getHours() + ":" + (ts.getMinutes()<10?'0':'') + ts.getMinutes());
        });
        
        mChart1.data.labels = labels;
        mChart1.data.datasets[0].data = d1;
        mChart1.data.datasets[0].label = k1;
        mChart1.update();
        
        mChart2.data.labels = labels;
        mChart2.data.datasets[0].data = d2;
        mChart2.data.datasets[0].label = k2;
        mChart2.update();
    }
    
  } catch (e) {
    console.log("Using static data fallback for", mName, e);
  }
}
setTimeout(fetchRealData, 1000);
"""

if "// ==========================================" not in content:
    with open(app_js_path, 'a', encoding='utf-8') as f:
        f.write(patch)
    print("Frontend patched.")
else:
    print("Already patched.")
