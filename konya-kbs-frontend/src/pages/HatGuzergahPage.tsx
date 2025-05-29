import React, { useState, useEffect } from 'react';
import { Map, Marker, Popup, Source, Layer, NavigationControl } from 'react-map-gl';
import Select from 'react-select';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Feature, LineString } from 'geojson';
import logo from '../logo/logo.svg';

interface HatGuzergah {
    id: number;
    hatNo: number;
    geometry: {
        type: string;
        coordinates: [number, number];
    };
}

const HatGuzergahPage: React.FC = () => {
    const [hatlar, setHatlar] = useState<{ value: number; label: string }[]>([]);
    const [secilenHat, setSecilenHat] = useState<number | null>(null);
    const [guzergah, setGuzergah] = useState<HatGuzergah[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPoint, setSelectedPoint] = useState<HatGuzergah | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        // Hat numaralarını getir
        fetch('http://localhost:5259/api/HatGuzergah/hatlar')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Hat numaraları alınamadı');
                }
                return response.json();
            })
            .then(data => {
                const hatOptions = data.map((hatNo: number) => ({
                    value: hatNo,
                    label: `${hatNo}`
                }));
                setHatlar(hatOptions);
                setLoading(false);
            })
            .catch(error => {
                console.error('Hata:', error);
                setError('Hat numaraları yüklenirken bir hata oluştu');
                setLoading(false);
            });
    }, []);

    const handleHatChange = (selectedOption: any) => {
        if (selectedOption) {
            setSecilenHat(selectedOption.value);
            setLoading(true);
            setError(null);
            
            // Seçilen hattın güzergahını getir
            fetch(`http://localhost:5259/api/HatGuzergah/guzergah/${selectedOption.value}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Güzergah bilgileri alınamadı');
                    }
                    return response.json();
                })
                .then(data => {
                    setGuzergah(data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Hata:', error);
                    setError('Güzergah bilgileri yüklenirken bir hata oluştu');
                    setLoading(false);
                });
        } else {
            setSecilenHat(null);
            setGuzergah([]);
        }
    };

    // Güzergah çizgisi için GeoJSON oluştur
    const routeLine: Feature<LineString> = {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: guzergah.map(point => point.geometry.coordinates)
        }
    };

    return (
        <div className="relative w-full h-screen">
            {/* Sağ üstte logo ve admin login butonu */}
            <div className="absolute top-4 right-4 z-20 flex flex-col items-end">
                <div className="flex flex-row items-center gap-3">
                    <div className="flex flex-row gap-2">
                        {/* Login Butonu */}
                        <button
                            onClick={() => window.location.href = '/admin/login'}
                            className="p-2 rounded-lg shadow-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                            title="Giriş Yap"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                    {/* Logo */}
                    <img src={logo} alt="Logo" className="w-28 h-auto ml-4 drop-shadow" />
                </div>
            </div>

            {/* Sol üstte dropdown'lar */}
            <div className="absolute top-4 left-20 z-[1000] flex flex-col gap-2">
                <Select
                    options={[
                        { value: '/', label: 'Ana Sayfa' },
                        { value: '/hat-guzergah', label: 'Otobüs Hat Güzergahları' }
                    ]}
                    onChange={(option) => window.location.href = option?.value || '/'}
                    placeholder="Sayfa seçiniz..."
                    isClearable={false}
                    isSearchable={false}
                    className="w-64"
                    defaultValue={{ value: '/hat-guzergah', label: 'Otobüs Hat Güzergahları' }}
                />
                <Select
                    options={hatlar}
                    onChange={handleHatChange}
                    placeholder="Hat seçiniz..."
                    isClearable
                    isSearchable
                    className="w-64"
                    isLoading={loading}
                />
                {error && (
                    <div className="text-red-600 text-sm">
                        {error}
                    </div>
                )}
            </div>
            
            <Map
                initialViewState={{
                    longitude: 32.4846,
                    latitude: 37.8716,
                    zoom: 13
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/streets-v11"
                mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
            >
                <NavigationControl position="top-left" />
                {/* Güzergah çizgisi */}
                {guzergah.length > 0 && (
                    <Source type="geojson" data={routeLine}>
                        <Layer
                            id="route-line"
                            type="line"
                            paint={{
                                'line-color': '#007cbf',
                                'line-width': 3,
                                'line-opacity': 0.8
                            }}
                        />
                    </Source>
                )}
                
                {/* Duraklar */}
                {guzergah.map((point) => (
                    <Marker
                        key={point.id}
                        longitude={point.geometry.coordinates[0]}
                        latitude={point.geometry.coordinates[1]}
                        onClick={() => setSelectedPoint(point)}
                    >
                        <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
                    </Marker>
                ))}

                {/* Seçili durak popup'ı */}
                {selectedPoint && (
                    <Popup
                        longitude={selectedPoint.geometry.coordinates[0]}
                        latitude={selectedPoint.geometry.coordinates[1]}
                        anchor="bottom"
                        onClose={() => setSelectedPoint(null)}
                        closeButton={true}
                        closeOnClick={false}
                    >
                        <div className="p-2">
                            <p className="font-bold">Hat No: {selectedPoint.hatNo}</p>
                            <p>Durak Sırası: {guzergah.findIndex(p => p.id === selectedPoint.id) + 1}</p>
                        </div>
                    </Popup>
                )}
            </Map>

            {/* Loading göstergesi */}
            {loading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-700">Yükleniyor...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HatGuzergahPage; 