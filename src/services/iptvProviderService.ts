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
      const providers = await this.getProviders();
      console.log('📡 Found providers:', providers);
      const channelsByProvider: Record<string, IPTVChannel[]> = {};

      await Promise.all(
        providers.map(async (provider) => {
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

      console.log('🎯 All channels loaded:', channelsByProvider);
      return channelsByProvider;
    } catch (error) {
      console.error('💥 Error fetching all channels:', error);
      return {};
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