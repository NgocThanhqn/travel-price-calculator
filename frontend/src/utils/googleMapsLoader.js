// utils/googleMapsLoader.js
import { Loader } from '@googlemaps/js-api-loader';
import { apiService } from '../services/api';

class GoogleMapsLoader {
  constructor() {
    this.loader = null;
    this.isLoaded = false;
    this.isLoading = false;
    this.loadPromise = null;
    this.apiKey = null;
  }

  async getApiKey() {
    if (this.apiKey) return this.apiKey;

    try {
      // Thử lấy từ database
      const response = await apiService.getSetting('google_maps_api_key');
      if (response.data.value && response.data.value !== 'YOUR_API_KEY_HERE') {
        this.apiKey = response.data.value;
        localStorage.setItem('googleMapsApiKey', this.apiKey);
        return this.apiKey;
      }
    } catch (error) {
      console.log('Fallback to localStorage for API key');
    }

    // Fallback: lấy từ localStorage
    const savedApiKey = localStorage.getItem('googleMapsApiKey');
    if (savedApiKey && savedApiKey !== 'YOUR_API_KEY_HERE') {
      this.apiKey = savedApiKey;
      return this.apiKey;
    }

    throw new Error('Google Maps API Key chưa được cấu hình');
  }

  async load() {
    // Nếu đã load xong, return ngay
    if (this.isLoaded && window.google?.maps) {
      return window.google;
    }

    // Nếu đang load, chờ promise hiện tại
    if (this.isLoading && this.loadPromise) {
      return this.loadPromise;
    }

    this.isLoading = true;

    this.loadPromise = (async () => {
      try {
        console.log('🗺️ Initializing Google Maps API...');

        // Lấy API key
        const apiKey = await this.getApiKey();

        // Tạo loader nếu chưa có
        if (!this.loader) {
          this.loader = new Loader({
            apiKey: apiKey,
            version: 'weekly',
            libraries: ['places', 'geometry', 'geocoding']
          });
        }

        // Load API
        await this.loader.load();
        this.isLoaded = true;
        this.isLoading = false;

        console.log('✅ Google Maps API loaded successfully');
        return window.google;

      } catch (error) {
        this.isLoading = false;
        this.loadPromise = null;
        console.error('❌ Failed to load Google Maps:', error);
        throw error;
      }
    })();

    return this.loadPromise;
  }

  isReady() {
    return this.isLoaded && window.google?.maps;
  }

  async geocodeAddress(address) {
    if (!this.isReady()) {
      await this.load();
    }

    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode(
        { 
          address: address,
          componentRestrictions: { country: 'VN' }
        },
        (results, status) => {
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            const coords = {
              lat: location.lat(),
              lng: location.lng(),
              address: address,
              formatted_address: results[0].formatted_address,
              place_id: results[0].place_id
            };
            resolve(coords);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        }
      );
    });
  }

  async reverseGeocode(lat, lng) {
    if (!this.isReady()) {
      await this.load();
    }

    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      const latLng = new window.google.maps.LatLng(lat, lng);
      
      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`));
        }
      });
    });
  }
}

// Export singleton instance
export const googleMapsLoader = new GoogleMapsLoader();
export default googleMapsLoader;