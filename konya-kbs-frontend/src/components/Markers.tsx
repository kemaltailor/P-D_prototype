import React, { useMemo, useCallback } from 'react';
import { Marker, MapRef } from 'react-map-gl';
import Supercluster from 'supercluster';
import { BBox, Feature, Point } from 'geojson';
import bisikletParkIcon from '../icons/bisiklet-park-alani.png';
import camiIcon from '../icons/cami.png';
import eczaneIcon from '../icons/eczane.png';
import havaOlcumIcon from '../icons/hava-olcum-istasyonu.png';
import kameraIcon from '../icons/kamera.png';
import okulIcon from '../icons/okul.png';
import otoparkIcon from '../icons/otopark.png';
import parkIcon from '../icons/park.png';
import paylasimliBisikletIcon from '../icons/paylasimli-bisiklet-istasyonu.png';
import saglikTesisiIcon from '../icons/saglik-tesisi.png';
import tarihiTuristikIcon from '../icons/tarihi-turistik-yerler.png';
import tatliSuCesmesiIcon from '../icons/tatli-su-cesmesi.png';
import toplanmaAlaniIcon from '../icons/toplanma-alani.png';
import { Location } from '../types/Location';

interface MarkersProps {
  locations: Location[];
  filters: Record<string, boolean>;
  bounds: BBox;
  zoom: number;
  isClusterMode: boolean;
  onMarkerClick: (location: Location) => void;
  mapRef: React.RefObject<MapRef>;
  parkingOccupancies: Record<number, number>;
}

interface ClusterProperties {
  cluster: boolean;
  locationId: number;
  type: string;
  point_count?: number;
}

const LOCATION_TYPES = [
  'Park',
  'Cami',
  'Sağlık Tesisi',
  'Okul',
  'Tatlı Su Çeşmesi',
  'Eczane',
  'Toplanma Alanı',
  'Bisiklet Park Alanı',
  'Paylaşımlı Bisiklet İstasyonu',
  'Otopark',
  'Hava Ölçüm İstasyonu',
  'Kamera',
  'Tarihi/Turistik Yerler'
] as const;

const calculatePolygonCenter = (coordinates: number[][][]): [number, number] => {
  const points = coordinates[0]; // İlk ring'i al (dış sınır)
  let sumX = 0;
  let sumY = 0;
  
  for (const point of points) {
    sumX += point[0];
    sumY += point[1];
  }
  
  return [sumX / points.length, sumY / points.length];
};

const ICONS: Record<string, string> = {
  'Bisiklet Park Alanı': bisikletParkIcon,
  'Cami': camiIcon,
  'Eczane': eczaneIcon,
  'Hava Ölçüm İstasyonu': havaOlcumIcon,
  'Kamera': kameraIcon,
  'Okul': okulIcon,
  'Otopark': otoparkIcon,
  'Park': parkIcon,
  'Paylaşımlı Bisiklet İstasyonu': paylasimliBisikletIcon,
  'Sağlık Tesisi': saglikTesisiIcon,
  'Tarihi/Turistik Yerler': tarihiTuristikIcon,
  'Tatlı Su Çeşmesi': tatliSuCesmesiIcon,
  'Toplanma Alanı': toplanmaAlaniIcon
};

// Her konum türü için özel stil değerleri
const MARKER_STYLES: Record<string, { size: string, shadow: string }> = {
  'Bisiklet Park Alanı': { size: 'w-20 h-30', shadow: 'drop-shadow(0 3px 6px rgb(0 0 0 / 0.3))' },
  'Cami': { size: 'w-10 h-15', shadow: 'drop-shadow(0 3px 6px rgb(0 0 0 / 0.3))' },
  'Eczane': { size: 'w-10 h-10', shadow: 'drop-shadow(0 3px 6px rgb(0 0 0 / 0.3))' },
  'Hava Ölçüm İstasyonu': { size: 'w-20 h-35', shadow: 'drop-shadow(0 3px 6px rgb(0 0 0 / 0.2))' },
  'Kamera': { size: 'w-30 h-16', shadow: 'drop-shadow(0 3px 6px rgb(0 0 0 / 0.3))' },
  'Okul': { size: 'w-10 h-10', shadow: 'drop-shadow(0 3px 6px rgb(0 0 0 / 0.3))' },
  'Otopark': { size: 'w-15 h-14', shadow: 'drop-shadow(0 3px 6px rgb(0 0 0 / 0.3))' },
  'Park': { size: 'w-15 h-14', shadow: 'drop-shadow(0 3px 6px rgb(0 0 0 / 0.3))' },
  'Paylaşımlı Bisiklet İstasyonu': { size: 'w-26 h-24', shadow: 'drop-shadow(0 3px 6px rgb(0 0 0 / 0.3))' },
  'Sağlık Tesisi': { size: 'w-15 h-14', shadow: 'drop-shadow(0 3px 6px rgb(0 0 0 / 0.3))' },
  'Tarihi/Turistik Yerler': { size: 'w-20 h-20', shadow: 'drop-shadow(0 3px 6px rgb(0 0 0 / 0.3))' },
  'Tatlı Su Çeşmesi': { size: 'w-10 h-10', shadow: 'drop-shadow(0 3px 6px rgb(0 0 0 / 0.3))' },
  'Toplanma Alanı': { size: 'w-18 h-16', shadow: 'drop-shadow(0 3px 6px rgb(0 0 0 / 0.3))' }
};

