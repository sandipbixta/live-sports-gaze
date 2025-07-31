// Helper function to detect language from URL
export const detectLanguageFromUrl = (url: string): string => {
  if (!url) return 'en';
  
  const urlLower = url.toLowerCase();
  
  // Language detection patterns based on common streaming site patterns
  const languagePatterns = {
    'es': ['spanish', 'espanol', 'esp', '/es/', 'castellano'],
    'fr': ['french', 'francais', '/fr/', 'france'],
    'de': ['german', 'deutsch', '/de/', 'germany'],
    'it': ['italian', 'italiano', '/it/', 'italy'],
    'pt': ['portuguese', 'portugues', '/pt/', 'brazil', 'brasil'],
    'ru': ['russian', 'russkiy', '/ru/', 'russia'],
    'ar': ['arabic', 'arab', '/ar/', 'العربية'],
    'tr': ['turkish', 'turkce', '/tr/', 'turkey'],
    'pl': ['polish', 'polski', '/pl/', 'poland'],
    'nl': ['dutch', 'nederlands', '/nl/', 'netherlands'],
    'sv': ['swedish', 'svenska', '/sv/', 'sweden'],
    'no': ['norwegian', 'norsk', '/no/', 'norway'],
    'da': ['danish', 'dansk', '/da/', 'denmark'],
    'fi': ['finnish', 'suomi', '/fi/', 'finland'],
    'hu': ['hungarian', 'magyar', '/hu/', 'hungary'],
    'cs': ['czech', 'cesky', '/cs/', 'czech'],
    'sk': ['slovak', 'slovensky', '/sk/', 'slovakia'],
    'hr': ['croatian', 'hrvatski', '/hr/', 'croatia'],
    'bg': ['bulgarian', 'bulgarian', '/bg/', 'bulgaria'],
    'ro': ['romanian', 'romana', '/ro/', 'romania'],
    'el': ['greek', 'ellinika', '/el/', 'greece'],
    'he': ['hebrew', 'ivrit', '/he/', 'israel'],
    'ja': ['japanese', 'nihongo', '/jp/', 'japan'],
    'ko': ['korean', 'hanguk', '/kr/', 'korea'],
    'zh': ['chinese', 'zhongwen', '/cn/', 'china', 'mandarin'],
    'hi': ['hindi', 'bharati', '/in/', 'india'],
    'th': ['thai', 'thailand', '/th/'],
    'vi': ['vietnamese', 'vietnam', '/vn/'],
    'id': ['indonesian', 'indonesia', '/id/'],
    'ms': ['malay', 'malaysia', '/my/'],
    'tl': ['filipino', 'tagalog', '/ph/', 'philippines']
  };
  
  // Check for language patterns in the URL
  for (const [langCode, patterns] of Object.entries(languagePatterns)) {
    if (patterns.some(pattern => urlLower.includes(pattern))) {
      return langCode;
    }
  }
  
  // Default to English if no language detected
  return 'en';
};

// Helper function to convert language codes to readable names
export const getLanguageName = (langCode: string): string => {
  const languageNames: { [key: string]: string } = {
    'en': 'EN',
    'es': 'ES',
    'fr': 'FR',
    'de': 'DE',
    'it': 'IT',
    'pt': 'PT',
    'ru': 'RU',
    'ar': 'AR',
    'tr': 'TR',
    'pl': 'PL',
    'nl': 'NL',
    'sv': 'SV',
    'no': 'NO',
    'da': 'DA',
    'fi': 'FI',
    'hu': 'HU',
    'cs': 'CS',
    'sk': 'SK',
    'hr': 'HR',
    'bg': 'BG',
    'ro': 'RO',
    'el': 'EL',
    'he': 'HE',
    'ja': 'JP',
    'ko': 'KR',
    'zh': 'CN',
    'hi': 'IN',
    'th': 'TH',
    'vi': 'VN',
    'id': 'ID',
    'ms': 'MY',
    'tl': 'PH'
  };
  
  return languageNames[langCode?.toLowerCase()] || langCode?.toUpperCase() || 'EN';
};