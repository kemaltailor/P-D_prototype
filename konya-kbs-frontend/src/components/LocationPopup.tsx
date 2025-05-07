import React from 'react';
import { Popup } from 'react-map-gl';
import { Location } from '../types/Location';

interface LocationPopupProps {
  location: Location;
  onClose: () => void;
  parkingOccupancies?: Record<number, number>;
}

const popupClassNames = {
  default: '!min-w-[260px] !max-w-[90vw] !p-0 !bg-white !rounded-xl !shadow-2xl',
  camera: '!min-w-[420px] !max-w-[95vw] !p-0 !bg-white !rounded-xl !shadow-2xl',
};

const LocationPopup: React.FC<LocationPopupProps> = ({ location, onClose, parkingOccupancies }) => {
  // Her konum türü için özel popup içeriği
  const renderPopupContent = () => {
    switch (location.type) {
      case 'Otopark':
        return (
          <div className="p-2 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800">{location.type}</h3>
            {location.name && (
              <p className="text-sm text-gray-600">{location.name}</p>
            )}
            <div className="mt-2">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Doluluk: {parkingOccupancies?.[location.id] || 0} / 100</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 border border-gray-300">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${parkingOccupancies?.[location.id] || 0}%` }}
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
            <div className="mt-2">
              <p className="text-sm text-gray-600">Bisiklet Park Alanı</p>
            </div>
          </div>
        );

      case 'Paylaşımlı Bisiklet İstasyonu':
        return (
          <div className="p-2 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800">{location.type}</h3>
            {location.name && (
              <p className="text-sm text-gray-600">{location.name}</p>
            )}
            <div className="mt-2">
              <p className="text-sm text-gray-600">Paylaşımlı Bisiklet İstasyonu</p>
            </div>
          </div>
        );

      case 'Cami':
        return (
          <div className="p-2 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800">{location.type}</h3>
            {location.name && (
              <p className="text-sm text-gray-600">{location.name}</p>
            )}
            <div className="mt-2">
              <p className="text-sm text-gray-600">Cami Bilgileri</p>
            </div>
          </div>
        );

      case 'Sağlık Tesisi':
        return (
          <div className="p-2 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800">{location.type}</h3>
            {location.name && (
              <p className="text-sm text-gray-600">{location.name}</p>
            )}
            <div className="mt-2">
              <p className="text-sm text-gray-600">Sağlık Tesisi Bilgileri</p>
            </div>
          </div>
        );

      case 'Okul':
        return (
          <div className="p-2 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800">{location.type}</h3>
            {location.name && (
              <p className="text-sm text-gray-600">{location.name}</p>
            )}
            <div className="mt-2">
              <p className="text-sm text-gray-600">Okul Bilgileri</p>
            </div>
          </div>
        );

      case 'Park':
        return (
          <div className="p-2 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800">{location.type}</h3>
            {location.name && (
              <p className="text-sm text-gray-600">{location.name}</p>
            )}
            <div className="mt-2">
              <p className="text-sm text-gray-600">Park Bilgileri</p>
            </div>
          </div>
        );

      case 'Tatlı Su Çeşmesi':
        return (
          <div className="p-2 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800">{location.type}</h3>
            {location.name && (
              <p className="text-sm text-gray-600">{location.name}</p>
            )}
            <div className="mt-2">
              <p className="text-sm text-gray-600">Çeşme Bilgileri</p>
            </div>
          </div>
        );

      case 'Eczane':
        return (
          <div className="p-2 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800">{location.type}</h3>
            {location.name && (
              <p className="text-sm text-gray-600">{location.name}</p>
            )}
            <div className="mt-2">
              <p className="text-sm text-gray-600">Eczane Bilgileri</p>
            </div>
          </div>
        );

      case 'Toplanma Alanı':
        return (
          <div className="p-2 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800">{location.type}</h3>
            {location.name && (
              <p className="text-sm text-gray-600">{location.name}</p>
            )}
            <div className="mt-2">
              <p className="text-sm text-gray-600">Toplanma Alanı Bilgileri</p>
            </div>
          </div>
        );

      case 'Hava Ölçüm İstasyonu':
        return (
          <div className="p-2 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800">{location.type}</h3>
            {location.name && (
              <p className="text-sm text-gray-600">{location.name}</p>
            )}
            <div className="mt-2">
              <p className="text-sm text-gray-600">Hava Kalitesi Ölçüm İstasyonu</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-2 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800">{location.type}</h3>
            {location.name && (
              <p className="text-sm text-gray-600">{location.name}</p>
            )}
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
          {location.name && (
            <p className="text-sm text-gray-600 mb-3">{location.name}</p>
          )}
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

  // Diğer popup türleri için
  return (
    <Popup
      longitude={location.longitude}
      latitude={location.latitude}
      anchor="bottom"
      offset={[-10, -20] as [number, number]}
      onClose={onClose}
      closeButton={true}
      closeOnClick={false}
      className={popupClassNames.default}
    >
      {renderPopupContent()}
    </Popup>
  );
};

export default LocationPopup; 