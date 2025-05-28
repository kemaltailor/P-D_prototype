import base64
import os
import csv

# base64 klasörü yoksa oluştur
base64_dir = "./base64"
os.makedirs(base64_dir, exist_ok=True)

def convert_to_base64(image_path):
    with open(image_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")
        return f"data:image/webp;base64,{b64}"

# Mescit resimleri klasörü
mescit_dir = "mescit-resimler"

# Her bir resim için ayrı CSV dosyası oluştur
for filename in os.listdir(mescit_dir):
    if filename.endswith(('.webp', '.jpg')):
        # Dosya adını al (uzantısız)
        base_name = os.path.splitext(filename)[0]
        csv_filename = f"{base_name}.csv"
        csv_path = os.path.join(base64_dir, csv_filename)
        
        # Resmi base64'e çevir
        image_path = os.path.join(mescit_dir, filename)
        base64_string = convert_to_base64(image_path)
        
        # CSV dosyasını oluştur
        with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(['Dosya Adı', 'Base64 Değeri'])
            writer.writerow([filename, base64_string])
        
        print(f"{filename} için CSV dosyası oluşturuldu: {csv_filename}")

print("\nTüm CSV dosyaları base64 klasörüne kaydedildi.")