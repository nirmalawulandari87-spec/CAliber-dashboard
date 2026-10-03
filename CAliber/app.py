from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import numpy as np
import pickle
import glob
import os
import shap
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pptx import Presentation

app = Flask(__name__)
CORS(app)

# ============================================================
# CONFIGURATION
# ============================================================
MODEL_DIR = "models"
PROD_DIR = "data_production"
EQUIP_DIR = "data_equipment"
INCIDENT_FILE = "data_incident/Incident Database.xlsx"
RCA_DIR = "data_rca"

MACHINE_MAP = {
    "PU-2101B": {"prod": "Production Data - RCA1 PU-2101B.xlsx", "equip": "Equipment Performance - RCA1 PU-2101B (1).xlsx"},
    "KO-3201":  {"prod": "Production Data - RCA2 KO-3201.xlsx",  "equip": "Equipment Performance - RCA2 KO-3201.xlsx"},
    "PM-4405B": {"prod": "Production Data - RCA3 PM-4405B.xlsx", "equip": "Equipment Performance - RCA3 PM-4405B.xlsx"},
    "HE-3301":  {"prod": "Production Data - RCA4 HE-3301.xlsx",  "equip": "Equipment Performance - RCA4 HE-3301.xlsx"},
    "BL-5702":  {"prod": "Production Data - RCA5 BL-5702.xlsx",  "equip": "Equipment Performance - RCA5 BL-5702.xlsx"},
}

# ============================================================
# 1. LOAD AI 1 (ISOLATION FOREST MODELS)
# ============================================================
models = {}
cols = {}
for file in glob.glob(f"{MODEL_DIR}/ai1_model_*.pkl"):
    machine = os.path.basename(file).replace("ai1_model_", "").replace(".pkl", "")
    with open(file, 'rb') as f:
        models[machine] = pickle.load(f)
    with open(f"{MODEL_DIR}/cols_{machine}.pkl", 'rb') as f:
        cols[machine] = pickle.load(f)

# ============================================================
# 2. LOAD ENGINEERING ALARM/TRIP LIMITS FROM EQUIPMENT DATA
# ============================================================
alarm_trip_limits = {}
print("Loading Alarm/Trip limits from Equipment Info sheets...")
for machine, files in MACHINE_MAP.items():
    try:
        df = pd.read_excel(os.path.join(EQUIP_DIR, files["equip"]), sheet_name="Equipment Info")
        limits = {}
        for i in range(3, 10):
            param = df.iloc[i, 2] if pd.notna(df.iloc[i, 2]) else None
            limit_str = df.iloc[i, 3] if pd.notna(df.iloc[i, 3]) else None
            if param and limit_str:
                parts = str(limit_str).split("/")
                alarm_val = float(parts[0].strip()) if len(parts) >= 1 else None
                trip_val = float(parts[1].strip()) if len(parts) >= 2 else None
                limits[param.strip()] = {"alarm": alarm_val, "trip": trip_val}
        alarm_trip_limits[machine] = limits
        print(f"  {machine}: {len(limits)} parameters loaded")
    except Exception as e:
        print(f"  {machine}: Failed - {e}")

# ============================================================
# 3. BUILD AI 3 KNOWLEDGE BASE FROM RCA PPT (ENHANCED)
# ============================================================
knowledge_base = []
print("Building AI 3 Knowledge Base from RCA files...")
for file in glob.glob(f"{RCA_DIR}/*.pptx"):
    machine_name = "UNKNOWN"
    if "PU-2101B" in file: machine_name = "PU-2101B"
    elif "KO-3201" in file: machine_name = "KO-3201"
    elif "PM-4405B" in file: machine_name = "PM-4405B"
    elif "HE-3301" in file: machine_name = "HE-3301"
    elif "BL-5702" in file: machine_name = "BL-5702"

    text_content = ""
    slide_texts = []
    try:
        prs = Presentation(file)
        for slide in prs.slides:
            slide_text = ""
            for shape in slide.shapes:
                if hasattr(shape, "text"):
                    slide_text += shape.text + " "
            slide_texts.append(slide_text.strip())
            text_content += slide_text
    except Exception as e:
        print(f"  Failed to read {file}: {e}")

    if text_content:
        # Extract CAPA / corrective actions from slide text
        capa_text = ""
        root_cause_text = ""
        for st in slide_texts:
            st_lower = st.lower()
            if any(kw in st_lower for kw in ["capa", "corrective", "preventive", "action plan", "recommendation"]):
                capa_text += st + "\n"
            if any(kw in st_lower for kw in ["root cause", "cause analysis", "finding", "failure mode"]):
                root_cause_text += st + "\n"

        knowledge_base.append({
            "machine": machine_name,
            "text": text_content,
            "file": os.path.basename(file),
            "capa": capa_text.strip() if capa_text else "No specific CAPA extracted.",
            "root_cause": root_cause_text.strip() if root_cause_text else "See full RCA document."
        })
        print(f"  {machine_name}: loaded ({len(text_content)} chars, CAPA: {len(capa_text)} chars)")

