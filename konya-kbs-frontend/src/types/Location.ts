export interface Location {
  id: number;
  type: 'Park' | 'Cami' | 'Sağlık Tesisi' | 'Okul' | 'Tatlı Su Çeşmesi' | 'Eczane' | 'Toplanma Alanı' | 'Bisiklet Park Alanı' | 'Paylaşımlı Bisiklet İstasyonu' | 'Otopark' | 'Hava Ölçüm İstasyonu' | 'Kamera' | 'Tarihi/Turistik Yerler';
  latitude: number;
  longitude: number;
  name: string;
  occupiedSpaces?: number;
  cameraUrl?: string;
  turistikTur?: string;
  aciklama?: string;
  resim?: string;
} 