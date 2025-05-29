import pandas as pd

# Orijinal CSV'yi oku
df = pd.read_csv('hat_guzergah_05_2024.csv')

# YON sütununu sil
df = df.drop('YON', axis=1)

def fix_coord(val):
    if pd.isna(val):
        return val
    val = str(val).replace('.', '')  # Tüm noktaları kaldır
    if len(val) > 2:
        return float(val[:2] + '.' + val[2:])
    return float(val)

# Koordinatları düzelt
df['KOORDINAT_X'] = df['KOORDINAT_X'].apply(fix_coord)
df['KOORDINAT_Y'] = df['KOORDINAT_Y'].apply(fix_coord)

# Temiz csv olarak kaydet
df.to_csv('hat_guzergah_clean.csv', index=False)

print('Temiz CSV oluşturuldu: hat_guzergah_clean.csv') 