tfidf_vectorizer = TfidfVectorizer(stop_words='english')
if knowledge_base:
    tfidf_matrix = tfidf_vectorizer.fit_transform([kb['text'] for kb in knowledge_base])

# ============================================================
# 4. LOAD INCIDENT DATABASE
# ============================================================
incidents_df = None
try:
    incidents_df = pd.read_excel(INCIDENT_FILE, sheet_name='Incident Database', header=None, skiprows=2)
    incidents_df.columns = ['Serial','MTO_No','AR_No','Plant','Tag','Eq_Class','Date',
                            'Title','Impact','PreRisk','RiskScore','PIC','Status',
                            'Discipline','EqType','Component','Mechanism','Downtime',
                            'ActLoss','PotLoss','TotalLoss','DueDate','MonthYear']
    incidents_df = incidents_df[incidents_df['Serial'] != 'Serial No']
    incidents_df['Date'] = pd.to_datetime(incidents_df['Date'], errors='coerce')
    print(f"Incident Database: {len(incidents_df)} records loaded")
except Exception as e:
    print(f"Incident Database: Failed - {e}")


# ============================================================
# HELPER: CHECK ENGINEERING LIMITS
# ============================================================
def check_engineering_limits(machine, sensor_data, feature_names):
    """Check sensor values against alarm/trip limits from Equipment Info."""
    violations = []
    limit_flag = False

    if machine not in alarm_trip_limits:
        return limit_flag, violations

    limits = alarm_trip_limits[machine]

    # Map sensor column names to parameter names
    param_mapping = {}
    for col_name in feature_names:
        col_lower = col_name.lower()
        for param_name, lim in limits.items():
            param_lower = param_name.lower()
            # Match by keyword overlap
            if any(kw in col_lower for kw in param_lower.split()):
                param_mapping[col_name] = (param_name, lim)
                break

    for col_name, (param_name, lim) in param_mapping.items():
        if col_name in sensor_data:
            value = float(sensor_data[col_name])
            alarm = lim["alarm"]
            trip = lim["trip"]

            # Determine direction (some params alarm HIGH, some alarm LOW)
            if alarm is not None and trip is not None:
                if alarm < trip:
                    # Normal: value should be BELOW alarm (e.g., Vibration: alarm=7, trip=11)
                    if value >= trip:
                        violations.append({"sensor": param_name, "value": value, "alarm": alarm, "trip": trip, "severity": "TRIP", "direction": "HIGH"})
                        limit_flag = True
                    elif value >= alarm:
                        violations.append({"sensor": param_name, "value": value, "alarm": alarm, "trip": trip, "severity": "ALARM", "direction": "HIGH"})
                        limit_flag = True
                else:
                    # Inverted: value should be ABOVE alarm (e.g., Seal Flush: alarm=5, trip=4)
                    if value <= trip:
                        violations.append({"sensor": param_name, "value": value, "alarm": alarm, "trip": trip, "severity": "TRIP", "direction": "LOW"})
                        limit_flag = True
                    elif value <= alarm:
                        violations.append({"sensor": param_name, "value": value, "alarm": alarm, "trip": trip, "severity": "ALARM", "direction": "LOW"})
                        limit_flag = True

    return limit_flag, violations


