const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const AD_DOMAINS = [
  'doubleclick.net', 'googlesyndication.com', 'googletagservices.com',
  'googletagmanager.com', 'google-analytics.com', 'pagead2.googlesyndication.com',
  'amazon-adsystem.com', 'criteo.com', 'criteo.net',
  'smartadserver.com', 'rubiconproject.com', 'casalemedia.com',
  'pubmatic.com', 'openx.net', 'adnxs.com', 'moatads.com',
  'outbrain.com', 'taboola.com', 'adsrvr.org', 'bidswitch.net',
  'contextweb.com', 'sharethrough.com', 'sonobi.com', 'sovrn.com',
  '33across.com', 'quantcast.com', 'adform.net', 'adzerk.net',
  'gum.criteo.com', 'tpc.googlesyndication.com',
  'securepubads.g.doubleclick.net', 'fastlane.rubiconproject.com',
  'htlb.casalemedia.com', 'prg.smartadserver.com',
  'akamai.sscdn.co/gcs/letras-static/ads/',
  'static-kbo-site.knbcdn.com.br/kbo/ads/',
  's.go-mpulse.net', 'go-mpulse.net'
];

const AD_PATTERNS = [
  /\/gpt\.js/i, /\/gtag\/js/i, /\/gtm\.js/i,
  /\/ads\.js/i, /\/adunit/i, /\/prebid/i, /\/hb_/i,
  /google-analytics\.com\/analytics\.js/i,
  /googletagmanager\.com\/gtag/i,
  /googletagmanager\.com\/gtm/i,
  /apstag\.js/i, /boomerang/i
];

const AD_ELEMENT_SELECTORS = [
  '[id^="pub_"]', '[id^="ad_"]', '[class*="ad-"]', '[class*="ads"]',
  '.ad_pub', '.boxAd', '.adMobileBottom', '.ad-close',
  'script[src*="doubleclick"]', 'script[src*="googlesyndication"]',
  'script[src*="ads"]', 'script[src*="prebid"]', 'script[src*="hb_"]',
  'script[src*="googletagmanager"]', 'script[src*="google-analytics"]',
  'script[src*="amazon-adsystem"]', 'script[src*="criteo"]',
  'script[src*="smartadserver"]', 'script[src*="rubiconproject"]',
  'script[src*="casalemedia"]', 'script[src*="boomerang"]',
  'script[src*="mpulse"]', 'script[src*="apstag"]',
  'script:contains("googletag")', 'script:contains("adsqueue")',
  'script:contains("adunit")', 'script:contains("pbjs")',
  'script:contains("prebidAdUnits")', 'script:contains("_adunit")',
  'script:contains("__dfpargs")', 'script:contains("gtag")',
  'script:contains("dataLayer")',
  'link[href*="ads"]', 'iframe[src*="doubleclick"]',
  'iframe[src*="googlesyndication"]',
  'noscript:has(iframe[src*="googletagmanager"])'
];

function isAdUrl(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  for (const domain of AD_DOMAINS) {
    if (lower.includes(domain)) return true;
  }
  for (const pattern of AD_PATTERNS) {
    if (pattern.test(lower)) return true;
  }
  return false;
}

