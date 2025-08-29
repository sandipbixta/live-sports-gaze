import { supabase } from "@/integrations/supabase/client";

export interface IPTVProvider {
  id: string;
  name: string;
  is_active: boolean;
  // Note: Credentials (base_url, username, password, etc.) are not accessible from frontend
  // They are only available to backend edge functions for security
}

export interface IPTVChannel {
  id: string;
  name: string;
  logo: string;
  group: string;
  url: string;
  country?: string;
  language?: string;
}

class IPTVProviderService {
  private baseUrl = 'https://wxvsteaayxgygihpshoz.supabase.co/functions/v1/iptv-proxy';
  private cache: Map<string, any> = new Map();
  private cacheExpiry = 30 * 60 * 1000; // 30 minutes

  // Clear cache - useful for debugging and refreshing data
  clearCache() {
    console.log('🧹 Clearing IPTV cache');
    this.cache.clear();
  }

  private async fetchWithCache<T>(endpoint: string): Promise<T> {
    const cacheKey = endpoint;
    const cached = this.cache.get(cacheKey);
    
    // Force cache refresh for debugging
    console.log(`🔍 IPTV Cache: ${cacheKey}`, cached ? 'HIT' : 'MISS');
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      console.log('📦 Using cached IPTV data');
      return cached.data;
    }

    try {
      console.log(`🌐 Fetching fresh IPTV data: ${this.baseUrl}?${endpoint}`);
      const response = await fetch(`${this.baseUrl}?${endpoint}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ IPTV data received:`, data);
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error(`❌ Error fetching ${endpoint}:`, error);
      // Return cached data if available, even if expired
      if (cached) {
        console.log('📦 Returning expired cached data due to error');
        return cached.data;
      }
      throw error;
    }
  }

  async getProviders(): Promise<IPTVProvider[]> {
    return this.fetchWithCache<IPTVProvider[]>('action=providers');
  }

  async getChannelsForProvider(providerId: string): Promise<IPTVChannel[]> {
    return this.fetchWithCache<IPTVChannel[]>(`action=channels&provider=${providerId}`);
  }

  async getAllChannels(): Promise<Record<string, IPTVChannel[]>> {
    try {
      console.log('🚀 Loading all IPTV channels...');
      const [regularProviders, xtreamProviders] = await Promise.all([
        this.getProviders(), // Regular IPTV providers
        this.getXtreamProviders() // Xtream Codes providers
      ]);
      
      console.log('📡 Found regular providers:', regularProviders);
      console.log('🎬 Found Xtream providers:', xtreamProviders);
      
      const channelsByProvider: Record<string, IPTVChannel[]> = {};

      // Process regular IPTV providers
      await Promise.all(
        regularProviders.map(async (provider) => {
          try {
            console.log(`📺 Loading channels for: ${provider.name}`);
            const channels = await this.getChannelsForProvider(provider.id);
            channelsByProvider[provider.name] = channels;
            console.log(`✅ Loaded ${channels.length} channels for ${provider.name}`);
          } catch (error) {
            console.error(`❌ Error fetching channels for ${provider.name}:`, error);
            channelsByProvider[provider.name] = [];
          }
        })
      );

      // Process Xtream Codes providers
      await Promise.all(
        xtreamProviders.map(async (provider) => {
          try {
            console.log(`🎬 Loading Xtream channels for: ${provider.name}`);
            const channels = await this.getXtreamChannelsForProvider(provider.id);
            channelsByProvider[provider.name] = channels;
            console.log(`✅ Loaded ${channels.length} Xtream channels for ${provider.name}`);
          } catch (error) {
            console.error(`❌ Error fetching Xtream channels for ${provider.name}:`, error);
            channelsByProvider[provider.name] = [];
          }
        })
      );

      console.log('🎯 All channels loaded:', channelsByProvider);
      return channelsByProvider;
    } catch (error) {
      console.error('💥 Error fetching all channels:', error);
      return {};
    }
  }

  // Get Xtream Codes providers
  async getXtreamProviders(): Promise<IPTVProvider[]> {
    const cacheKey = 'xtream-providers';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      console.log('📦 Using cached Xtream providers');
      return cached.data;
    }

    try {
      console.log('🌐 Fetching Xtream providers...');
      const response = await fetch(`${this.baseUrl}?action=providers&type=xtream`);
      if (!response.ok) {
        throw new Error(`Failed to fetch Xtream providers: ${response.status} ${response.statusText}`);
      }
      
      const providers = await response.json();
      console.log('✅ Xtream providers received:', providers);
      this.cache.set(cacheKey, { data: providers, timestamp: Date.now() });
      return providers;
    } catch (error) {
      console.error('❌ Error fetching Xtream providers:', error);
      return [];
    }
  }

  // Get channels for Xtream Codes provider
  async getXtreamChannelsForProvider(providerId: string): Promise<IPTVChannel[]> {
    const cacheKey = `xtream-channels-${providerId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      console.log(`📦 Using cached Xtream channels for provider: ${providerId}`);
      return cached.data;
    }

    try {
      console.log(`🎬 Fetching Xtream channels for provider: ${providerId}`);
      const response = await fetch(`${this.baseUrl.replace('iptv-proxy', 'xtream-proxy')}?action=streams&provider=${providerId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch Xtream channels: ${response.status} ${response.statusText}`);
      }
      
      const channels = await response.json();
      console.log(`✅ Xtream channels received for ${providerId}:`, channels.length);
      this.cache.set(cacheKey, { data: channels, timestamp: Date.now() });
      return channels;
    } catch (error) {
      console.error(`❌ Error fetching Xtream channels for ${providerId}:`, error);
      return [];
    }
  }

  // Convert IPTV channel to our channel format
  convertToOurFormat(iptvChannel: IPTVChannel, providerName: string): any {
    return {
      id: iptvChannel.id,
      title: iptvChannel.name,
      country: iptvChannel.country || 'Unknown',
      embedUrl: iptvChannel.url,
      category: this.getCategoryFromGroup(iptvChannel.group),
      logo: iptvChannel.logo || '/default-tv-logo.jpg',
      group: iptvChannel.group,
      language: iptvChannel.language,
      provider: providerName
    };
  }

  private getCategoryFromGroup(group: string): string {
    const groupLower = group.toLowerCase();
    if (groupLower.includes('sport')) return 'sports';
    if (groupLower.includes('news')) return 'news';
    if (groupLower.includes('movie')) return 'movies';
    if (groupLower.includes('music')) return 'music';
    return 'general';
  }
}

export const iptvProviderService = new IPTVProviderService();