# ============================================================
# API ENDPOINTS
# ============================================================

# --- POIN 1: Enhanced Predict with Engineering Limits ---
@app.route('/api/predict', methods=['POST'])
def predict_anomaly():
    data = request.json
    machine = data.get('machine')
    sensor_data = data.get('sensor_data')

    if machine not in models:
        return jsonify({"error": f"Model untuk {machine} belum tersedia"}), 400

    model = models[machine]
    features = cols[machine]

    df_input = pd.DataFrame([sensor_data], columns=features)

    # AI 1: Isolation Forest
    prediction = model.predict(df_input)[0]
    anomaly_score = model.decision_function(df_input)[0]
    model_flag = bool(prediction == -1)

    # Engineering Limit Check
    limit_flag, violations = check_engineering_limits(machine, sensor_data, features)

    # FINAL DECISION: AI OR Engineering Limit
    final_anomaly = model_flag or limit_flag

    if model_flag and limit_flag:
        detection_method = "AI Model + Engineering Limit"
    elif model_flag:
        detection_method = "AI Model"
    elif limit_flag:
        detection_method = "Engineering Limit"
    else:
        detection_method = "None"

    status = "CRITICAL (ANOMALY)" if final_anomaly else "NORMAL"

    response = {
        "machine": machine,
        "status": status,
        "anomaly_score": round(float(anomaly_score), 4),
        "model_flag": model_flag,
        "limit_flag": limit_flag,
        "detection_method": detection_method,
        "violations": violations,
        "explanation": [],
        "recommendation": {}
    }

    if final_anomaly:
        # AI 2: SHAP Explainer (only if model detected anomaly)
        if model_flag:
            try:
                explainer = shap.TreeExplainer(model)
                shap_values = explainer.shap_values(df_input)
                feature_contributions = []
                for i, col in enumerate(features):
                    feature_contributions.append({
                        "sensor": col,
                        "value": float(df_input[col].iloc[0]),
                        "contribution": float(shap_values[0][i])
                    })
                feature_contributions.sort(key=lambda x: abs(x['contribution']), reverse=True)
                response["explanation"] = feature_contributions
            except Exception:
                pass

        # AI 3: Enhanced TF-IDF Recommender (machine-filtered first)
        top_sensor = violations[0]["sensor"] if violations else (
            response["explanation"][0]["sensor"] if response["explanation"] else machine
        )
        query = f"{machine} anomaly {top_sensor} failure leak trip vibration temperature"

        if knowledge_base:
            # POIN 5: Filter by machine first
            machine_kb = [kb for kb in knowledge_base if kb["machine"] == machine]
            if machine_kb:
                machine_tfidf = tfidf_vectorizer.transform([kb['text'] for kb in machine_kb])
                query_vec = tfidf_vectorizer.transform([query])
                sim_scores = cosine_similarity(query_vec, machine_tfidf).flatten()
                best_idx = sim_scores.argmax()
                best_match = machine_kb[best_idx]

                response["recommendation"] = {
                    "source_rca": best_match["file"],
                    "match_confidence": round(float(sim_scores[best_idx]), 2),
                    "root_cause": best_match["root_cause"],
                    "capa": best_match["capa"],
                    "action": f"Based on previous failure of {machine} ({best_match['file']}): Execute inspection on {top_sensor}. Refer to CAPA directives from historical RCA."
                }
            else:
                # Fallback: search all
                query_vec = tfidf_vectorizer.transform([query])
                sim_scores = cosine_similarity(query_vec, tfidf_matrix).flatten()
                best_idx = sim_scores.argmax()
                if sim_scores[best_idx] > 0.05:
                    best_match = knowledge_base[best_idx]
                    response["recommendation"] = {
                        "source_rca": best_match["file"],
                        "match_confidence": round(float(sim_scores[best_idx]), 2),
                        "root_cause": best_match["root_cause"],
                        "capa": best_match["capa"],
                        "action": f"ACTION REQUIRED: Execute field inspection on {top_sensor} parameters."
                    }

    return jsonify(response)