function sanitizeHtml(html, source) {
  const $ = cheerio.load(html);

  $('script').each((i, el) => {
    const src = $(el).attr('src') || '';
    const text = $(el).html() || '';
    if (isAdUrl(src) || src.includes('boomerang') || src.includes('mpulse')) {
      $(el).remove();
      return;
    }
    const adKeywords = [
      'googletag', 'adsqueue', 'adunit', 'pbjs', 'prebidAdUnits',
      '_adunit', '__dfpargs', 'gtag', 'dataLayer', 'ad_storage',
      'analytics_storage', 'ad_user_data', 'ad_personalization',
      'BOOMR', 'boomerang', '_omq', 'window.adsqueue',
      'googletag.cmd', 'pbjs.que', 'prebidAdUnitsRefresh',
      '_adunitSlots', '_adunitLazySlots', '_adunitDynamicSlots',
      '_adunitRefreshSlots'
    ];
    for (const kw of adKeywords) {
      if (text.includes(kw) && !text.includes('linkplay') && !text.includes('arrayMusicas') && !text.includes('temPlayer') && !text.includes('formulario')) {
        $(el).remove();
        return;
      }
    }
  });

  AD_ELEMENT_SELECTORS.forEach(selector => {
    try {
      $(selector).remove();
    } catch (e) {}
  });

  $('link[rel="dns-prefetch"]').each((i, el) => {
    const href = $(el).attr('href') || '';
    if (isAdUrl(href)) $(el).remove();
  });

  $('link[rel="preconnect"]').each((i, el) => {
    const href = $(el).attr('href') || '';
    if (isAdUrl(href)) $(el).remove();
  });

  $('meta[http-equiv="origin-trial"]').remove();

  if (source === 'kboing') {
    $('script').each((i, el) => {
      const text = $(el).html() || '';
      if (text.includes('googletag') && text.includes('cmd')) {
        $(el).replaceWith(`<script>var googletag = {cmd: []};</script>`);
      }
      if (text.includes('gtag') && text.includes('dataLayer')) {
        $(el).replaceWith(`<script>window.dataLayer = []; function gtag(){}</script>`);
      }
    });
  }

  if (source === 'ouvirmusica') {
    $('script').each((i, el) => {
      const text = $(el).html() || '';
      if (text.includes('adsqueue') || text.includes('_adunit') || text.includes('pbjs.que') || text.includes('prebidAdUnits')) {
        const safeVars = text
          .replace(/window\.adsqueue\s*=\s*[^;]+;/g, 'window.adsqueue = [];')
          .replace(/_adunitSlots\s*=\s*\{[^}]*\}/g, '_adunitSlots = {};')
          .replace(/_adunitLazySlots\s*=\s*\{[^}]*\}/g, '_adunitLazySlots = {};')
          .replace(/_adunitDynamicSlots\s*=\s*\{[^}]*\}/g, '_adunitDynamicSlots = {};')
          .replace(/_adunitRefreshSlots\s*=\s*\{[^}]*\}/g, '_adunitRefreshSlots = {};')
          .replace(/pbjs\.que\s*=\s*[^;]+;/g, 'pbjs.que = [];')
          .replace(/prebidAdUnits\s*=\s*[^;]+;/g, 'prebidAdUnits = [];')
          .replace(/prebidAdUnitsRefresh\s*=\s*[^;]+;/g, 'prebidAdUnitsRefresh = [];');
        $(el).text(safeVars);
      }
    });

    $('script[src*="hb_ouvirmusica"]').remove();
    $('script[src*="prebid_all"]').remove();
    $('script[src*="apstag.js"]').remove();
  }

  $('[style*="min-height:90px"]').each((i, el) => {
    if ($(el).attr('id') && ($(el).attr('id').startsWith('pub_') || $(el).attr('id').startsWith('ad_'))) {
      $(el).remove();
    }
  });

  return $.html();
}

async function searchKboing(query) {
  try {
    const searchUrl = `https://www.kboing.com.br/?q=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
      }
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    const results = [];

    $('.lst-musCont li').each((i, el) => {
      const songEl = $(el).find('.bxSongImg a').first();
      const titleEl = songEl.find('b');
      const artistEl = songEl.find('span');
      const imgEl = $(el).find('.bxSongImg img');
      const link = songEl.attr('href') || '';

      const title = titleEl.text().trim();
      const artist = artistEl.text().trim();
      const image = imgEl.attr('src') || '';

      if (title) {
        results.push({
          title, artist, image, link,
          source: 'kboing',
          url: link.startsWith('/') ? `https://www.kboing.com.br${link}` : link
        });
      }
    });

    if (results.length === 0) {
      $('.lst-rel li').each((i, el) => {
        const linkEl = $(el).find('a').first();
        const titleEl = $(el).find('b');
        const imgEl = $(el).find('img');
        const link = linkEl.attr('href') || '';
        const title = titleEl.text().trim();
        const image = imgEl.attr('src') || '';
        if (title && link) {
          results.push({
            title,
            artist: '',
            image,
            link,
            source: 'kboing',
            url: link.startsWith('/') ? `https://www.kboing.com.br${link}` : link
          });
        }
      });
    }

    if (results.length === 0) {
      $('script').each((i, el) => {
        const text = $(el).html() || '';
        const linkplayRegex = /linkplay\[\d+\]\s*=\s*new\s+Array\([^)]*"([^"]*)",[^)]*"([^"]*)",[^)]*"([^"]*)"[^)]*\)/g;
        let match;
        while ((match = linkplayRegex.exec(text)) !== null) {
          if (match[1] && match[1].startsWith('y::')) {
            results.push({
              title: match[3] || '',
              artist: match[2] || '',
              youtubeId: match[1].replace('y::', ''),
              source: 'kboing',
              image: '',
              link: '',
              url: `https://www.kboing.com.br`
            });
          }
        }
      });
    }

    return results;
  } catch (err) {
    console.error('Kboing search error:', err.message);
    return [];
  }
}

