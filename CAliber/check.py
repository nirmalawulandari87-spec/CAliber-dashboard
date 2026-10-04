import os, glob

print("=== CEK KESESUAIAN DATA ===")
print()

machines = ['PU-2101B', 'KO-3201', 'PM-4405B', 'HE-3301', 'BL-5702']

print("DASHBOARD (app.js):")
print("  PU-2101B, HE-3301, KO-3201, PM-4405B, BL-5702")
print()

print("AI MODELS (models/):")
for m in machines:
    model_path = f"models/ai1_model_{m}.pkl"
    cols_path = f"models/cols_{m}.pkl"
    ok = os.path.exists(model_path) and os.path.exists(cols_path)
    status = "OK" if ok else "MISSING"
    print(f"  {m}: {status}")
print()

print("EQUIPMENT DATA (data_equipment/):")
files = glob.glob("data_equipment/*.xlsx")
for m in machines:
    found = any(m in f for f in files)
    status = "OK" if found else "MISSING"
    print(f"  {m}: {status}")
print()

print("PRODUCTION DATA (data_production/):")
files = glob.glob("data_production/*.xlsx")
for m in machines:
    found = any(m in f for f in files)
    status = "OK" if found else "MISSING"
    print(f"  {m}: {status}")
print()

print("RCA DOCUMENTS (data_rca/):")
files = glob.glob("data_rca/*.pptx")
for m in machines:
    found = any(m in f for f in files)
    status = "OK" if found else "MISSING"
    print(f"  {m}: {status}")
print()

print("=== KESIMPULAN ===")
all_ok = True
for m in machines:
    has_model = os.path.exists(f"models/ai1_model_{m}.pkl")
    has_equip = any(m in f for f in glob.glob("data_equipment/*.xlsx"))
    has_prod = any(m in f for f in glob.glob("data_production/*.xlsx"))
    has_rca = any(m in f for f in glob.glob("data_rca/*.pptx"))
    lengkap = all([has_model, has_equip, has_prod, has_rca])
    if not lengkap:
        all_ok = False
    status = "LENGKAP" if lengkap else "ADA YG KURANG"
    print(f"  {m}: {status}")

print()
if all_ok:
    print("SEMUA 5 MESIN SUDAH SESUAI DAN LENGKAP!")
else:
    print("ADA YANG BELUM SESUAI!")