# --- POIN 2 & 4: Equipment Data Endpoint ---
@app.route('/api/equipment/<machine>', methods=['GET'])
def get_equipment(machine):
    if machine not in MACHINE_MAP:
        return jsonify({"error": f"Machine {machine} not found"}), 404

    equip_file = os.path.join(EQUIP_DIR, MACHINE_MAP[machine]["equip"])
    result = {"machine": machine}

    try:
        # Equipment Info
        df_info = pd.read_excel(equip_file, sheet_name="Equipment Info")
        info = {}
        for i in range(2, 14):
            key = df_info.iloc[i, 0]
            val = df_info.iloc[i, 1]
            if pd.notna(key) and pd.notna(val):
                info[str(key).strip()] = str(val).strip()
        result["info"] = info

        # Alarm/Trip Limits
        limits = []
        for i in range(3, 10):
            param = df_info.iloc[i, 2]
            limit_val = df_info.iloc[i, 3]
            if pd.notna(param) and pd.notna(limit_val):
                limits.append({"parameter": str(param).strip(), "alarm_trip": str(limit_val).strip()})
        result["alarm_trip_limits"] = limits

        # Condition History
        df_hist = pd.read_excel(equip_file, sheet_name="Condition History")
        df_hist['Date'] = pd.to_datetime(df_hist['Date'], errors='coerce')
        history = []
        for _, row in df_hist.iterrows():
            entry = {}
            for col in df_hist.columns:
                val = row[col]
                if pd.isna(val):
                    entry[str(col).strip().replace('\n', ' ')] = None
                elif isinstance(val, pd.Timestamp):
                    entry[str(col).strip().replace('\n', ' ')] = val.strftime('%Y-%m-%d')
                else:
                    entry[str(col).strip().replace('\n', ' ')] = val
            history.append(entry)
        result["condition_history"] = history

    except Exception as e:
        result["error"] = str(e)

    return jsonify(result)


# --- POIN 2 & 4: KPI Endpoint ---
@app.route('/api/kpi/<machine>', methods=['GET'])
def get_kpi(machine):
    if machine not in MACHINE_MAP:
        return jsonify({"error": f"Machine {machine} not found"}), 404

    equip_file = os.path.join(EQUIP_DIR, MACHINE_MAP[machine]["equip"])
    result = {"machine": machine, "kpis": {}}

    try:
        df = pd.read_excel(equip_file, sheet_name="Performance Summary")
        for i in range(2, min(len(df), 20)):
            key = df.iloc[i, 0]
            val = df.iloc[i, 1]
            basis = df.iloc[i, 2] if len(df.columns) > 2 else None
            if pd.notna(key) and pd.notna(val):
                entry = {"value": val}
                if pd.notna(basis):
                    entry["basis"] = str(basis).strip()
                result["kpis"][str(key).strip()] = entry
    except Exception as e:
        result["error"] = str(e)

    return jsonify(result)


# --- POIN 2: Production Data Endpoint ---
@app.route('/api/production/<machine>', methods=['GET'])
def get_production(machine):
    if machine not in MACHINE_MAP:
        return jsonify({"error": f"Machine {machine} not found"}), 404

    prod_file = os.path.join(PROD_DIR, MACHINE_MAP[machine]["prod"])
    result = {"machine": machine}

    try:
        # PI Tags info
        df_tags = pd.read_excel(prod_file, sheet_name="PI Tag")
        tags = []
        for _, row in df_tags.iterrows():
            tags.append({
                "name": row.get("Name", ""),
                "description": row.get("Description", ""),
                "unit": row.get("engunits", ""),
                "typical": row.get("typicalvalue", "")
            })
        result["pi_tags"] = tags

        # Sensor data (last 168 hours = 1 week)
        df_data = pd.read_excel(prod_file, sheet_name="Sheet2")
        df_data['Timestamp'] = pd.to_datetime(df_data['Timestamp'], errors='coerce')
        df_recent = df_data.tail(168)  # Last week of hourly data

        data_points = []
        for _, row in df_recent.iterrows():
            point = {}
            for col in df_recent.columns:
                val = row[col]
                if pd.isna(val):
                    point[col] = None
                elif isinstance(val, pd.Timestamp):
                    point[col] = val.strftime('%Y-%m-%d %H:%M')
                else:
                    point[col] = float(val) if isinstance(val, (int, float, np.integer, np.floating)) else str(val)
            data_points.append(point)
        result["sensor_data"] = data_points
        result["total_records"] = len(df_data)

    except Exception as e:
        result["error"] = str(e)

    return jsonify(result)


