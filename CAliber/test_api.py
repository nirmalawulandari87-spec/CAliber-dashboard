import urllib.request
import json

url = "http://localhost:5000/api/predict"

payload = {
    "machine": "PU-2101B",
    "sensor_data": {
        "PU2101B_FEED": 13.5,
        "PU2101B_DISP": 9.2,
        "PU2101B_VIB": 12.5,
        "PU2101B_TEMP": 75.0,
        "PU2101B_AMP": 150.0,
        "PLANT_RATE": 14.0
    }
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

print("MENGIRIM DATA SENSOR KE SISTEM AI...")
print(f"Data Input:\n{json.dumps(payload['sensor_data'], indent=2)}")

try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        print("\n===============================")
        print("      HASIL ANALISIS AI        ")
        print("===============================")
        print(f"Mesin  : {result['machine']}")
        print(f"Status : {result['status']} (Skor Anomali: {result['anomaly_score']})")
        
        if result['status'] == 'CRITICAL (ANOMALY)':
            print("\n>> AI 2 (SHAP) - KENAPA ANOMALI? (3 Faktor Utama):")
            for item in result['explanation'][:3]:
                print(f"   - {item['sensor']} = {item['value']} (Kontribusi: {item['contribution']:.3f})")
                
            print("\n>> AI 3 (TF-IDF) - REKOMENDASI SOLUSI DARI DATABASE:")
            rec = result['recommendation']
            print(f"   - Sumber RCA       : {rec.get('source_rca', 'N/A')}")
            print(f"   - Tingkat Kecocokan: {rec.get('match_confidence', 'N/A')}")
            print(f"   - Saran Tindakan   : {rec.get('action', 'N/A')}")
            
except Exception as e:
    print(f"Gagal menghubungi API: {e}")
