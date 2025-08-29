interface M3UChannel {
  id: string;
  title: string;
  country: string;
  streamUrl: string;
  category: 'sports' | 'cricket' | 'football' | 'rugby' | 'golf' | 'entertainment' | 'news';
  logo?: string;
  tvgId?: string;
  groupTitle?: string;
}

export function parseM3U(content: string): M3UChannel[] {
  const lines = content.split('\n').filter(line => line.trim());
  const channels: M3UChannel[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('#EXTINF:')) {
      // Parse the EXTINF line
      const tvgIdMatch = line.match(/tvg-id="([^"]*)"/);
      const tvgNameMatch = line.match(/tvg-name="([^"]*)"/);
      const tvgLogoMatch = line.match(/tvg-logo="([^"]*)"/);
      const groupTitleMatch = line.match(/group-title="([^"]*)"/);
      
      // Extract title (everything after the last comma)
      const titleMatch = line.match(/,(.*)$/);
      const title = titleMatch ? titleMatch[1].trim() : '';
      
      // Get the next line which should be the URL
      const streamUrl = i + 1 < lines.length ? lines[i + 1].trim() : '';
      
      if (title && streamUrl && streamUrl.startsWith('http')) {
        // Generate ID from title
        const id = title.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50);
        
        // Determine category from group title
        const groupTitle = groupTitleMatch ? groupTitleMatch[1].toLowerCase() : '';
        let category: M3UChannel['category'] = 'sports';
        
        if (groupTitle.includes('cricket')) category = 'cricket';
        else if (groupTitle.includes('football')) category = 'football';
        else if (groupTitle.includes('rugby')) category = 'rugby';
        else if (groupTitle.includes('golf')) category = 'golf';
        else if (groupTitle.includes('news')) category = 'news';
        else if (groupTitle.includes('entertainment')) category = 'entertainment';
        
        // Extract country from title or group
        let country = 'International';
        const countryMatches = title.match(/^([A-Z]{2,3}):/);
        if (countryMatches) {
          const countryCode = countryMatches[1];
          switch (countryCode) {
            case 'IN': country = 'India'; break;
            case 'CRI': country = 'Cricket'; break;
            case 'UK': country = 'United Kingdom'; break;
            case 'USA': country = 'United States'; break;
            case 'PT': country = 'Portugal'; break;
            case 'NL': country = 'Netherlands'; break;
            case 'DE': country = 'Germany'; break;
            case 'DSTV': country = 'South Africa'; break;
            default: country = 'International'; break;
          }
        }
        
        channels.push({
          id,
          title: title.replace(/^[A-Z]{2,3}:\s*/, ''), // Remove country prefix
          country,
          streamUrl,
          category,
          logo: tvgLogoMatch ? tvgLogoMatch[1] : undefined,
          tvgId: tvgIdMatch ? tvgIdMatch[1] : undefined,
          groupTitle: groupTitleMatch ? groupTitleMatch[1] : undefined
        });
        
        i++; // Skip the URL line in next iteration
      }
    }
  }
  
  return channels;
}