const Markers: React.FC<MarkersProps> = ({ locations, filters, bounds, zoom, isClusterMode, onMarkerClick, mapRef, parkingOccupancies }) => {
  const superclusters = useMemo(() => {
    if (!isClusterMode) return null;

    const clusters = {} as Record<string, Supercluster>;
    
    LOCATION_TYPES.forEach(type => {
      const cluster = new Supercluster({
        radius: 120,
        maxZoom: 16,
        minZoom: 5,
        minPoints: 4,
        nodeSize: 128
      });

      const typeLocations = locations.filter(loc => loc.type === type);
      const points: Array<Feature<Point, ClusterProperties>> = typeLocations.map(loc => ({
        type: 'Feature',
        properties: { 
          cluster: false, 
          locationId: loc.id, 
          type: loc.type
        },
        geometry: {
          type: 'Point',
          coordinates: [loc.longitude, loc.latitude],
        },
      }));

      cluster.load(points);
      clusters[type] = cluster;
    });

    return clusters;
  }, [locations, isClusterMode]);

  // Görünür noktaları filtreleme fonksiyonu
  const getVisiblePoints = useCallback((type: string, locations: Location[]) => {
    // Zoom seviyesi 14'ten küçükse ve cluster modu kapalıysa hiç nokta gösterme
    if (zoom < 14 && !isClusterMode) return [];

    // Harita sınırları içindeki noktaları filtrele
    return locations.filter(loc => {
      return loc.type === type &&
        loc.longitude >= bounds[0] &&
        loc.longitude <= bounds[2] &&
        loc.latitude >= bounds[1] &&
        loc.latitude <= bounds[3];
    });
  }, [bounds, zoom, isClusterMode]);

  // Marker render fonksiyonu
  const renderMarker = useCallback((location: Location) => {
    const style = MARKER_STYLES[location.type];
    return (
      <Marker
        key={`location-${location.id}`}
        latitude={location.latitude}
        longitude={location.longitude}
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          onMarkerClick(location);
        }}
        style={{ cursor: 'pointer' }}
      >
        <img
          src={ICONS[location.type]}
          alt={location.type}
          className={style.size}
          style={{
            transform: 'translate(-50%, -100%)',
            filter: style.shadow
          }}
        />
      </Marker>
    );
  }, [onMarkerClick]);

  const getMarkerColor = (type: string) => {
    const colors = {
      'Park': '#4CAF50', // Yeşil
      'Cami': '#9C27B0', // Mor
      'Sağlık Tesisi': '#F44336', // Kırmızı
      'Okul': '#2196F3', // Mavi
      'Tatlı Su Çeşmesi': '#00BCD4', // Açık Mavi
      'Eczane': '#FF9800', // Turuncu
      'Toplanma Alanı': '#FFEB3B', // Sarı
      'Bisiklet Park Alanı': '#FFC107', // Amber
      'Paylaşımlı Bisiklet İstasyonu': '#795548', // Kahverengi
      'Otopark': '#3F51B5', // İndigo
      'Hava Ölçüm İstasyonu': '#E91E63', // Pembe
      'Kamera': '#673AB7', // Koyu Mor
      'Tarihi/Turistik Yerler': '#FF5722' // Turuncu-Kahverengi
    };
    return colors[type as keyof typeof colors] || '#9E9E9E';
  };

  // Çember çizimi için stil
  const circleStyle = {
    fill: 'rgba(33, 150, 243, 0.2)', // Daha koyu mavi
    stroke: 'rgba(33, 150, 243, 0.8)', // Daha belirgin border
    strokeWidth: 2
  };

  const extractLocation = (feature: any, type: Location['type']): Location => {
    let name = '';
    let occupiedSpaces: number | undefined;
    
    // Park
    if (type === 'Park') {
      name = `${feature.properties.ilceadi || ''} - ${feature.properties.usT_NITELIK_ADI || ''}`;
    } else if (type === 'Sağlık Tesisi') {
      name = feature.properties.adi || '';
    } else if (type === 'Cami') {
      name = feature.properties.adi || '';
    } else if (type === 'Okul') {
      name = feature.properties.adi || '';
    } else if (type === 'Eczane') {
      name = feature.properties.adi || '';
    } else if (type === 'Toplanma Alanı') {
      name = feature.properties.adi || '';
    } else if (type === 'Bisiklet Park Alanı') {
      name = feature.properties.niteliK_AD || '';
    } else if (type === 'Paylaşımlı Bisiklet İstasyonu') {
      name = feature.properties.niteliK_AD || '';
    } else if (type === 'Otopark') {
      name = feature.properties.name || '';
      occupiedSpaces = feature.properties.occupiedSpaces;
    } else if (type === 'Tatlı Su Çeşmesi') {
      name = feature.properties.aciklama || '';
    } else if (type === 'Hava Ölçüm İstasyonu') {
      name = feature.properties.niteliK_AD || '';
    } else if (type === 'Kamera') {
      name = feature.properties.niteliK_AD || '';
      return {
        id: Math.random(),
        type,
        longitude: feature.geometry.coordinates[0],
        latitude: feature.geometry.coordinates[1],
        name,
        cameraUrl: feature.properties.url || ''
      };
    }

    if (feature.geometry.type === 'Point') {
      return {
        id: Math.random(),
        type,
        longitude: feature.geometry.coordinates[0],
        latitude: feature.geometry.coordinates[1],
        name,
        occupiedSpaces
      };
    } else if (feature.geometry.type === 'Polygon') {
      const center = calculatePolygonCenter(feature.geometry.coordinates);
      return {
        id: Math.random(),
        type,
        longitude: center[0],
        latitude: center[1],
        name,
        occupiedSpaces
      };
    } else {
      throw new Error(`Desteklenmeyen geometri tipi: ${feature.geometry.type}`);
    }
  };

  return (
    <>
      {LOCATION_TYPES.map(type => {
        if (!filters[type]) return null;

        // Zoom seviyesi 14'ten küçükse veya cluster modu açıksa cluster'ları göster
        if (zoom < 14 || isClusterMode) {
          const typeCluster = superclusters?.[type];
          if (!typeCluster) return null;

          const clusters = typeCluster.getClusters(bounds, Math.floor(zoom));

          return clusters.map(cluster => {
            const [longitude, latitude] = cluster.geometry.coordinates;
            const { cluster: isCluster, point_count: pointCount } = cluster.properties;

            if (isCluster) {
              const baseSize = Math.max(
                30,
                Math.min(
                  Math.sqrt(pointCount! || 1) * 15,
                  70
                )
              );
              const zoomFactor = Math.max(0.6, (16 - zoom) / 8);
              const size = baseSize * zoomFactor;
              const color = getMarkerColor(type);

              return (
                <Marker
                  key={`cluster-${type}-${cluster.id}`}
                  latitude={latitude}
                  longitude={longitude}
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    // Cluster'a tıklandığında zoom yap
                    if (mapRef.current) {
                      mapRef.current.flyTo({
                        center: [longitude, latitude],
                        zoom: Math.min(zoom + 2, 16),
                        duration: 1000
                      });
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div 
                    className="rounded-full flex items-center justify-center text-white font-medium shadow-lg"
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      transform: 'translate(-50%, -50%)',
                      fontSize: `${Math.max(13, size/2.5)}px`,
                      backgroundColor: color,
                      opacity: 0.9,
                      border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    {pointCount}
                  </div>
                </Marker>
              );
            }

            // Tekil nokta için
            const location = locations.find(loc => loc.id === cluster.properties.locationId);
            if (!location) return null;

            return renderMarker(location);
          });
        }

        // Zoom seviyesi 14 ve üstündeyse ve cluster modu kapalıysa tekil noktaları göster
        const visiblePoints = getVisiblePoints(type, locations);
        return visiblePoints.map(renderMarker);
      })}
    </>
  );
};

export default Markers;