async function searchOuvirMusica(query) {
  try {
    const apiUrl = `https://api.letras.mus.br/v2/songs/search?q=${encodeURIComponent(query)}&limit=20`;
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9',
        'Origin': 'https://www.ouvirmusica.com.br',
        'Referer': 'https://www.ouvirmusica.com.br/'
      }
    });

    if (!response.ok) {
      const altUrl = `https://api.ouvirmusica.com.br/api/v1/search/?q=${encodeURIComponent(query)}`;
      const altResponse = await fetch(altUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Origin': 'https://www.ouvirmusica.com.br',
          'Referer': 'https://www.ouvirmusica.com.br/'
        }
      });
      if (altResponse.ok) {
        const data = await altResponse.json();
        return formatOuvirMusicaResults(data, query);
      }
      return [];
    }

    const data = await response.json();
    return formatOuvirMusicaResults(data, query);
  } catch (err) {
    console.error('OuvirMusica search error:', err.message);

    try {
      const pageUrl = `https://www.ouvirmusica.com.br/?q=${encodeURIComponent(query)}`;
      const response = await fetch(pageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html',
          'Accept-Language': 'pt-BR,pt;q=0.9'
        }
      });
      const html = await response.text();

      const jsonBlocks = [];
      const regex = /<script type="application\/json" data-sveltekit-fetched[^>]*>(.*?)<\/script>/gs;
      let match;
      while ((match = regex.exec(html)) !== null) {
        try {
          jsonBlocks.push(JSON.parse(match[1]));
        } catch (e) {}
      }

      const results = [];
      for (const block of jsonBlocks) {
        if (block && block.data) {
          const data = Array.isArray(block.data) ? block.data : [block.data];
          for (const item of data) {
            if (item && (item.name || item.title) && (item.artist || item.artists)) {
              const artists = item.artist || (item.artists && item.artists.map(a => a.name).join(', ')) || '';
              results.push({
                title: item.name || item.title || '',
                artist: artists,
                image: item.image || item.cover || item.thumbnail || '',
                link: item.url || item.path || `/${artists.toLowerCase().replace(/\s+/g, '-')}/${(item.name || item.title || '').toLowerCase().replace(/\s+/g, '-')}/`,
                source: 'ouvirmusica'
              });
            }
          }
        }
      }
      return results.slice(0, 20);
    } catch (e2) {
      console.error('Fallback search error:', e2.message);
      return [];
    }
  }
}

function formatOuvirMusicaResults(data, query) {
  const results = [];
  const items = data.data || data.results || data.songs || data || [];

  if (Array.isArray(items)) {
    for (const item of items) {
      const title = item.name || item.title || '';
      const artist = item.artist || (item.artists && item.artists.map(a => a.name).join(', ')) || '';
      const image = item.image || item.cover || item.thumbnail || '';
      const link = item.url || item.path || '';

      results.push({
        title,
        artist,
        image: image.startsWith('//') ? `https:${image}` : image,
        link,
        source: 'ouvirmusica',
        url: `https://www.ouvirmusica.com.br${link || `/${artist.toLowerCase().replace(/\s+/g, '-')}/${title.toLowerCase().replace(/\s+/g, '-')}/`}`
      });
    }
  }

  return results.slice(0, 20);
}

