import os

app_js_path = 'C:/CAliber/frontend/extracted/chandra-asri-dashboard/js/app.js'
with open(app_js_path, 'r', encoding='utf-8') as f:
    content = f.read()

old = "if($('#kpi-summary')) {\n    $('#kpi-summary').innerHTML=`<div class=\"kpi-item\"><div class=\"kpi-label\">Production Output</div><div class=\"kpi-val\">2,140 / 2,200 <small>T</small></div></div><div class=\"kpi-item\"><div class=\"kpi-label\">Equipment Health (OEE)</div><div class=\"kpi-val\" style=\"color:var(--amber)\">88.4%</div></div><div class=\"kpi-item\"><div class=\"kpi-label\">Incidents (Live)</div><div class=\"kpi-val\" style=\"color:var(--rose)\">${c} Critical</div></div><div class=\"kpi-item\"><div class=\"kpi-label\">Maint. Overtime</div><div class=\"kpi-val\">12 <small>hrs</small></div></div>`;\n  }"

new = """if($('#kpi-summary') && !document.getElementById('kpi-summary').innerHTML.includes('API Status')) {
    $('#kpi-summary').innerHTML=`<div class="kpi-item"><div class="kpi-label">Production Output</div><div class="kpi-val">2,140 / 2,200 <small>T</small></div></div><div class="kpi-item"><div class="kpi-label">Equipment Health (OEE)</div><div class="kpi-val" style="color:var(--amber)">88.4%</div></div><div class="kpi-item"><div class="kpi-label">Incidents (Live)</div><div class="kpi-val" style="color:var(--rose)">${c} Critical</div></div><div class="kpi-item"><div class="kpi-label">Maint. Overtime</div><div class="kpi-val">12 <small>hrs</small></div></div>`;
  }
  if(typeof fetchRealData === 'function') fetchRealData();"""

if old in content:
    content = content.replace(old, new)
    with open(app_js_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed renderOverview")
else:
    print("Could not find old string block!")
