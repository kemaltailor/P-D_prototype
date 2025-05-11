import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Map, NavigationControl, MapRef, Source, Layer, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Markers from './components/Markers';
import * as turf from '@turf/turf';
import LocationPopup from './components/LocationPopup';
import { Location } from './types/Location';

interface ViewState {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
  padding: { top: number; bottom: number; left: number; right: number };
}

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || '';

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

// Polygon'un merkez noktasını hesapla
const calculatePolygonCenter = (coordinates: number[][][]): [number, number] => {
  const points = coordinates[0]; // İlk ring'i al (dış sınır)
  let sumLat = 0;
  let sumLon = 0;
  
  points.forEach(point => {
    sumLon += point[0];
    sumLat += point[1];
  });

  return [sumLon / points.length, sumLat / points.length];
};

const App: React.FC = () => {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState<ViewState>({
    latitude: 37.8716,
    longitude: 32.4847,
    zoom: 12,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 }
  });

  const [bounds, setBounds] = useState<[number, number, number, number]>([32.3844, 37.7719, 32.5844, 37.9719]);
  const [locations, setLocations] = useState<Location[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isClusterMode, setIsClusterMode] = useState(false);

  const [filters, setFilters] = useState({
    'Park': false,
    'Cami': false,
    'Sağlık Tesisi': false,
    'Okul': false,
    'Tatlı Su Çeşmesi': false,
    'Eczane': false,
    'Toplanma Alanı': false,
    'Bisiklet Park Alanı': true,
    'Paylaşımlı Bisiklet İstasyonu': true,
    'Otopark': true,
    'Hava Ölçüm İstasyonu': false,
    'Kamera': false,
    'Tarihi/Turistik Yerler': true
  });

  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState<[number, number] | null>(null);
  const [previewCircle, setPreviewCircle] = useState<any>(null);
  const [circleData, setCircleData] = useState<any>(null);
  const [hoverInfo, setHoverInfo] = useState<{longitude: number; latitude: number} | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const [parkingOccupancies, setParkingOccupancies] = useState<Record<number, number>>({});

  // Bounds'u güncelle
  const updateBounds = useCallback(() => {
    if (mapRef.current) {
      const bounds = mapRef.current.getBounds();
      setBounds([
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ]);
    }
  }, []);

  // Harita yüklendiğinde bounds'u ayarla
  useEffect(() => {
    updateBounds();
  }, [updateBounds]);

  useEffect(() => {
    const loadGeoJSONData = async () => {
      setIsLoading(true);
      try {
        const allLocations: Location[] = [];
        const API_BASE_URL = 'http://localhost:5259/api/location';
        
        console.log('Veri yükleme başladı');
        
        // Bisiklet park alanları verilerini yükle
        const bisikletParkResponse = await fetch(`${API_BASE_URL}/bisiklet-park`);
        const bisikletParkData = await bisikletParkResponse.json();
        const bisikletParkLocations = bisikletParkData.features.map((f: any) => extractLocation(f, 'Bisiklet Park Alanı'));
        allLocations.push(...bisikletParkLocations);

        // Paylaşımlı bisiklet istasyonları verilerini yükle
        const paylasimliBisikletResponse = await fetch(`${API_BASE_URL}/kiralik-bisiklet`);
        const paylasimliBisikletData = await paylasimliBisikletResponse.json();
        const paylasimliBisikletLocations = paylasimliBisikletData.features.map((f: any) => extractLocation(f, 'Paylaşımlı Bisiklet İstasyonu'));
        allLocations.push(...paylasimliBisikletLocations);

        // Otopark verilerini yükle
        const otoparkResponse = await fetch(`${API_BASE_URL}/otoparklar`);
        const otoparkData = await otoparkResponse.json();
        const otoparkLocations = otoparkData.features.map((f: any) => extractLocation(f, 'Otopark'));
        allLocations.push(...otoparkLocations);

        // Diğer verileri yükle
        const camiResponse = await fetch(`${API_BASE_URL}/camiler`);
        const camiData = await camiResponse.json();
        const camiLocations = camiData.features.map((f: any) => extractLocation(f, 'Cami'));
        allLocations.push(...camiLocations);

        const okulResponse = await fetch(`${API_BASE_URL}/okullar`);
        const okulData = await okulResponse.json();
        const okulLocations = okulData.features.map((f: any) => extractLocation(f, 'Okul'));
        allLocations.push(...okulLocations);

        const saglikResponse = await fetch(`${API_BASE_URL}/saglik-tesisleri`);
        const saglikData = await saglikResponse.json();
        const saglikLocations = saglikData.features.map((f: any) => extractLocation(f, 'Sağlık Tesisi'));
        allLocations.push(...saglikLocations);

        const toplanmaResponse = await fetch(`${API_BASE_URL}/toplanma-alanlari`);
        const toplanmaData = await toplanmaResponse.json();
        const toplanmaLocations = toplanmaData.features.map((f: any) => extractLocation(f, 'Toplanma Alanı'));
        allLocations.push(...toplanmaLocations);

        const parkResponse = await fetch(`${API_BASE_URL}/parklar`);
        const parkData = await parkResponse.json();
        const parkLocations = parkData.features.map((f: any) => extractLocation(f, 'Park'));
        allLocations.push(...parkLocations);

        const cesmeResponse = await fetch(`${API_BASE_URL}/tatli-su-cesmeleri`);
        const cesmeData = await cesmeResponse.json();
        const cesmeLocations = cesmeData.features.map((f: any) => extractLocation(f, 'Tatlı Su Çeşmesi'));
        allLocations.push(...cesmeLocations);

        const eczaneResponse = await fetch(`${API_BASE_URL}/eczaneler`);
        const eczaneData = await eczaneResponse.json();
        const eczaneLocations = eczaneData.features.map((f: any) => extractLocation(f, 'Eczane'));
        allLocations.push(...eczaneLocations);

        const havaIstasyonResponse = await fetch(`${API_BASE_URL}/hava-kalite-istasyonlari`);
        const havaIstasyonData = await havaIstasyonResponse.json();
        const havaIstasyonLocations = havaIstasyonData.features.map((f: any) => extractLocation(f, 'Hava Ölçüm İstasyonu'));
        allLocations.push(...havaIstasyonLocations);

        const kameraResponse = await fetch(`${API_BASE_URL}/kameralar`);
        const kameraData = await kameraResponse.json();
        const kameraLocations = kameraData.features.map((f: any) => extractLocation(f, 'Kamera'));
        allLocations.push(...kameraLocations);

        // Turistik konumlar verilerini yükle
        const turistikKonumlarResponse = await fetch(`${API_BASE_URL}/turistik-konumlar`);
        const turistikKonumlarData = await turistikKonumlarResponse.json();
        const turistikKonumlarLocations = turistikKonumlarData.features.map((f: any) => extractLocation(f, 'Tarihi/Turistik Yerler'));
        allLocations.push(...turistikKonumlarLocations);

        console.log('Toplam konum sayısı:', allLocations.length);
        console.log('Örnek konum:', allLocations[0]);
        
        setLocations(allLocations);
        setTimeout(() => {
          setIsLoading(false);
          console.log('Veri yükleme tamamlandı:', { locationCount: allLocations.length });
        }, 100);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        setIsLoading(false);
      }
    };

    loadGeoJSONData();
  }, []);

  useEffect(() => {
    if (locations.length > 0 && Object.keys(parkingOccupancies).length === 0) {
      const newOccupancies: Record<number, number> = {};
      locations.forEach(location => {
        if (location.type === 'Otopark') {
          newOccupancies[location.id] = Math.floor(Math.random() * 20) * 5;
        }
      });
      setParkingOccupancies(newOccupancies);
    }
  }, [locations, parkingOccupancies]);

  // Debug için render durumunu kontrol et
  useEffect(() => {
    console.log('Render durumu:', { isLoading, locationCount: locations.length });
  }, [isLoading, locations]);

  const onMove = useCallback((evt: { viewState: ViewState }) => {
    setViewState(evt.viewState);
    updateBounds();
  }, [updateBounds]);

  const toggleFilter = (type: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: !prev[type as keyof typeof prev]
    }));
  };

  // Ctrl+Shift ile veya butona tekrar tıklayarak çizim modundan çıkma
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && isDrawing) {
        exitDrawMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawing]);

  // Kümeleme modu değişikliğini izle
  useEffect(() => {
    if (viewState.zoom < 14 && !isClusterMode) {
      setIsClusterMode(true);
    }
  }, [viewState.zoom, isClusterMode]);

  const exitDrawMode = () => {
    setIsDrawing(false);
    setStartPoint(null);
    setPreviewCircle(null);
    setIsDragging(false);
  };

  const handleMouseDown = useCallback((event: any) => {
    if (!isDrawing) return;

    event.preventDefault();
    const { lngLat } = event;
    setStartPoint([lngLat.lng, lngLat.lat]);
    setIsDragging(true);
  }, [isDrawing]);

  const handleMouseMove = useCallback((event: any) => {
    if (!isDrawing || !isDragging || !startPoint) return;

    const { lngLat } = event;
    const endPoint: [number, number] = [lngLat.lng, lngLat.lat];
    
    // Başlangıç ve bitiş noktalarını çemberin üst ve alt noktaları olarak ayarla
    const distance = turf.distance(startPoint, endPoint, { units: 'kilometers' }) / 2;
    const bearing = turf.bearing(startPoint, endPoint);
    const center = turf.destination(startPoint, distance, bearing, { units: 'kilometers' });
    
    const circle = turf.circle(center.geometry.coordinates, distance, {
      steps: 64,
      units: 'kilometers',
    });

    setPreviewCircle(circle);
  }, [isDrawing, isDragging, startPoint]);

  const handleMouseUp = useCallback((event: any) => {
    if (!isDrawing || !isDragging || !startPoint) return;

    const { lngLat } = event;
    const endPoint: [number, number] = [lngLat.lng, lngLat.lat];
    
    // Başlangıç ve bitiş noktalarını çemberin üst ve alt noktaları olarak ayarla
    const distance = turf.distance(startPoint, endPoint, { units: 'kilometers' }) / 2;
    const bearing = turf.bearing(startPoint, endPoint);
    const center = turf.destination(startPoint, distance, bearing, { units: 'kilometers' });
    
    const circle = turf.circle(center.geometry.coordinates, distance, {
      steps: 64,
      units: 'kilometers',
    });

    setCircleData(circle);
    exitDrawMode();
  }, [isDrawing, isDragging, startPoint]);

  const handleHover = useCallback((event: any) => {
    if (!circleData) return;

    const point = [event.lngLat.lng, event.lngLat.lat];
    const isInside = turf.booleanPointInPolygon(point, circleData);
    
    if (isInside) {
      setHoverInfo({ longitude: event.lngLat.lng, latitude: event.lngLat.lat });
    } else {
      setHoverInfo(null);
    }
  }, [circleData]);

  // GeoJSON feature'dan konum bilgisi çıkar
  const extractLocation = (feature: any, type: Location['type']): Location => {
    let name = '';
    let occupiedSpaces: number | undefined;
    
    // Veri setine göre isim alanını belirle
    if (type === 'Eczane') {
      name = feature.properties.ADI || 'İsimsiz Eczane';
    } else if (type === 'Okul' || type === 'Sağlık Tesisi' || type === 'Bisiklet Park Alanı' || type === 'Cami') {
      name = feature.properties.NITELIK_AD || feature.properties.niteliK_AD || 'İsimsiz Tesis';
    } else if (type === 'Toplanma Alanı') {
      name = feature.properties.ADI || 'İsimsiz Toplanma Alanı';
    } else if (type === 'Otopark') {
      name = feature.properties.name || 'İsimsiz Otopark';
    } else if (type === 'Park') {
      name = `${feature.properties.ILCEADI || 'Bilinmeyen İlçe'} - ${feature.properties.UST_NITELIK_ADI || 'İsimsiz Park'}`;
    } else if (type === 'Paylaşımlı Bisiklet İstasyonu') {
      name = feature.properties.NITELIK_AD || feature.properties.niteliK_AD || 'İsimsiz İstasyon';
    } else if (type === 'Tatlı Su Çeşmesi') {
      name = feature.properties.ACIKLAMA || 'İsimsiz Çeşme';
    } else if (type === 'Hava Ölçüm İstasyonu' || type === 'Kamera') {
      name = feature.properties.NITELIK_AD || feature.properties.niteliK_AD || 'İsimsiz İstasyon';
      if (type === 'Kamera') {
        return {
          id: Math.random(),
          type,
          longitude: feature.geometry.coordinates[0],
          latitude: feature.geometry.coordinates[1],
          name,
          cameraUrl: feature.properties.url || ''
        };
      }
    } else if (type === 'Tarihi/Turistik Yerler') {
      return {
        id: Math.random(),
        type,
        longitude: feature.geometry.coordinates[0],
        latitude: feature.geometry.coordinates[1],
        name: feature.properties.isim || 'İsimsiz',
        turistikTur: feature.properties.tur,
        aciklama: feature.properties.icerik,
        resim: feature.properties.resim
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

  // Filtrelenmiş lokasyonları hesapla
  const filteredLocations = useMemo(() => {
    return locations.filter(location => filters[location.type]);
  }, [locations, filters]);

  return (
    <div className="h-screen flex">
      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg max-h-[calc(100vh-32px)] overflow-y-auto z-10">
        <h2 className="text-lg font-semibold mb-4">Konum Türleri</h2>
        {LOCATION_TYPES.map(type => (
          <label key={type} className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={filters[type as keyof typeof filters]}
              onChange={() => toggleFilter(type)}
              className="mr-2"
            />
            {type}
          </label>
        ))}
        {!isLoading && locations.length > 0 && (
          <div className={`mt-4 pt-4 border-t transition-all duration-300 ${viewState.zoom < 14 ? 'opacity-50 pointer-events-none filter blur-[1px]' : ''}`}>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium">Kümeleme Modu</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isClusterMode}
                  onChange={e => setIsClusterMode(e.target.checked)}
                  className="sr-only peer"
                  disabled={viewState.zoom < 14}
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Çember Çiz Butonu */}
      <button
        onClick={() => {
          if (isDrawing) {
            exitDrawMode();
          } else {
            setIsDrawing(true);
            setCircleData(null);
          }
        }}
        className={`absolute top-4 left-16 z-10 p-2 rounded-lg shadow-lg transition-colors ${
          isDrawing ? 'bg-red-500 text-white' : 'bg-white text-gray-800'
        }`}
        title={isDrawing ? 'Çizimi İptal Et (Ctrl+Shift)' : 'Çeper Çiz'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <Map
        ref={mapRef}
        {...viewState}
        onMove={onMove}
        onMouseDown={handleMouseDown}
        onMouseMove={(e) => {
          handleMouseMove(e);
          handleHover(e);
        }}
        onMouseUp={handleMouseUp}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        cursor={isDrawing ? 'crosshair' : 'auto'}
        dragPan={!isDragging}
        dragRotate={!isDragging}
        scrollZoom={!isDrawing}
        doubleClickZoom={false}
        touchZoomRotate={!isDrawing}
        interactiveLayerIds={isDrawing ? [] : undefined}
        onClick={() => setSelectedLocation(null)}
      >
        <NavigationControl position="top-left" />
        <Markers
          locations={filteredLocations}
          filters={filters}
          bounds={bounds}
          zoom={viewState.zoom}
          isClusterMode={isClusterMode}
          onMarkerClick={setSelectedLocation}
          mapRef={mapRef}
        />
        {(previewCircle || circleData) && (
          <Source id="circle-source" type="geojson" data={previewCircle || circleData}>
            <Layer
              id="circle-fill"
              type="fill"
              paint={{
                'fill-color': '#007cbf',
                'fill-opacity': 0.3,
              }}
            />
            <Layer
              id="circle-outline"
              type="line"
              paint={{
                'line-color': '#007cbf',
                'line-width': 2,
              }}
            />
          </Source>
        )}
        {selectedLocation && (
          <LocationPopup
            location={selectedLocation}
            onClose={() => setSelectedLocation(null)}
            parkingOccupancies={parkingOccupancies}
          />
        )}
      </Map>
    </div>
  );
};

export default App;
