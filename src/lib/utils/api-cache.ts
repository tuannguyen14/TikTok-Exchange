// lib/utils/api-cache.ts

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiry: number;
  }
  
  class ApiCache {
    private cache = new Map<string, CacheEntry<any>>();
    private pendingRequests = new Map<string, Promise<any>>();
  
    // Default cache duration: 5 minutes for TikTok data
    private defaultTTL = 5 * 60 * 1000;
  
    /**
     * Get cached data or fetch new data
     */
    async get<T>(
      key: string,
      fetchFn: () => Promise<T>,
      ttl: number = this.defaultTTL
    ): Promise<T> {
      // Check if we have a pending request for this key
      const pendingRequest = this.pendingRequests.get(key);
      if (pendingRequest) {
        return pendingRequest;
      }
  
      // Check if we have valid cached data
      const cached = this.cache.get(key);
      if (cached && Date.now() < cached.expiry) {
        return cached.data;
      }
  
      // Create new request and cache it
      const request = fetchFn().then(data => {
        this.cache.set(key, {
          data,
          timestamp: Date.now(),
          expiry: Date.now() + ttl
        });
        this.pendingRequests.delete(key);
        return data;
      }).catch(error => {
        this.pendingRequests.delete(key);
        throw error;
      });
  
      this.pendingRequests.set(key, request);
      return request;
    }
  
    /**
     * Clear cache entry
     */
    clear(key: string): void {
      this.cache.delete(key);
      this.pendingRequests.delete(key);
    }
  
    /**
     * Clear all cache
     */
    clearAll(): void {
      this.cache.clear();
      this.pendingRequests.clear();
    }
  
    /**
     * Clean expired entries
     */
    cleanup(): void {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now >= entry.expiry) {
          this.cache.delete(key);
        }
      }
    }
  
    /**
     * Get cache statistics
     */
    getStats() {
      return {
        cacheSize: this.cache.size,
        pendingRequests: this.pendingRequests.size,
        entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
          key,
          age: Date.now() - entry.timestamp,
          expiresIn: entry.expiry - Date.now()
        }))
      };
    }
  }
  
  // Create singleton instance
  export const apiCache = new ApiCache();
  
  // Auto cleanup every 10 minutes
  setInterval(() => {
    apiCache.cleanup();
  }, 10 * 60 * 1000);
  
  // Cache key generators
  export const cacheKeys = {
    videoInfo: (videoId: string) => `video_info_${videoId}`,
    userProfile: (username: string) => `user_profile_${username}`,
    userFollowers: (username: string) => `user_followers_${username}`,
    campaignList: (type?: string, status?: string, sortBy?: string) => 
      `campaigns_${type || 'all'}_${status || 'all'}_${sortBy || 'newest'}`,
    userActions: (userId: string, campaignId?: string) => 
      `user_actions_${userId}_${campaignId || 'all'}`
  };