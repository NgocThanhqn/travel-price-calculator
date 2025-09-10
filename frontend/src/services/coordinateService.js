// frontend/src/services/coordinateService.js - Smart Coordinate Management

import axios from 'axios';
import { googleMapsLoader } from '../utils/googleMapsLoader';

class CoordinateService {
  constructor() {
    this.cache = new Map(); // In-memory cache
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
  }

  // ===== CACHE MANAGEMENT =====
  
  getCacheKey(level, code) {
    return `${level}:${code}`;
  }

  getCachedCoordinates(level, code) {
    const key = this.getCacheKey(level, code);
    const cached = this.cache.get(key);
    
    if (cached) {
      console.log(`🎯 Cache hit for ${key}`);
      return cached;
    }
    
    return null;
  }

  setCachedCoordinates(level, code, coordinates) {
    const key = this.getCacheKey(level, code);
    this.cache.set(key, {
      ...coordinates,
      cached_at: new Date().toISOString()
    });
    console.log(`💾 Cached coordinates for ${key}`);
  }

  // ===== SMART COORDINATE RETRIEVAL =====

  async getCoordinatesForAddress(level, code, fullAddress = null) {
    try {
      console.log(`🔍 Getting coordinates for ${level}:${code}`);

      // 1. Kiểm tra in-memory cache trước
      const cached = this.getCachedCoordinates(level, code);
      if (cached) {
        return {
          success: true,
          coordinates: cached,
          source: 'memory_cache'
        };
      }

      // 2. Gọi smart geocoding API
      const response = await axios.post(`${this.apiUrl}/api/address/smart-geocode`, {
        level: level,
        code: code,
        full_address: fullAddress,
        force_refresh: false
      });

      if (response.data.success) {
        const coordinates = response.data.data;
        
        // Cache kết quả
        this.setCachedCoordinates(level, code, coordinates);
        
        return {
          success: true,
          coordinates: coordinates,
          source: coordinates.from_cache ? 'database_cache' : 'google_maps'
        };
      } else {
        console.error(`❌ Smart geocoding failed: ${response.data.error}`);
        return {
          success: false,
          error: response.data.error,
          coordinates: null
        };
      }

    } catch (error) {
      console.error(`❌ Error getting coordinates for ${level}:${code}:`, error);
      return {
        success: false,
        error: error.message,
        coordinates: null
      };
    }
  }

  // ===== FALLBACK GEOCODING (Direct Google Maps) =====

  async geocodeWithGoogleMaps(address) {
    try {
      console.log(`🌍 Fallback: Geocoding with Google Maps: ${address}`);
      
      // Đảm bảo Google Maps đã load
      await googleMapsLoader.load();
      
      const result = await googleMapsLoader.geocodeAddress(address);
      
      return {
        success: true,
        coordinates: {
          latitude: result.lat,
          longitude: result.lng,
          formatted_address: result.formatted_address,
          source: 'google_maps_direct'
        }
      };
      
    } catch (error) {
      console.error(`❌ Google Maps geocoding failed:`, error);
      return {
        success: false,
        error: error.message,
        coordinates: null
      };
    }
  }

  // ===== COORDINATE SAVING =====

  async saveCoordinatesToDatabase(level, code, latitude, longitude) {
    try {
      console.log(`💾 Saving coordinates to DB: ${level}:${code}`);
      
      const response = await axios.patch(
        `${this.apiUrl}/api/address/${level}s/${code}/coordinates`,
        {
          latitude: latitude,
          longitude: longitude
        }
      );

      if (response.data.success) {
        // Update cache
        this.setCachedCoordinates(level, code, {
          latitude: latitude,
          longitude: longitude,
          source: 'saved_to_database'
        });
        
        console.log(`✅ Saved coordinates successfully`);
        return true;
      } else {
        console.error(`❌ Failed to save coordinates: ${response.data.message}`);
        return false;
      }

    } catch (error) {
      console.error(`❌ Error saving coordinates:`, error);
      return false;
    }
  }

  // ===== INTELLIGENT ADDRESS PROCESSING =====

  async processAddressSelection(addressData) {
    try {
      const { level, item, fullAddress } = addressData;
      
      console.log(`🎯 Processing address selection:`, addressData);

      // Kiểm tra xem item đã có coordinates chưa
      if (item.has_coordinates && item.latitude && item.longitude) {
        console.log(`✅ Using existing coordinates from item`);
        
        const coordinates = {
          lat: item.latitude,
          lng: item.longitude,
          address: fullAddress,
          formatted_address: fullAddress,
          source: 'database_direct'
        };

        // Cache vào memory để lần sau nhanh hơn
        this.setCachedCoordinates(level, item.code, {
          latitude: item.latitude,
          longitude: item.longitude,
          source: 'database_direct'
        });

        return {
          success: true,
          coordinates: coordinates,
          source: 'database_direct',
          needs_geocoding: false
        };
      }

      // Chưa có coordinates, cần smart geocoding
      console.log(`🔄 No coordinates found, using smart geocoding`);
      
      const result = await this.getCoordinatesForAddress(level, item.code, fullAddress);
      
      if (result.success) {
        return {
          success: true,
          coordinates: {
            lat: result.coordinates.latitude,
            lng: result.coordinates.longitude,
            address: fullAddress,
            formatted_address: fullAddress,
            source: result.source
          },
          source: result.source,
          needs_geocoding: result.source === 'google_maps'
        };
      } else {
        // Fallback: Geocoding trực tiếp với Google Maps
        console.log(`🔄 Smart geocoding failed, trying direct Google Maps`);
        
        const fallbackResult = await this.geocodeWithGoogleMaps(fullAddress);
        
        if (fallbackResult.success) {
          // Tự động save vào database
          await this.saveCoordinatesToDatabase(
            level, 
            item.code, 
            fallbackResult.coordinates.latitude, 
            fallbackResult.coordinates.longitude
          );

          return {
            success: true,
            coordinates: {
              lat: fallbackResult.coordinates.latitude,
              lng: fallbackResult.coordinates.longitude,
              address: fullAddress,
              formatted_address: fallbackResult.coordinates.formatted_address,
              source: 'google_maps_fallback'
            },
            source: 'google_maps_fallback',
            needs_geocoding: false // Đã geocode rồi
          };
        }

        return {
          success: false,
          error: 'All geocoding methods failed',
          coordinates: null
        };
      }

    } catch (error) {
      console.error(`❌ Error processing address selection:`, error);
      return {
        success: false,
        error: error.message,
        coordinates: null
      };
    }
  }

