import os
import json
import psycopg2
from shapely.geometry import shape, Point

# Veritabanı bağlantı bilgileri
DB_NAME = "KonyaKBS"
DB_USER = "postgres"
DB_PASSWORD = "postgres"
DB_HOST = "localhost"
DB_PORT = "5432"

def get_geometry_for_db(geometry, target_type):
    geom = shape(geometry)
    if target_type == 'Point' and not isinstance(geom, Point):
        return geom.centroid.wkt
    return geom.wkt

def import_turistik_konumlar_geojson(file_path, table_name, geometry_type):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    cur = conn.cursor()

    for feature in data['features']:
        props = feature['properties']
        geometry = feature['geometry']
        geom_wkt = get_geometry_for_db(geometry, geometry_type)
        cur.execute(f"""
            INSERT INTO turistik_konumlar (tur, isim, icerik, resim, geometry)
            VALUES (%s, %s, %s, %s, ST_SetSRID(ST_GeomFromText(%s), 4326))
        """, (
            props.get('tur'),
            props.get('isim'),
            props.get('icerik'),
            props.get('resim'),
            geom_wkt
        ))
    conn.commit()
    cur.close()
    conn.close()

def main():
    file_path = os.path.join('tarihi-turistik-data', 'mescitler.geojson')
    print(f"İçe aktarılıyor: mescitler.geojson -> turistik_konumlar")
    import_turistik_konumlar_geojson(file_path, 'turistik_konumlar', 'Point')
    print(f"Tamamlandı: mescitler.geojson")

if __name__ == "__main__":
    main() 