import React, { useMemo, useCallback } from 'react';
import { Marker, MapRef } from 'react-map-gl';
import Supercluster from 'supercluster';
import { BBox, Feature, Point } from 'geojson';
import bisikletParkIcon from '../icons/bisiklet-park-konum.png';
import paylasimliIstasyonIcon from '../icons/paylasimli-bisiklet-istasyonlari.png';
import otoparkIcon from '../icons/otoparklar.png';
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
    const isBikeParking = location.type === 'Bisiklet Park Alanı';
    const isBikeStation = location.type === 'Paylaşımlı Bisiklet İstasyonu';
    const isCarParking = location.type === 'Otopark';
    
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
        {isBikeParking || isBikeStation || isCarParking ? (
          <img 
            src={isCarParking ? otoparkIcon : (isBikeParking ? bisikletParkIcon : paylasimliIstasyonIcon)}
            alt={location.type}
            className="w-8 h-8"
            style={{ 
              transform: 'translate(-50%, -100%)',
              filter: 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.2))'
            }}
          />
        ) : (
          <div 
            className={`w-3.5 h-3.5 rounded-full ${getMarkerColor(location.type)} shadow-md`}
            style={{ transform: 'translate(-50%, -50%)' }}
          />
        )}
      </Marker>
    );
  }, [onMarkerClick]);

  const getMarkerColor = (type: string) => {
    const colors = {
      Park: 'bg-green-500',
      Cami: 'bg-purple-500',
      'Sağlık Tesisi': 'bg-red-500',
      Okul: 'bg-blue-500',
      'Tatlı Su Çeşmesi': 'bg-cyan-500',
      Eczane: 'bg-orange-500',
      'Toplanma Alanı': 'bg-yellow-500',
      'Bisiklet Park Alanı': 'bg-yellow-400',
      'Paylaşımlı Bisiklet İstasyonu': 'bg-green-700',
      'Otopark': 'bg-blue-600',
      'Hava Ölçüm İstasyonu': 'bg-pink-500',
      'Kamera': 'bg-indigo-500',
      'Tarihi/Turistik Yerler': 'bg-fuchsia-600'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const extractLocation = (feature: any, type: Location['type']): Location => {
    let name = '';
    let occupiedSpaces: number | undefined;
    
    // Veri setine göre isim alanını belirle
    if (type === 'Eczane') {
      name = feature.properties.ADI;
    } else if (type === 'Okul' || type === 'Sağlık Tesisi' || type === 'Bisiklet Park Alanı' || type === 'Cami') {
      name = feature.properties.NITELIK_AD;
    } else if (type === 'Toplanma Alanı') {
      name = feature.properties.ADI;
    } else if (type === 'Otopark') {
      name = feature.properties.name;
      occupiedSpaces = feature.properties.occupiedSpaces;
    } else if (type === 'Park') {
      name = `${feature.properties.ILCEADI} - ${feature.properties.UST_NITELIK_ADI}`;
    } else if (type === 'Paylaşımlı Bisiklet İstasyonu') {
      name = feature.properties.NITELIK_AD;
    } else if (type === 'Tatlı Su Çeşmesi') {
      name = feature.properties.ACIKLAMA;
    } else if (type === 'Hava Ölçüm İstasyonu' || type === 'Kamera') {
      name = feature.properties.NITELIK_AD;
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
                    className={`${type === 'Otopark' ? '' : getMarkerColor(type)} rounded-full flex items-center justify-center text-white font-medium shadow-md`}
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      transform: 'translate(-50%, -50%)',
                      fontSize: `${Math.max(13, size/2.5)}px`,
                      backgroundColor: type === 'Otopark' ? '#004aad' : undefined
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