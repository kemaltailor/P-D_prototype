import json
import csv

def convert_mescitler_to_geojson(csv_file):
    features = []
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                lat = float(row['enlem'])
                lon = float(row['boylam'])
            except Exception:
                continue
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [lon, lat]
                },
                "properties": {
                    "tur": row['tur'],
                    "isim": row['isim'],
                    "icerik": row['icerik'],
                    "resim": row['resim']
                }
            }
            features.append(feature)
    geojson = {
        "type": "FeatureCollection",
        "name": "mescitler",
        "features": features
    }
    return geojson

def main():
    mescitler_geojson = convert_mescitler_to_geojson('tarihi-turistik-data/mescitler.csv')
    with open('tarihi-turistik-data/mescitler.geojson', 'w', encoding='utf-8') as f:
        json.dump(mescitler_geojson, f, ensure_ascii=False, indent=2)
    print("Mescitler GeoJSON dosyası oluşturuldu.")

if __name__ == "__main__":
    main() 