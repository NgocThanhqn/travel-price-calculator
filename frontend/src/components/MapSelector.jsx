import React, { useRef, useEffect, useState } from 'react';
import googleMapsLoader from '../utils/googleMapsLoader';
import coordinateService from '../services/coordinateService';

const MapSelector = ({ 
  onLocationSelect, 
  selectedLocations,
  showCoordinateInfo = false // Debug info
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapsReady, setMapsReady] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [cacheStats, setCacheStats] = useState({ hits: 0, misses: 0 });

  // Load API key và initialize map
  const loadApiKey = async () => {
    try {
      console.log('🔑 Loading Google Maps API key...');
      await googleMapsLoader.load();
      console.log('✅ Google Maps loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load Google Maps:', error);
    }
  };

  const setupSearchBox = () => {
    if (!window.google || !mapInstanceRef.current) return;
    
    try {
      const searchBox = document.getElementById('map-search');
      if (!searchBox) return;

      const autocomplete = new window.google.maps.places.Autocomplete(searchBox, {
        bounds: mapInstanceRef.current.getBounds(),
        componentRestrictions: { country: 'vn' },
        fields: ['place_id', 'geometry', 'name', 'formatted_address', 'types']
      });

      autocomplete.bindTo('bounds', mapInstanceRef.current);

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          handlePlaceSelection(place);
        }
      });

      console.log('✅ Search autocomplete initialized');
      
    } catch (error) {
      console.error('❌ Search box setup failed:', error);
    }
  };

  // ===== ENHANCED PLACE SELECTION WITH ANALYSIS =====

  const handlePlaceSelection = async (place) => {
    try {
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        address: place.formatted_address || place.name,
        place_id: place.place_id,
        place_types: place.types || []
      };
      
      // Center map
      mapInstanceRef.current.setCenter(location);
      mapInstanceRef.current.setZoom(15);
      
      // Analyze địa chỉ
      const analysis = coordinateService.analyzeAddressType(location.address, location);
      setLastAnalysis({
        ...analysis,
        address: location.address,
        timestamp: new Date().toISOString()
      });

      // Thêm marker
      addMarker(location, 'S', 'blue');
      
      console.log('✅ Place selected via search:', location);
      console.log('📊 Address analysis:', analysis);

      // Process caching logic nếu có thể cache
      if (analysis.canCache) {
        await processCachableAddress(location, analysis);
      }
      
      if (onLocationSelect) {
        onLocationSelect({
          ...location,
          analysis: analysis,
          source: 'map_search'
        });
      }
      
    } catch (error) {
      console.error('❌ Error handling place selection:', error);
    }
  };

  // ===== ENHANCED MAP CLICK WITH SMART PROCESSING =====

  const handleMapClickEnhanced = async (latLng) => {
    try {
      const lat = latLng.lat();
      const lng = latLng.lng();
      
      console.log(`🗺️ Map clicked at: (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
      
      // Base location object
      let location = {
        lat: lat,
        lng: lng,
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        source: 'map_click'
      };

      // Attempt reverse geocoding
      try {
        const address = await googleMapsLoader.reverseGeocode(lat, lng);
        location.address = address;
        location.formatted_address = address;
        
        console.log('✅ Reverse geocoded address:', address);
        
        // Analyze địa chỉ
        const analysis = coordinateService.analyzeAddressType(address, { lat, lng });
        setLastAnalysis({
          ...analysis,
          address: address,
          timestamp: new Date().toISOString()
        });

        // Process caching logic nếu có thể cache
        if (analysis.canCache && analysis.level !== 'specific') {
          await processCachableAddress(location, analysis);
        }

        location.analysis = analysis;
        
      } catch (geocodeError) {
        console.warn('⚠️ Reverse geocoding failed, using coordinates:', geocodeError);
        
        // Set basic analysis cho coordinates
        setLastAnalysis({
          type: 'coordinates',
          canCache: false,
          level: 'specific',
          confidence: 0.1,
          address: location.address,
          timestamp: new Date().toISOString()
        });

        location.analysis = {
          type: 'coordinates',
          canCache: false,
          level: 'specific',
          confidence: 0.1
        };
      }

      // Add marker
      addMarker(location, 'M', 'red');

      if (onLocationSelect) {
        onLocationSelect(location);
      }
      
      console.log('✅ Map click processed:', location);
      
    } catch (error) {
      console.error('❌ Map click handling failed:', error);
    }
  };

  // ===== CACHE PROCESSING LOGIC =====

  const processCachableAddress = async (location, analysis) => {
    try {
      // Chỉ xử lý cache cho địa chỉ cấp hành chính (không phải địa chỉ cụ thể)
      if (!analysis.canCache || analysis.level === 'specific') {
        setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
        return;
      }

      console.log(`💾 Processing cachable address: ${analysis.level}`);

      // Extract administrative code từ địa chỉ (này sẽ phức tạp, implement đơn giản trước)
      const extractedCode = await extractAdministrativeCode(location.address, analysis.level);
      
      if (extractedCode) {
        // Lưu hoặc cập nhật tọa độ
        const saved = await coordinateService.saveCoordinatesToDatabase(
          analysis.level,
          extractedCode,
          location.lat,
          location.lng
        );

        if (saved) {
          setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
          console.log(`✅ Cached coordinates for ${analysis.level}:${extractedCode}`);
        } else {
          setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
        }
      } else {
        setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
        console.log(`⚠️ Could not extract code for caching`);
      }

    } catch (error) {
      console.error('❌ Error processing cachable address:', error);
      setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
    }
  };

  // ===== EXTRACT ADMINISTRATIVE CODE (Simplified) =====

  const extractAdministrativeCode = async (address, level) => {
    try {
      // Đây là implementation đơn giản
      // Trong thực tế, bạn có thể cần matching với database để tìm code chính xác
      
      console.log(`🔍 Extracting ${level} code from: ${address}`);
      
      // Pattern matching cho các cấp
      const patterns = {
        province: [
          { pattern: /thành phố hồ chí minh|tp\.?\s*hồ chí minh|hồ chí minh|sài gòn/i, code: '79' },
          { pattern: /thành phố hà nội|tp\.?\s*hà nội|hà nội/i, code: '01' },
          { pattern: /thành phố đà nẵng|tp\.?\s*đà nẵng|đà nẵng/i, code: '48' },
          { pattern: /tỉnh an giang|an giang/i, code: '89' },
          { pattern: /tỉnh bà rịa.*vũng tàu|bà rịa.*vũng tàu/i, code: '77' }
          // Thêm các pattern khác...
        ],
        district: [
          // Patterns cho district - phức tạp hơn
          { pattern: /quận 1,.*hồ chí minh|quận 1,.*tp.*hcm/i, code: '760', province: '79' },
          { pattern: /quận ba đình,.*hà nội/i, code: '001', province: '01' }
          // Thêm patterns khác...
        ],
        ward: [
          // Patterns cho ward - rất phức tạp
          // Implementation sau...
        ]
      };

      const levelPatterns = patterns[level] || [];
      
      for (const { pattern, code, province } of levelPatterns) {
        if (pattern.test(address)) {
          console.log(`✅ Matched pattern for ${level}:${code}`);
          return code;
        }
      }

      console.log(`❌ No pattern matched for ${level} in: ${address}`);
      return null;

    } catch (error) {
      console.error('❌ Error extracting administrative code:', error);
      return null;
    }
  };

  // ===== MAP INITIALIZATION =====

  const initializeMap = async () => {
    try {
      if (!mapRef.current) return;

      console.log('🗺️ Initializing map...');

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 10.762622, lng: 106.660172 }, // TP.HCM center
        zoom: 12,
        mapTypeId: 'roadmap',
        gestureHandling: 'greedy',
        streetViewControl: false,
        fullscreenControl: true,
        mapTypeControl: true,
        zoomControl: true
      });

      mapInstanceRef.current = map;
      setMapLoaded(true);
      setMapsReady(true);

      // Initialize DirectionsService and DirectionsRenderer
      directionsServiceRef.current = new window.google.maps.DirectionsService();
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        draggable: false,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#4285F4',
          strokeWeight: 6,
          strokeOpacity: 0.8
        }
      });
      directionsRendererRef.current.setMap(map);

      // Add click listener với enhanced processing
      map.addListener('click', (event) => {
        handleMapClickEnhanced(event.latLng);
      });

      // Setup search box sau khi map ready
      setTimeout(() => {
        setupSearchBox();
      }, 500);

      console.log('✅ Map initialized successfully');

    } catch (error) {
      console.error('❌ Map initialization failed:', error);
    }
  };

  // ===== MARKER MANAGEMENT =====

  const addMarker = (location, label, color = 'red') => {
    if (!mapInstanceRef.current) return;

    try {
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

    } catch (error) {
      console.error('❌ Error adding marker:', error);
    }
  };

  const clearMarkers = () => {
    markersRef.current.forEach(marker => {
      if (marker.setMap) {
        marker.setMap(null);
      }
    });
    markersRef.current = [];
    
    // Clear route khi clear markers
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setDirections({ routes: [] });
    }
  };

  const drawRoute = (from, to) => {
    if (!from || !to || !directionsServiceRef.current || !directionsRendererRef.current) {
      console.warn('⚠️ Cannot draw route: missing data or services');
      return;
    }

    try {
      console.log('🗺️ Drawing route from', from, 'to', to);

      const request = {
        origin: new window.google.maps.LatLng(from.lat, from.lng),
        destination: new window.google.maps.LatLng(to.lat, to.lng),
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      };

      directionsServiceRef.current.route(request, (result, status) => {
        if (status === 'OK') {
          directionsRendererRef.current.setDirections(result);
          
          // Log distance and duration
          const route = result.routes[0];
          if (route && route.legs[0]) {
            const distance = route.legs[0].distance.text;
            const duration = route.legs[0].duration.text;
            console.log(`✅ Route drawn: ${distance}, ${duration}`);
          }
        } else {
          console.error('❌ Directions request failed:', status);
        }
      });

    } catch (error) {
      console.error('❌ Error drawing route:', error);
    }
  };

  // ===== COMPONENT LIFECYCLE =====

  useEffect(() => {
    const init = async () => {
      try {
        await loadApiKey();
        if (mapRef.current) {
          await initializeMap();
        } else {
          setTimeout(() => init(), 100);
        }
      } catch (error) {
        console.error('❌ Map component initialization failed:', error);
      }
    };

    init();

    return () => {
      clearMarkers();
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
      directionsServiceRef.current = null;
    };
  }, []);

  // ===== UPDATE MARKERS AND ROUTE WHEN LOCATIONS CHANGE =====
  
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

  // ===== RENDER DEBUG INFO =====

  const renderDebugInfo = () => {
    if (!showCoordinateInfo) return null;

    return (
      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs">
        <div className="font-medium text-gray-700 mb-2">🗺️ Map Debug Info</div>
        
        {/* Cache Stats */}
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <div className="text-gray-600">Cache Hits: {cacheStats.hits}</div>
            <div className="text-gray-600">Cache Misses: {cacheStats.misses}</div>
          </div>
          <div>
            <div className="text-gray-600">Map Ready: {mapsReady ? '✅' : '❌'}</div>
            <div className="text-gray-600">Map Loaded: {mapLoaded ? '✅' : '❌'}</div>
          </div>
        </div>

        {/* Last Analysis */}
        {lastAnalysis && (
          <div className="border-t pt-2 mt-2">
            <div className="text-gray-600 mb-1">Last Analysis:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Type: <span className="font-mono">{lastAnalysis.type}</span></div>
              <div>Level: <span className="font-mono">{lastAnalysis.level}</span></div>
              <div>Can Cache: <span className={lastAnalysis.canCache ? 'text-green-600' : 'text-red-600'}>{lastAnalysis.canCache ? '✅' : '❌'}</span></div>
              <div>Confidence: <span className="font-mono">{lastAnalysis.confidence.toFixed(2)}</span></div>
            </div>
            <div className="mt-1 text-gray-500 truncate" title={lastAnalysis.address}>
              Address: {lastAnalysis.address}
            </div>
            <div className="text-gray-400 text-xs">
              {new Date(lastAnalysis.timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}

        {/* Clear Cache Button */}
        <button
          onClick={() => {
            coordinateService.clearCache();
            setCacheStats({ hits: 0, misses: 0 });
          }}
          className="mt-2 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
        >
          Clear Cache
        </button>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Search Box */}
      <div className="mb-4">
        <input
          id="map-search"
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Tìm kiếm địa điểm trên bản đồ..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="text-xs text-gray-500 mt-1">
          Nhấp vào bản đồ hoặc tìm kiếm để chọn vị trí
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div 
          ref={mapRef}
          style={{ height: '400px', width: '100%' }}
          className="rounded-lg border border-gray-300"
        />
        
        {/* Loading Overlay */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <div className="text-sm text-gray-600">Đang tải bản đồ...</div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {mapLoaded && (
        <div className="mt-3 flex space-x-2">
          <button
            onClick={clearMarkers}
            className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
          >
            🗑️ Xóa điểm đánh dấu
          </button>
          
        </div>
      )}

      {/* Debug Info */}
      {renderDebugInfo()}
    </div>
  );
};

export default MapSelector;