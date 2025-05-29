import json
import csv

def convert_hat_guzergah_to_geojson(csv_file):
    features = []
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            feature = {
                "type": "Feature",
                "properties": {
                    "hat_no": row['HAT_NO']
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [float(row['KOORDINAT_Y']), float(row['KOORDINAT_X'])]
                }
            }
            features.append(feature)
    
    geojson = {
        "type": "FeatureCollection",
        "features": features
    }
    return geojson

def main():
    hat_guzergah_geojson = convert_hat_guzergah_to_geojson('hat_guzergah_clean.csv')
    with open('hat_guzergah.geojson', 'w', encoding='utf-8') as f:
        json.dump(hat_guzergah_geojson, f, ensure_ascii=False, indent=2)
    print("Hat Güzergah GeoJSON dosyası oluşturuldu.")

if __name__ == "__main__":
    main() 