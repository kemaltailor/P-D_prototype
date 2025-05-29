import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Map, NavigationControl, MapRef, Source, Layer, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Markers from './components/Markers';
import * as turf from '@turf/turf';
import LocationPopup from './components/LocationPopup';
import { Location } from './types/Location';
import { Pie } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import KonumEkle from './pages/KonumEkle';
import logo from './logo/logo.svg';
import bisikletParkIcon from './icons/bisiklet-park-alani.png';
import camiIcon from './icons/cami.png';
import eczaneIcon from './icons/eczane.png';
import havaOlcumIcon from './icons/hava-olcum-istasyonu.png';
import kameraIcon from './icons/kamera.png';
import okulIcon from './icons/okul.png';
import otoparkIcon from './icons/otopark.png';
import parkIcon from './icons/park.png';
import paylasimliBisikletIcon from './icons/paylasimli-bisiklet-istasyonu.png';
import saglikTesisiIcon from './icons/saglik-tesisi.png';
import tarihiTuristikIcon from './icons/tarihi-turistik-yerler.png';
import tatliSuCesmesiIcon from './icons/tatli-su-cesmesi.png';
import toplanmaAlaniIcon from './icons/toplanma-alani.png';
import clusterPointModeIcon from './icons/cluster-point-mode.png';
import HatGuzergahPage from './pages/HatGuzergahPage';
import Select from 'react-select';
ChartJS.register(ArcElement, Tooltip, Legend);

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