async function getKboingSongDetails(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'pt-BR,pt;q=0.9'
      }
    });
    const html = await response.text();

    let youtubeId = '';
    const ytRegex = /y::([a-zA-Z0-9_-]{11})/g;
    let match;
    while ((match = ytRegex.exec(html)) !== null) {
      youtubeId = match[1];
      break;
    }

    if (!youtubeId) {
      const linkplayRegex = /linkplay\[\d+\]\s*=\s*new\s+Array\([^,]*,\s*"y::([^"]+)"/g;
      while ((match = linkplayRegex.exec(html)) !== null) {
        youtubeId = match[1];
        break;
      }
    }

    const sanitized = sanitizeHtml(html, 'kboing');
    return { youtubeId, html: sanitized };
  } catch (err) {
    console.error('Kboing song details error:', err.message);
    return { youtubeId: '', html: '' };
  }
}

async function getOuvirMusicaSongDetails(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'pt-BR,pt;q=0.9'
      }
    });
    const html = await response.text();

    let youtubeId = '';
    const ytRegex = /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/g;
    let match;
    while ((match = ytRegex.exec(html)) !== null) {
      youtubeId = match[1];
      break;
    }

    if (!youtubeId) {
      const ytIdRegex = /"youtubeId"\s*:\s*"([a-zA-Z0-9_-]{11})"/g;
      while ((match = ytIdRegex.exec(html)) !== null) {
        youtubeId = match[1];
        break;
      }
    }

    if (!youtubeId) {
      const jsonBlocks = [];
      const regex = /<script type="application\/json"[^>]*>(.*?)<\/script>/gs;
      while ((match = regex.exec(html)) !== null) {
        try {
          jsonBlocks.push(JSON.parse(match[1]));
        } catch (e) {}
      }
      for (const block of jsonBlocks) {
        const yt = findYoutubeId(block);
        if (yt) { youtubeId = yt; break; }
      }
    }

    const sanitized = sanitizeHtml(html, 'ouvirmusica');
    return { youtubeId, html: sanitized };
  } catch (err) {
    console.error('OuvirMusica song details error:', err.message);
    return { youtubeId: '', html: '' };
  }
}

function findYoutubeId(obj) {
  if (!obj || typeof obj !== 'object') return null;
  if (obj.youtubeId && typeof obj.youtubeId === 'string' && obj.youtubeId.length === 11) {
    return obj.youtubeId;
  }
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string' && val.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(val) && !val.includes(' ') && key.toLowerCase().includes('youtube')) {
      return val;
    }
    if (typeof val === 'object') {
      const found = findYoutubeId(val);
      if (found) return found;
    }
  }
  return null;
}

app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query || query.length < 2) {
    return res.json({ results: [], error: 'Query muito curta' });
  }

  try {
    const [kboingResults, ouvirmusicaResults] = await Promise.all([
      searchKboing(query),
      searchOuvirMusica(query)
    ]);

    const allResults = [...kboingResults, ...ouvirmusicaResults];

    const seen = new Set();
    const uniqueResults = allResults.filter(r => {
      const key = `${r.title}|${r.artist}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    res.json({ results: uniqueResults, query });
  } catch (err) {
    console.error('Search error:', err);
    res.json({ results: [], error: err.message });
  }
});

app.get('/api/song', async (req, res) => {
  const { url, source } = req.query;
  if (!url) return res.status(400).json({ error: 'URL não informada' });

  try {
    let details;
    if (source === 'kboing') {
      details = await getKboingSongDetails(url);
    } else {
      details = await getOuvirMusicaSongDetails(url);
    }
    res.json(details);
  } catch (err) {
    console.error('Song details error:', err);
    res.json({ youtubeId: '', html: '', error: err.message });
  }
});

app.get('/api/proxy-page', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('URL required');

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'pt-BR,pt;q=0.9'
      }
    });
    let html = await response.text();
    html = sanitizeHtml(html, url.includes('kboing') ? 'kboing' : 'ouvirmusica');
    res.send(html);
  } catch (err) {
    res.status(500).send('Error fetching page');
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`SPOTFY rodando em http://localhost:${PORT}`);
});