  // ===== UTILITIES =====

  async getCoordinateStats() {
    try {
      const response = await axios.get(`${this.apiUrl}/api/address/coordinates/stats`);
      return response.data;
    } catch (error) {
      console.error('❌ Error getting coordinate stats:', error);
      return null;
    }
  }

  async getMissingCoordinates(level = 'province', limit = 20) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/api/address/coordinates/missing?level=${level}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error getting missing coordinates:', error);
      return null;
    }
  }

  clearCache() {
    this.cache.clear();
    console.log('🗑️ Coordinate cache cleared');
  }

  getCacheSize() {
    return this.cache.size;
  }

  getCacheInfo() {
    const entries = Array.from(this.cache.entries()).map(([key, value]) => ({
      key,
      source: value.source,
      cached_at: value.cached_at
    }));
    
    return {
      size: this.cache.size,
      entries: entries
    };
  }

  // ===== ADDRESS ANALYSIS =====

  analyzeAddressType(address, coordinates = null) {
    /**
     * Phân tích loại địa chỉ để quyết định có thể cache không
     * Returns: {
     *   type: 'specific'|'general'|'coordinates',
     *   canCache: boolean,
     *   level: 'province'|'district'|'ward'|'specific',
     *   confidence: number
     * }
     */
    
    const analysis = {
      type: 'general',
      canCache: false,
      level: 'specific',
      confidence: 0.5
    };

    if (!address || address.trim() === '') {
      analysis.type = 'coordinates';
      analysis.canCache = false;
      analysis.confidence = 0.1;
      return analysis;
    }

    const addressLower = address.toLowerCase().trim();

    // Kiểm tra xem có phải là tọa độ thuần không
    const coordPattern = /^\d+\.\d+,\s*\d+\.\d+$/;
    if (coordPattern.test(addressLower)) {
      analysis.type = 'coordinates';
      analysis.canCache = false;
      analysis.confidence = 0.9;
      return analysis;
    }

    // Kiểm tra cấp độ địa chỉ
    const addressParts = address.split(',').map(part => part.trim());
    
    // Patterns cho các cấp
    const provincePatterns = [
      /^(thành phố|tỉnh|tp\.?)\s+/i,
      /hà nội|hồ chí minh|tp\.?\s*hcm|sài gòn/i
    ];
    
    const districtPatterns = [
      /^(quận|huyện|thành phố|thị xã|q\.?|h\.?)\s+/i
    ];
    
    const wardPatterns = [
      /^(phường|xã|thị trấn|p\.?|x\.?)\s+/i
    ];

    // Phân tích từng part
    let hasSpecificAddress = false;
    let detectedLevel = 'specific';
    
    for (let i = 0; i < addressParts.length; i++) {
      const part = addressParts[i].toLowerCase();
      
      // Kiểm tra số nhà/tên đường
      if (i === 0 && (/^\d+/.test(part) || /đường|phố|ngõ|tổ|khu/.test(part))) {
        hasSpecificAddress = true;
        analysis.confidence += 0.3;
      }
      
      // Kiểm tra các cấp hành chính
      if (provincePatterns.some(pattern => pattern.test(part))) {
        detectedLevel = 'province';
        analysis.confidence += 0.2;
      } else if (districtPatterns.some(pattern => pattern.test(part))) {
        detectedLevel = 'district';
        analysis.confidence += 0.2;
      } else if (wardPatterns.some(pattern => pattern.test(part))) {
        detectedLevel = 'ward';
        analysis.confidence += 0.2;
      }
    }

    // Quyết định final analysis
    if (hasSpecificAddress) {
      analysis.type = 'specific';
      analysis.canCache = false; // Địa chỉ cụ thể không cache
      analysis.level = 'specific';
    } else {
      analysis.type = 'general';
      analysis.canCache = true; // Địa chỉ cấp hành chính có thể cache
      analysis.level = detectedLevel;
    }

    // Adjust confidence
    analysis.confidence = Math.min(analysis.confidence, 1.0);
    
    console.log(`📊 Address analysis for "${address}":`, analysis);
    return analysis;
  }
}

// Export singleton instance
export const coordinateService = new CoordinateService();
export default coordinateService;