const MARKER_COLORS: Record<string, string> = {
  'Park': '#22c55e',
  'Cami': '#a21caf',
  'Sağlık Tesisi': '#ef4444',
  'Okul': '#3b82f6',
  'Tatlı Su Çeşmesi': '#06b6d4',
  'Eczane': '#f59e42',
  'Toplanma Alanı': '#eab308',
  'Bisiklet Park Alanı': '#fde047',
  'Paylaşımlı Bisiklet İstasyonu': '#15803d',
  'Otopark': '#2563eb',
  'Hava Ölçüm İstasyonu': '#ec4899',
  'Kamera': '#6366f1',
  'Tarihi/Turistik Yerler': '#a21caf'
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

// Buton ikon boyutları
const CLUSTER_MODE_ICON_SIZE = 'h-8 w-8'; // Cluster/point mode butonu için
const FILTER_ICON_SIZES: Record<string, string> = {
  'Park': 'w-12 h-12',
  'Cami': 'w-11 h-11',
  'Sağlık Tesisi': 'w-10 h-12',
  'Okul': 'w-12 h-12',
  'Tatlı Su Çeşmesi': 'w-10 h-10',
  'Eczane': 'w-8 h-8',
  'Toplanma Alanı': 'w-18 h-18',
  'Bisiklet Park Alanı': 'w-30 h-30',
  'Paylaşımlı Bisiklet İstasyonu': 'w-20 h-20',
  'Otopark': 'w-19 h-19',
  'Hava Ölçüm İstasyonu': 'w-19 h-19',
  'Kamera': 'w-18 h-18',
  'Tarihi/Turistik Yerler': 'w-18 h-18'
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [filters, setFilters] = useState({
    'Park': true,
    'Cami': false,
    'Sağlık Tesisi': true,
    'Okul': false,
    'Tatlı Su Çeşmesi': true,
    'Eczane': false,
    'Toplanma Alanı': false,
    'Bisiklet Park Alanı': false,
    'Paylaşımlı Bisiklet İstasyonu': false,
    'Otopark': true,
    'Hava Ölçüm İstasyonu': false,
    'Kamera': false,
    'Tarihi/Turistik Yerler': false
  });

  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState<[number, number] | null>(null);
  const [previewCircle, setPreviewCircle] = useState<any>(null);
  const [circleData, setCircleData] = useState<any>(null);
  const [hoverInfo, setHoverInfo] = useState<{longitude: number; latitude: number} | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const [parkingOccupancies, setParkingOccupancies] = useState<Record<number, number>>({});

  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(400);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Çeperdeki konumları ve tür sayılarını hesapla
  const getCircleStats = () => {
    if (!circleData) return { total: 0, typeCounts: {}, inside: [] };
    // SADECE filtrede aktif olan türleri al
    const filtered = locations.filter(loc => filters[loc.type]);
    const inside = filtered.filter(loc =>
      turf.booleanPointInPolygon([loc.longitude, loc.latitude], circleData)
    );
    const typeCounts: Record<string, number> = {};
    inside.forEach(loc => {
      typeCounts[loc.type] = (typeCounts[loc.type] || 0) + 1;
    });
    return { total: inside.length, typeCounts, inside };
  };
  const circleStats = getCircleStats();

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
    } else if (type === 'Tarihi/Turistik Yerler') {
      return {
        id: Math.random(),
        type,
        longitude: feature.geometry.coordinates[0],
        latitude: feature.geometry.coordinates[1],
        name: feature.properties.isim || '',
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

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
  };

  const handleMarkerClick = (location: Location) => {
    setSelectedLocation(location);
  };

  const getChartData = () => {
    const chartColors = {
      'Park': '#4CAF50',
      'Cami': '#9C27B0',
      'Sağlık Tesisi': '#F44336',
      'Okul': '#2196F3',
      'Tatlı Su Çeşmesi': '#00BCD4',
      'Eczane': '#FF9800',
      'Toplanma Alanı': '#FFEB3B',
      'Bisiklet Park Alanı': '#FFC107',
      'Paylaşımlı Bisiklet İstasyonu': '#795548',
      'Otopark': '#3F51B5',
      'Hava Ölçüm İstasyonu': '#E91E63',
      'Kamera': '#673AB7',
      'Tarihi/Turistik Yerler': '#FF5722'
    };

    return {
      labels: Object.keys(circleStats.typeCounts),
      datasets: [{
        data: Object.values(circleStats.typeCounts),
        backgroundColor: Object.keys(circleStats.typeCounts).map(type => chartColors[type as keyof typeof chartColors] || '#9E9E9E'),
        borderColor: Object.keys(circleStats.typeCounts).map(type => chartColors[type as keyof typeof chartColors] || '#9E9E9E'),
        borderWidth: 1
      }]
    };
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="relative w-full h-screen">
      {/* Harita yüklenirken ortada logo */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <img src={logo} alt="Logo" className="w-64 h-auto animate-pulse" />
        </div>
      )}
      {/* Sağ üstte logo ve yan yana butonlar */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end">
        <div className="flex flex-row items-center gap-3">
          {/* 3 buton: çeper çiz, point/cluster mode, giriş/çıkış */}
          <div className="flex flex-row gap-2">
            {/* Çeper Çiz Butonu */}
            <button
              onClick={() => {
                if (isDrawing) {
                  exitDrawMode();
                } else {
                  setIsDrawing(true);
                  setCircleData(null);
                }
              }}
              className={`p-2 rounded-lg shadow-lg transition-colors ${
                isDrawing ? 'bg-red-500 text-white' : 'bg-white text-gray-800'
              }`}
              title={isDrawing ? 'Çizimi İptal Et (Ctrl+Shift)' : 'Çeper Çiz'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            {/* Point View Mode Butonu */}
            <button
              onClick={() => setIsClusterMode(!isClusterMode)}
              disabled={viewState.zoom < 14}
              className={`p-2 rounded-lg shadow-lg transition-colors ${
                isClusterMode ? 'bg-red-500 text-white' : 'bg-white text-gray-800'
              } ${viewState.zoom < 14 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
              title={viewState.zoom < 14 ? 'Point View Mode için zoom seviyesi yetersiz' : (isClusterMode ? 'Point View Mode\'u Kapat' : 'Point View Mode\'u Aç')}
            >
              <img src={clusterPointModeIcon} alt="Point View Mode" className={CLUSTER_MODE_ICON_SIZE} />
            </button>

            {/* Login/Logout Butonu */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg shadow-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                title="Çıkış Yap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => window.location.href = '/admin/login'}
                className="p-2 rounded-lg shadow-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                title="Giriş Yap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
          {/* Logo */}
          <img src={logo} alt="Logo" className="w-28 h-auto ml-4 drop-shadow" />
        </div>
        {/* Filtreleme Dropdown Butonu ve İçeriği */}
        <button
          className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow border border-gray-300 hover:border-red-500 transition mt-2"
          onClick={() => setDropdownOpen(v => !v)}
          style={{ outline: 'none' }}
          aria-label="Filtreleri Aç/Kapat"
        >
          {/* Aşağı/yukarı yön oku (tabanı olmayan üçgen) */}
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline points={dropdownOpen ? '7,18 14,10 21,18' : '7,10 14,18 21,10'} fill="none" stroke="#e11d48" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {dropdownOpen && (
          <div className="flex flex-col gap-2 mt-1 p-1 bg-white/80 rounded-xl shadow-lg">
            {LOCATION_TYPES.map(type => (
              <button
                key={type}
                onClick={() => toggleFilter(type)}
                className={`w-14 h-14 flex items-center justify-center rounded-lg border-2 transition-all
                  ${filters[type] ? 'border-red-500 bg-gray-100' : 'border-transparent bg-white'}
                  hover:border-red-500
                  ${filters[type] ? 'brightness-95' : 'hover:brightness-90'}
                  active:brightness-75
                  `}
                style={{ cursor: 'pointer' }}
              >
                <img src={ICONS[type]} alt={type} className={FILTER_ICON_SIZES[type]} />
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Harita */}
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
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
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
          isClusterMode={isClusterMode}
          onMarkerClick={handleMarkerClick}
          parkingOccupancies={parkingOccupancies}
          filters={filters}
          bounds={bounds}
          zoom={viewState.zoom}
          mapRef={mapRef}
        />
        {selectedLocation && (
          <LocationPopup
            location={selectedLocation}
            onClose={() => setSelectedLocation(null)}
            parkingOccupancies={parkingOccupancies}
          />
        )}
        {/* Çeper çizimi için kaynak ve katman */}
        {previewCircle && (
          <Source type="geojson" data={previewCircle}>
            <Layer
              type="fill"
              paint={{
                'fill-color': '#007cbf',
                'fill-opacity': 0.2,
                'fill-outline-color': '#007cbf'
              }}
            />
          </Source>
        )}
        {circleData && (
          <Source type="geojson" data={circleData}>
            <Layer
              type="fill"
              paint={{
                'fill-color': '#007cbf',
                'fill-opacity': 0.2,
                'fill-outline-color': '#007cbf'
              }}
            />
          </Source>
        )}
        {(circleData && hoverInfo) && (
          <Popup
            longitude={hoverInfo.longitude}
            latitude={hoverInfo.latitude}
            anchor="top"
            closeButton={false}
            closeOnClick={false}
            offset={[0, -10] as [number, number]}
            style={{ zIndex: 20 }}
          >
            <div className="bg-white rounded-lg shadow-lg p-4 min-w-[220px] max-w-xs flex flex-col items-center">
              <Pie
                data={getChartData()}
                options={{ plugins: { legend: { display: true, position: 'bottom' } } }}
                width={180}
                height={180}
              />
              <div className="mt-2 text-center text-sm font-medium">
                Toplam: {circleStats.total} konum
              </div>
              <button
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={() => setIsDetailPanelOpen(true)}
              >
                Ayrıntılı Gör
              </button>
            </div>
          </Popup>
        )}
      </Map>
      {/* Sağda açılan panel */}
      {isDetailPanelOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            height: '100vh',
            width: panelWidth,
            background: '#fff',
            zIndex: 50,
            boxShadow: '-2px 0 8px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid #eee'
          }}
        >
          {/* Sürüklenebilir orta çizgi */}
          <div
            style={{
              position: 'absolute',
              left: -6,
              top: 0,
              width: 12,
              height: '100%',
              cursor: 'ew-resize',
              zIndex: 100
            }}
            onMouseDown={e => {
              const startX = e.clientX;
              const startWidth = panelWidth;
              const onMove = (ev: MouseEvent) => {
                setPanelWidth(Math.max(300, startWidth - (ev.clientX - startX)));
              };
              const onUp = () => {
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
              };
              window.addEventListener('mousemove', onMove);
              window.addEventListener('mouseup', onUp);
            }}
          >
            <div style={{ width: 12, height: '100%', background: 'transparent' }} />
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="flex flex-col items-center">
              <Pie
                data={getChartData()}
                options={{ plugins: { legend: { display: true, position: 'bottom' } } }}
                width={220}
                height={220}
              />
              <div className="mt-4 w-full">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left">&nbsp;</th>
                      <th className="text-left">Konum Türü</th>
                      <th className="text-right">Adet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(circleStats.typeCounts).map(([type, count]) => (
                      <tr key={type}>
                        <td>
                          <span style={{
                            display: 'inline-block',
                            width: 16,
                            height: 16,
                            borderRadius: 8,
                            background: MARKER_COLORS[type] || '#888',
                            marginRight: 8
                          }} />
                        </td>
                        <td>{type}</td>
                        <td className="text-right font-semibold">{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <button
              className="mt-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
              onClick={() => setIsDetailPanelOpen(false)}
            >
              Kapat
            </button>
          </div>
        </div>
      )}
      <div className="absolute top-4 left-20 z-[1000] bg-white p-2 rounded-lg shadow-lg">
        <Select
          options={[
            { value: '/', label: 'Ana Sayfa' },
            { value: '/hat-guzergah', label: 'Otobüs Hat Güzergahları' }
          ]}
          onChange={(option) => navigate(option?.value || '/')}
          placeholder="Sayfa seçiniz..."
          isClearable={false}
          isSearchable={false}
          className="w-64"
          defaultValue={{ value: '/', label: 'Ana Sayfa' }}
        />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin onLoginSuccess={() => setIsLoggedIn(true)} />} />
        <Route path="/admin/konum-ekle" element={<KonumEkle />} />
        <Route path="/hat-guzergah" element={<HatGuzergahPage />} />
        <Route path="/" element={<AppContent />} />
      </Routes>
    </Router>
  );
};

export default App;
