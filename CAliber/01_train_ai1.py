import pandas as pd
import os
import glob
import pickle
from sklearn.ensemble import IsolationForest

# Folder paths
PROD_DIR = "data_production"
MODEL_DIR = "models"

# Buat folder models jika belum ada
if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

def train_isolation_forest():
    print("Memulai proses training AI 1 (Isolation Forest)...\n")
    
    file_list = glob.glob(os.path.join(PROD_DIR, "*.xlsx"))
    
    if not file_list:
        print("GAGAL: Tidak ada file .xlsx ditemukan di folder data_production!")
        return
        
    for file in file_list:
        filename = os.path.basename(file)
        name_part = filename.replace("Production Data - ", "").replace(".xlsx", "")
        machine_parts = name_part.split(' ')
        machine_name = machine_parts[1] if len(machine_parts) > 1 else machine_parts[0]
        
        print(f"Memproses Mesin: {machine_name}")
        
        try:
            df = pd.read_excel(file, sheet_name='Sheet2')
        except Exception as e:
            print(f"  GAGAL membaca {filename}. Pastikan nama sheet benar. Error: {e}")
            continue
            
        if 'RUN_STATUS' in df.columns:
            df = df[df['RUN_STATUS'] == 'ON']
            df = df.drop(columns=['RUN_STATUS'])
            
        if 'Timestamp' in df.columns:
            df['Timestamp'] = pd.to_datetime(df['Timestamp'])
            df.set_index('Timestamp', inplace=True)
            
        df = df.ffill().bfill()
        
        sensor_columns = df.select_dtypes(include=['float64', 'int64']).columns
        if len(sensor_columns) == 0:
            print(f"  GAGAL: Tidak ada kolom sensor angka ditemukan di {machine_name}")
            continue
            
        X = df[sensor_columns]
        
        print(f"   > Menggunakan {len(sensor_columns)} fitur sensor: {list(sensor_columns)}")
        print(f"   > Total data training: {len(X)} jam operasional")
        
        ai1_model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
        ai1_model.fit(X)
        
        model_path = os.path.join(MODEL_DIR, f"ai1_model_{machine_name}.pkl")
        with open(model_path, 'wb') as f:
            pickle.dump(ai1_model, f)
            
        cols_path = os.path.join(MODEL_DIR, f"cols_{machine_name}.pkl")
        with open(cols_path, 'wb') as f:
            pickle.dump(list(sensor_columns), f)
            
        print(f"   SUKSES: Model {machine_name} berhasil dilatih dan disimpan!\n")

if __name__ == "__main__":
    train_isolation_forest()
    print("SEMUA MESIN SELESAI DI-TRAINING! AI 1 SIAP DIGUNAKAN.")
