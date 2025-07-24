import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { apiService } from '../services/api';

const MapSelector = ({ onLocationSelect, selectedLocations }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      // Thử lấy từ database trước
      const response = await apiService.getSetting('google_maps_api_key');
      if (response.data.value && response.data.value !== 'YOUR_API_KEY_HERE') {
        setApiKey(response.data.value);
        // Cũng lưu vào localStorage để dùng nhanh lần sau
        localStorage.setItem('googleMapsApiKey', response.data.value);
      } else {
        throw new Error('API key chưa được cấu hình trong database');
      }
    } catch (err) {
      // Fallback: thử lấy từ localStorage
      const savedApiKey = localStorage.getItem('googleMapsApiKey');
      if (savedApiKey && savedApiKey !== 'YOUR_API_KEY_HERE') {
        setApiKey(savedApiKey);
      } else {
        setError('Vui lòng cấu hình Google Maps API Key trong trang Quản trị');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!apiKey || loading) return;

    const loader = new Loader({
      apiKey: apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry']
    });

    loader.load().then(() => {
      if (mapRef.current) {
        initializeMap();
      }
    }).catch(err => {
      setError('Không thể tải Google Maps: ' + err.message + '. Vui lòng kiểm tra API Key và quyền truy cập.');
    });
  }, [apiKey, loading]);

  const initializeMap = () => {
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 10.762622, lng: 106.660172 }, // TP.HCM center
      zoom: 12,
      mapTypeId: 'roadmap'
    });

    mapInstanceRef.current = map;
    setMapLoaded(true);

    // Add click listener
    map.addListener('click', (event) => {
      handleMapClick(event.latLng);
    });

    // Initialize Places Autocomplete for search
    const searchBox = document.getElementById('map-search');
    if (searchBox) {
      const autocomplete = new window.google.maps.places.Autocomplete(searchBox);
      autocomplete.bindTo('bounds', map);

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address || place.name
          };
          
          map.setCenter(location);
          map.setZoom(15);
          
          if (onLocationSelect) {
            onLocationSelect(location);
          }
        }
      });
    }
  };

  const handleMapClick = (latLng) => {
    const location = {
      lat: latLng.lat(),
      lng: latLng.lng(),
      address: `${latLng.lat().toFixed(6)}, ${latLng.lng().toFixed(6)}`
    };

    // Reverse geocoding để lấy địa chỉ
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results[0]) {
        location.address = results[0].formatted_address;
      }
      
      if (onLocationSelect) {
        onLocationSelect(location);
      }
    });
  };

  const addMarker = (location, label, color = 'red') => {
    if (!mapInstanceRef.current) return;

    const marker = new window.google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: mapInstanceRef.current,
      title: location.address,
      label: label,
      icon: {
        url: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`
      }
    });

    markersRef.current.push(marker);
    return marker;
  };

  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  };

  // Update markers when selectedLocations change
  useEffect(() => {
    if (!mapLoaded || !selectedLocations) return;

    clearMarkers();

    if (selectedLocations.from) {
      addMarker(selectedLocations.from, 'A', 'green');
    }

    if (selectedLocations.to) {
      addMarker(selectedLocations.to, 'B', 'red');
    }

    // Draw route if both locations exist
    if (selectedLocations.from && selectedLocations.to) {
      drawRoute(selectedLocations.from, selectedLocations.to);
    }
  }, [selectedLocations, mapLoaded]);

  const drawRoute = (from, to) => {
    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      map: mapInstanceRef.current,
      suppressMarkers: true // We'll use our own markers
    });

    directionsService.route({
      origin: from,
      destination: to,
      travelMode: window.google.maps.TravelMode.DRIVING,
    }, (result, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
      }
    });
  };

  if (loading) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-blue-500 mb-2">🔄 Đang tải cấu hình API Key...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">⚠️ {error}</p>
          <p className="text-sm text-gray-600 mb-4">
            API Key được lưu trong database và localStorage để đồng bộ giữa các thiết bị
          </p>
          <a 
            href="/admin" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block"
          >
            Đi đến trang Quản trị
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <input
          id="map-search"
          type="text"
          placeholder="🔍 Tìm kiếm địa điểm..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg border border-gray-300"
        style={{ minHeight: '400px' }}
      />
      <p className="text-sm text-gray-500 mt-2">
        💡 Click trên bản đồ để chọn địa điểm hoặc sử dụng ô tìm kiếm phía trên
      </p>
    </div>
  );
};

export default MapSelector;