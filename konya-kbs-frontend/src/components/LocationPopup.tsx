import React, { useState, useEffect } from 'react';
import { Popup } from 'react-map-gl';
import { Location } from '../types/Location';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Bar } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

dayjs.locale('tr');

interface LocationPopupProps {
  location: Location;
  onClose: () => void;
  parkingOccupancies?: Record<number, number>;
}

interface AirQualityData {
  pm10: number;
  no2: number;
  nox: number;
  no: number;
}

const popupClassNames = {
  default: '!min-w-[260px] !max-w-[90vw] !p-0 !bg-white !rounded-xl !shadow-2xl',
  camera: '!min-w-[420px] !max-w-[95vw] !p-0 !bg-white !rounded-xl !shadow-2xl',
  airQuality: '!min-w-[380px] !max-w-[95vw] !p-0 !bg-white !rounded-xl !shadow-2xl'
} as const;

const LocationPopup: React.FC<LocationPopupProps> = ({ location, onClose, parkingOccupancies }) => {
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [airQualityData, setAirQualityData] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (location.type === 'Hava Ölçüm İstasyonu' && selectedDate) {
      const fetchAirQualityData = async () => {
        if (!isMounted) return;
        
        setLoading(true);
        try {
          // İstasyon adına göre endpoint belirle
          let endpoint = '';
          switch (location.name) {
            case 'Bosna İstasyonu':
              endpoint = 'bosna';
              break;
            case 'Karatay İstasyonu':
              endpoint = 'karatay1';
              break;
            case 'Karatay 2 İstasyonu':
              endpoint = 'karatay2';
              break;
            case 'Karkent İstasyonu':
              endpoint = 'karkent';
              break;
            case 'Meram İstasyonu':
              endpoint = 'meram';
              break;
            case 'Sarayönü İstasyonu':
              endpoint = 'sarayonu';
              break;
            case 'Merkez Trafik İstasyonu':
              endpoint = 'trafik';
              break;
            default:
              throw new Error('Geçersiz istasyon adı');
          }

          const url = `http://localhost:5259/api/hava-kalite/${endpoint}`;
          console.log('İstek gönderiliyor:', {
            url,
            date: selectedDate.format('YYYY-MM-DD'),
            stationName: location.name
          });

          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              date: selectedDate.format('YYYY-MM-DD')
            }),
          });
          
          if (!isMounted) return;
          
          console.log('Sunucu yanıtı:', response.status, response.statusText);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Sunucu yanıtı (hata):', errorText);
            throw new Error(`Sunucu hatası: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log('Alınan veri:', data);
          setAirQualityData(data);
        } catch (error) {
          if (!isMounted) return;
          console.error('Veri alma hatası:', error);
          setAirQualityData(null);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };

      fetchAirQualityData();
    }

    return () => {
      isMounted = false;
    };
  }, [location, selectedDate]);

  const formatDate = (date: dayjs.Dayjs) => {
    return date.format('DD/MM/YYYY');
  };

  // Her konum türü için özel popup içeriği
  const renderPopupContent = () => {
    switch (location.type) {
      case 'Otopark':
        // Doluluk oranı veritabanından gelen location.occupiedSpaces üzerinden alınacak
        const doluluk = location.occupiedSpaces ?? 0;
        return (
          <div className="p-2 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800">{location.type}</h3>
            {location.name && (
              <p className="text-sm text-gray-600">{location.name}</p>
            )}
            <div className="mt-2">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Doluluk: {doluluk} / 100</span>
                <span>%{doluluk}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 border border-gray-300">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${doluluk}%` }}
                ></div>
              </div>
            </div>
          </div>
        );

      case 'Bisiklet Park Alanı':
        return (
          <div className="p-2 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800">{location.type}</h3>
            {location.name && (
              <p className="text-sm text-gray-600">{location.name}</p>
            )}
          </div>
        );

      case 'Paylaşımlı Bisiklet İstasyonu':
        return (
          <div className="p-2 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800">{location.type}</h3>
            {location.name && (
              <p className="text-sm text-gray-600">{location.name}</p>
            )}
          </div>
        );

      case 'Cami':
        return (
          <div className="p-2 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800">{location.type}</h3>
            {location.name && (
              <p className="text-sm text-gray-600">{location.name}</p>
            )}
          </div>
        );

      case 'Sağlık Tesisi':
        return (
          <div className="p-2 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800">{location.type}</h3>
            {location.name && (
              <p className="text-sm text-gray-600">{location.name}</p>
            )}
          </div>
        );

      case 'Okul':
        return (
          <div className="p-2 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800">{location.type}</h3>
            {location.name && (
              <p className="text-sm text-gray-600">{location.name}</p>
            )}
          </div>
        );

      case 'Park':
        return (
          <div className="p-2 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800">{location.type}</h3>
            {location.name && (
              <p className="text-sm text-gray-600">{location.name}</p>
            )}
          </div>
        );

      case 'Tatlı Su Çeşmesi':
        return (
          <div className="p-2 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800">{location.type}</h3>
            {location.name && (
              <p className="text-sm text-gray-600">{location.name}</p>
            )}
          </div>
        );

      case 'Eczane':
        return (
          <div className="p-2 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800">{location.type}</h3>
            {location.name && (
              <p className="text-sm text-gray-600">{location.name}</p>
            )}
          </div>
        );

      case 'Toplanma Alanı':
        return (
          <div className="p-2 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800">{location.type}</h3>
            {location.name && (
              <p className="text-sm text-gray-600">{location.name}</p>
            )}
          </div>
        );

      case 'Tarihi/Turistik Yerler':
        return (
          <div className="p-2 border border-gray-200 rounded-lg shadow-sm max-w-xs">
            <h3 className="font-semibold text-gray-800 mb-2">{location.turistikTur || 'Tarihi/Turistik Yer'}</h3>
            {location.resim && (
              <div className="w-full flex justify-center items-center mb-2">
                <img
                  src={location.resim}
                  alt={location.name}
                  className="object-contain max-h-48 w-full rounded-lg border"
                  style={{ maxWidth: '100%', maxHeight: '200px', display: 'block', margin: '0 auto' }}
                />
              </div>
            )}
            <div className="mb-1">
              <span className="font-semibold">{location.name}</span>
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-line">
              {location.aciklama}
            </div>
          </div>
        );

      case 'Hava Ölçüm İstasyonu': {
        const chartData: ChartData<'bar'> = {
          labels: ['PM10', 'NO2', 'NOX', 'NO'],
          datasets: [
            {
              label: 'Günlük Ortalama Değerler',
              data: airQualityData ? [
                airQualityData.pm10,
                airQualityData.no2,
                airQualityData.nox,
                airQualityData.no
              ] : [],
              backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)'
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)'
              ],
              borderWidth: 1
            }
          ]
        };

        const chartOptions: ChartOptions<'bar'> = {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                stepSize: 25
              }
            }
          },
          animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
          },
          plugins: {
            legend: {
              display: false
            }
          }
        };

        return (
          <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800">{location.type}</h3>
            <p className="text-sm text-gray-600 mb-4">{location.name}</p>
            
            <div className="mb-4">
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
                <DatePicker
                  label="Tarih Seç"
                  value={selectedDate}
                  onChange={(newDate) => setSelectedDate(newDate)}
                  format="DD/MM/YYYY"
                  maxDate={dayjs('2023-12-31')}
                  minDate={dayjs('2023-01-01')}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                    }
                  }}
                />
              </LocalizationProvider>
            </div>

            {selectedDate && (
              <>
                <p className="text-sm text-center text-gray-600 mb-4">
                  {formatDate(selectedDate)} Tarihinin Günlük Ort. Hava Kalitesi Değerleri
                </p>

                {loading ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="h-48">
                    <Bar data={chartData} options={chartOptions} />
                  </div>
                )}
              </>
            )}
          </div>
        );
      }

      default:
        return (
          <div className="p-2 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800">{location.type}</h3>
            <p className="text-sm text-gray-600">{location.name}</p>
          </div>
        );
    }
  };

  if (location.type === 'Kamera') {
    return (
      <Popup
        longitude={location.longitude}
        latitude={location.latitude}
        anchor="bottom"
        offset={[-10, -20] as [number, number]}
        onClose={onClose}
        closeButton={true}
        closeOnClick={false}
        className={popupClassNames.camera}
      >
        <div className="p-0">
          <h3 className="font-semibold text-gray-800 text-lg mb-2">{location.type}</h3>
          <p className="text-sm text-gray-600 mb-3">{location.name}</p>
          {location.cameraUrl && (
            <div className="flex-1 flex flex-col justify-start">
              <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden mb-4">
                <iframe
                  src={location.cameraUrl}
                  className="absolute inset-0 w-full h-full"
                  title="Kamera Görüntüsü"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <a 
                href={location.cameraUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block w-full text-center px-4 py-2 bg-yellow-400 text-black font-medium rounded-lg hover:bg-yellow-500 transition-colors mb-1"
              >
                Tam Ekranda Görüntüle
              </a>
            </div>
          )}
        </div>
      </Popup>
    );
  }

  // Popup sınıfını belirle
  const getPopupClassName = () => {
    if (location.type === 'Hava Ölçüm İstasyonu') return popupClassNames.airQuality;
    if (location.type === 'Kamera') return popupClassNames.camera;
    return popupClassNames.default;
  };

  return (
    <Popup
      longitude={location.longitude}
      latitude={location.latitude}
      anchor="bottom"
      offset={[-10, -20] as [number, number]}
      onClose={onClose}
      closeButton={true}
      closeOnClick={false}
      className={getPopupClassName()}
    >
      {renderPopupContent()}
    </Popup>
  );
};

export default LocationPopup;