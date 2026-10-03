# CAliber — AI-Powered Predictive Maintenance Dashboard

**Chandra Asri Resin Plant (ARP) — Equipment Reliability Intelligence System**

## Overview
CAliber is an integrated predictive maintenance platform that combines AI anomaly detection, engineering alarm/trip limits, and historical failure analysis to prevent unplanned equipment downtime.

## Architecture

### AI Layer 1 — Anomaly Detection
Machine learning model trained on historical sensor data to detect complex multi-sensor anomaly patterns across 5 critical rotating equipment.

### AI Layer 2 — Explainability
Feature contribution analysis to identify which sensor parameters drive the anomaly detection, enabling targeted maintenance response.

### AI Layer 3 — Failure Memory & Recommendation
Natural language processing system that matches current anomaly patterns against historical RCA (Root Cause Analysis) documents to provide specific, evidence-based maintenance recommendations.

### Engineering Limit Layer
Alarm and Trip threshold monitoring sourced directly from Equipment Performance records, ensuring single-sensor failures are never missed.

## Monitored Equipment

| Tag | Type | Plant |
|-----|------|-------|
| PU-2101B | Centrifugal Feed Pump | Resin Plant (ARP) |
| KO-3201 | Knockout Drum | Resin Plant (ARP) |
| PM-4405B | Product Mix Pump Motor | Resin Plant (ARP) |
| HE-3301 | Fired Process Heater | Resin Plant (ARP) |
| BL-5702 | Blower / Fan Unit | Resin Plant (ARP) |

## Data Sources
- `data_production/` — Hourly sensor readings from DCS/PI (720 hrs per machine)
- `data_equipment/` — Equipment info, condition history, performance KPIs
- `data_incident/` — 382 incident records with RCA & CAPA tracking
- `data_rca/` — Root Cause Analysis presentation decks

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Train AI models (one-time)
python 01_train_ai1.py

# Start API server
python app.py

# Open dashboard
# Navigate to frontend/extracted/chandra-asri-dashboard/index.html
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/predict` | Anomaly detection + engineering limit check |
| GET | `/api/equipment/<machine>` | Equipment info & condition history |
| GET | `/api/production/<machine>` | Historical sensor data |
| GET | `/api/incidents` | Incident database |
| GET | `/api/incidents/<machine>` | Incidents for specific machine |
| GET | `/api/kpi/<machine>` | Performance KPIs |

## Tech Stack
- **Backend:** Python, Flask, scikit-learn, SHAP, pandas
- **Frontend:** HTML5, CSS3, JavaScript, Chart.js
- **AI Models:** Isolation Forest, TF-IDF Cosine Similarity
- **Data:** Microsoft Excel (DCS export format)

## Team
CAliber Team — Chandra Asri Petrochemical
