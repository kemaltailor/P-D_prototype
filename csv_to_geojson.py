import json
import csv
import os

def convert_hava_istasyon_to_geojson(csv_file):
    features = []
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f, delimiter=';')
        next(reader)  # Başlık satırını atla
        
        for row in reader:
            if len(row) < 3:
                continue
                
            name = row[0].strip()
            try:
                latitude = float(row[1].strip())
                longitude = float(row[2].strip())
            except ValueError:
                continue
            
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [longitude, latitude]
                },
                "properties": {
                    "istasyon_adi": name
                }
            }
            features.append(feature)
    
    geojson = {
        "type": "FeatureCollection",
        "name": "hava_istasyon",
        "features": features
    }
    
    return geojson

def convert_kamera_to_geojson(csv_file):
    features = []
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        next(reader)  # Başlık satırını atla
        
        for row in reader:
            if len(row) < 3:
                continue
                
            name = row[0].strip()
            try:
                latitude = float(row[1].strip())
                longitude = float(row[2].strip())
            except ValueError:
                continue
            
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [longitude, latitude]
                },
                "properties": {
                    "kamera_adi": name
                }
            }
            features.append(feature)
    
    geojson = {
        "type": "FeatureCollection",
        "name": "kameralar",
        "features": features
    }
    
    return geojson

def main():
    # Hava istasyonları için dönüşüm
    hava_istasyon_geojson = convert_hava_istasyon_to_geojson('duplicatefix/hava-istasyon-konum.csv')
    with open('duplicatefix/hava-istasyon-konum.geojson', 'w', encoding='utf-8') as f:
        json.dump(hava_istasyon_geojson, f, ensure_ascii=False, indent=2)
    print("Hava istasyonları GeoJSON dosyası oluşturuldu.")
    
    # Kameralar için dönüşüm
    kamera_geojson = convert_kamera_to_geojson('duplicatefix/kamera-konum.csv')
    with open('duplicatefix/kamera-konum.geojson', 'w', encoding='utf-8') as f:
        json.dump(kamera_geojson, f, ensure_ascii=False, indent=2)
    print("Kameralar GeoJSON dosyası oluşturuldu.")

if __name__ == "__main__":
    main() 