# --- POIN 4: Incidents Endpoint ---
@app.route('/api/incidents', methods=['GET'])
def get_incidents():
    if incidents_df is None:
        return jsonify({"error": "Incident database not loaded"}), 500

    result = {"total": len(incidents_df), "incidents": []}
    for _, row in incidents_df.head(50).iterrows():
        inc = {}
        for col in incidents_df.columns:
            val = row[col]
            if pd.isna(val):
                inc[col] = None
            elif isinstance(val, pd.Timestamp):
                inc[col] = val.strftime('%Y-%m-%d')
            else:
                inc[col] = val
        result["incidents"].append(inc)

    return jsonify(result)


@app.route('/api/incidents/<machine>', methods=['GET'])
def get_machine_incidents(machine):
    if incidents_df is None:
        return jsonify({"error": "Incident database not loaded"}), 500

    filtered = incidents_df[incidents_df['Tag'] == machine]
    result = {"machine": machine, "total": len(filtered), "incidents": []}

    for _, row in filtered.iterrows():
        inc = {}
        for col in incidents_df.columns:
            val = row[col]
            if pd.isna(val):
                inc[col] = None
            elif isinstance(val, pd.Timestamp):
                inc[col] = val.strftime('%Y-%m-%d')
            else:
                inc[col] = val
        result["incidents"].append(inc)

    return jsonify(result)


# --- POIN 3: Available machines list ---
@app.route('/api/machines', methods=['GET'])
def get_machines():
    available = []
    for machine in MACHINE_MAP:
        available.append({
            "tag": machine,
            "has_model": machine in models,
            "has_equipment": os.path.exists(os.path.join(EQUIP_DIR, MACHINE_MAP[machine]["equip"])),
            "has_production": os.path.exists(os.path.join(PROD_DIR, MACHINE_MAP[machine]["prod"])),
            "has_rca": any(machine in kb["machine"] for kb in knowledge_base),
            "alarm_trip_params": len(alarm_trip_limits.get(machine, {}))
        })
    return jsonify({"machines": available, "total": len(available)})


# --- POIN 1: Standalone limit check ---
@app.route('/api/check-limits', methods=['POST'])
def check_limits():
    data = request.json
    machine = data.get('machine')
    sensor_data = data.get('sensor_data', {})

    if machine not in alarm_trip_limits:
        return jsonify({"error": f"No limits for {machine}"}), 404

    limit_flag, violations = check_engineering_limits(machine, sensor_data, list(sensor_data.keys()))
    return jsonify({
        "machine": machine,
        "limit_flag": limit_flag,
        "violations": violations,
        "limits": {k: v for k, v in alarm_trip_limits[machine].items()}
    })


# --- Serve frontend ---
@app.route('/')
def serve_frontend():
    return send_from_directory('frontend/extracted/chandra-asri-dashboard', 'index.html')


if __name__ == '__main__':
    print("\n" + "="*60)
    print("CAliber API Server - Ready!")
    print("="*60)
    print(f"Models loaded: {list(models.keys())}")
    print(f"Alarm/Trip limits: {list(alarm_trip_limits.keys())}")
    print(f"Knowledge base: {len(knowledge_base)} RCA documents")
    print(f"Incidents: {len(incidents_df) if incidents_df is not None else 0} records")
    print()
    print("Endpoints:")
    print("  POST /api/predict          - Anomaly detection + limit check")
    print("  POST /api/check-limits     - Standalone limit check")
    print("  GET  /api/machines         - List available machines")
    print("  GET  /api/equipment/<tag>  - Equipment info & history")
    print("  GET  /api/kpi/<tag>        - Performance KPIs")
    print("  GET  /api/production/<tag> - Sensor data")
    print("  GET  /api/incidents        - All incidents")
    print("  GET  /api/incidents/<tag>  - Machine incidents")
    print("="*60)
    app.run(debug=False, port=5000)
