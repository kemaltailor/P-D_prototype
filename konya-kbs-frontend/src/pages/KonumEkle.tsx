import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const KonumEkle: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    isim: '',
    tur: '',
    icerik: '',
    resim: '',
    latitude: '',
    longitude: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [useMap, setUseMap] = useState(false);
  const [mapViewState, setMapViewState] = useState({
    longitude: 32.4847,
    latitude: 37.8716,
    zoom: 12
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleMapClick = (e: any) => {
    setFormData(prev => ({
      ...prev,
      latitude: e.lngLat.lat.toString(),
      longitude: e.lngLat.lng.toString()
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          resim: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5259/api/TuristikKonum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          isim: formData.isim,
          tur: formData.tur,
          icerik: formData.icerik,
          resim: formData.resim,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        })
      });

      if (response.ok) {
        setSuccess('Konum başarıyla eklendi!');
        setFormData({
          isim: '',
          tur: '',
          icerik: '',
          resim: '',
          latitude: '',
          longitude: ''
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Konum eklenirken bir hata oluştu');
      }
    } catch (err) {
      setError('Sunucuya bağlanırken bir hata oluştu');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const turler = [
    'Mecsit',
    'Tarihi Yapı',
    'Tarihi Kilise',
    'Hamam',
    'Prehistorik Alan',
    'Tarihi Han'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Yeni Turistik Konum Ekle
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="isim" className="block text-sm font-medium text-gray-700">
                Konum Adı
              </label>
              <input
                id="isim"
                name="isim"
                type="text"
                required
                value={formData.isim}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="tur" className="block text-sm font-medium text-gray-700">
                Konum Türü
              </label>
              <select
                id="tur"
                name="tur"
                required
                value={formData.tur}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Seçiniz</option>
                {turler.map((tur) => (
                  <option key={tur} value={tur}>{tur}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="icerik" className="block text-sm font-medium text-gray-700">
                İçerik
              </label>
              <textarea
                id="icerik"
                name="icerik"
                rows={4}
                value={formData.icerik}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="resim" className="block text-sm font-medium text-gray-700">
                Resim
              </label>
              <input
                id="resim"
                name="resim"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="useMap"
                  name="useMap"
                  type="checkbox"
                  checked={useMap}
                  onChange={(e) => setUseMap(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="useMap" className="ml-2 block text-sm text-gray-900">
                  Haritadan Konum Seç
                </label>
              </div>
            </div>

            {!useMap ? (
              <>
                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                    Enlem
                  </label>
                  <input
                    id="latitude"
                    name="latitude"
                    type="text"
                    required
                    value={formData.latitude}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                    Boylam
                  </label>
                  <input
                    id="longitude"
                    name="longitude"
                    type="text"
                    required
                    value={formData.longitude}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </>
            ) : (
              <div className="h-[400px] w-full rounded-lg overflow-hidden">
                <Map
                  {...mapViewState}
                  onMove={evt => setMapViewState(evt.viewState)}
                  onClick={handleMapClick}
                  mapStyle="mapbox://styles/mapbox/streets-v11"
                  mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
                >
                  {formData.latitude && formData.longitude && (
                    <Marker
                      longitude={parseFloat(formData.longitude)}
                      latitude={parseFloat(formData.latitude)}
                      anchor="bottom"
                    />
                  )}
                </Map>
                {formData.latitude && formData.longitude && (
                  <div className="mt-2 text-sm text-gray-600">
                    Seçilen Konum: {formData.latitude}, {formData.longitude}
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="text-red-600 text-sm mt-2">
                {error}
              </div>
            )}

            {success && (
              <div className="text-green-600 text-sm mt-2">
                {success}
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Konum Ekle
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KonumEkle; 