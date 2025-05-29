import json
from sqlalchemy import create_engine, text
from geoalchemy2 import Geometry

# Veritabanı bağlantı bilgileri
DB_NAME = "KonyaKBS"
DB_USER = "postgres"
DB_PASSWORD = "postgres"
DB_HOST = "localhost"
DB_PORT = "5432"

# GeoJSON dosyasını oku
with open('hat_guzergah.geojson', 'r', encoding='utf-8') as f:
    geojson = json.load(f)

# PostgreSQL bağlantısı
engine = create_engine(f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}')

# GeoJSON'ı veritabanına yükle
with engine.connect() as conn:
    # PostGIS uzantısını aktif et
    conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
    
    # Tablo oluştur
    conn.execute(text("""
        DROP TABLE IF EXISTS hat_guzergah;
        CREATE TABLE hat_guzergah (
            id SERIAL PRIMARY KEY,
            hat_no INTEGER,
            geometry GEOMETRY(Point, 4326)
        );
    """))
    
    # Her bir point'i veritabanına ekle
    for feature in geojson['features']:
        hat_no = feature['properties']['hat_no']
        coordinates = feature['geometry']['coordinates']
        
        # WKT formatına çevir
        wkt = f"POINT({coordinates[0]} {coordinates[1]})"
        
        # Veritabanına ekle
        conn.execute(text(f"""
            INSERT INTO hat_guzergah (hat_no, geometry)
            VALUES ({hat_no}, ST_SetSRID(ST_GeomFromText('{wkt}'), 4326));
        """))
    
    # Değişiklikleri kaydet
    conn.commit()

print("GeoJSON verisi veritabanına yüklendi.") 