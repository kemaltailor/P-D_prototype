import os
import json
import psycopg2
from psycopg2.extras import Json
from geoalchemy2 import Geometry
from sqlalchemy import create_engine, text
import geopandas as gpd
from shapely.geometry import shape, Point
import codecs
import re

# Veritabanı bağlantı bilgileri
DB_NAME = "KonyaKBS"
DB_USER = "postgres"
DB_PASSWORD = "postgres"
DB_HOST = "localhost"
DB_PORT = "5432"

def fix_turkish_chars(text):
    """Türkçe karakterleri düzeltir."""
    if not isinstance(text, str):
        return text
    
    replacements = {
        'Ä°': 'İ',
        'Ä±': 'ı',
        'Ã¼': 'ü',
        'Ã–': 'Ö',
        'Ã§': 'ç',
        'ÅŸ': 'ş',
        'Ä': 'İ',
        'Å': 'Ş',
        'Ã': 'Ü',
        'Ã\u009C': 'Ü',
        'Ã¼': 'ü',
        'Å\u009E': 'Ş'
    }
    
    for wrong, correct in replacements.items():
        text = text.replace(wrong, correct)
    
    return text

def get_geometry_for_db(geometry, target_type):
    """Geometriyi hedef tipe dönüştürür."""
    geom = shape(geometry)
    if target_type == 'Point' and not isinstance(geom, Point):
        return geom.centroid.wkt
    return geom.wkt

def get_safe_property(properties, key, default="Bilinmiyor"):
    """Özellik değerini güvenli bir şekilde alır."""
    value = properties.get(key, default)
    if value is None:
        return default
    return fix_turkish_chars(str(value).strip())

def import_geojson(file_path, table_name, geometry_type):
    """GeoJSON dosyasını veritabanına yükler."""
    # Sorunlu tablolar için özel işlem
    if table_name in ['Okullar', 'SaglikTesisleri', 'ToplanmaAlanlari']:
        with open(file_path, 'rb') as f:
            content = f.read()
            data = json.loads(content.decode('utf-8', errors='ignore'))
    else:
        with codecs.open(file_path, 'r', encoding='utf-8-sig') as f:
            data = json.load(f)
    
    # Veritabanı bağlantısı
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    cur = conn.cursor()
    
    # Tablo sütun isimleri
    column_mappings = {
        'Eczaneler': {'name': 'ADI'},
        'Camiler': {'name': 'NITELIK_AD'},
        'Okullar': {'name': 'NITELIK_AD'},
        'SaglikTesisleri': {'name': 'NITELIK_AD'},
        'ToplanmaAlanlari': {'name': 'ADI'},
        'Parklar': {
            'name': 'POI_ADI',
            'ilce': 'ILCEADI',
            'ust_nitelik': 'UST_NITELIK_ADI'
        },
        'HavaKaliteIstasyon': {'name': 'istasyon_adi'},
        'Kameralar': {'name': 'kamera_adi'}
    }
    
    # Her bir özelliği veritabanına ekle
    for feature in data['features']:
        properties = feature['properties']
        geometry = feature['geometry']
        
        # Geometriyi hedef tipe dönüştür
        geom_wkt = get_geometry_for_db(geometry, geometry_type)
        
        if table_name == "Parklar":
            # Parklar tablosu için ek sütunlar
            cur.execute(f"""
                INSERT INTO "{table_name}" ("Name", "Location", "IlceAdi", "UstNitelikAdi")
                VALUES (%s, ST_SetSRID(ST_GeomFromText(%s), 4326), %s, %s)
            """, (
                get_safe_property(properties, column_mappings[table_name]['name']),
                geom_wkt,
                get_safe_property(properties, column_mappings[table_name]['ilce']),
                get_safe_property(properties, column_mappings[table_name]['ust_nitelik'])
            ))
        else:
            # Diğer tablolar için standart sütunlar
            cur.execute(f"""
                INSERT INTO "{table_name}" ("Name", "Location")
                VALUES (%s, ST_SetSRID(ST_GeomFromText(%s), 4326))
            """, (
                get_safe_property(properties, column_mappings[table_name]['name']),
                geom_wkt
            ))
    
    conn.commit()
    cur.close()
    conn.close()

def main():
    # GeoJSON dosyaları ve hedef tablolar
    files_to_import = [
        ('hava-istasyon-konum.geojson', 'HavaKaliteIstasyon', 'Point'),
        ('kamera-konum.geojson', 'Kameralar', 'Point')
    ]
    
    for file_name, table_name, geometry_type in files_to_import:
        try:
            file_path = os.path.join('duplicatefix', file_name)
            print(f"İçe aktarılıyor: {file_name} -> {table_name}")
            import_geojson(file_path, table_name, geometry_type)
            print(f"Tamamlandı: {file_name}")
        except Exception as e:
            print(f"Hata: {file_name} aktarılırken bir sorun oluştu: {str(e)}")

if __name__ == "__main__":
    main() 