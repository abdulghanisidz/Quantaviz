const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || ''
const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY || ''
const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY || ''

function normalize(value) {
  return String(value || '').trim()
}

function normalizeLower(value) {
  return normalize(value).toLowerCase()
}

function tokenize(value) {
  return normalizeLower(value)
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2)
}

function buildDomainHints(domain) {
  const map = {
    medical: ['medical', 'anatomy', 'healthcare', 'lab', 'clinical'],
    biology: ['biology', 'cell', 'microscope', 'organism', 'genetics'],
    chemistry: ['chemistry', 'molecule', 'laboratory', 'reaction', 'atom'],
    quantum: ['space', 'quantum', 'physics', 'astronomy', 'cosmos'],
    mechanical: ['mechanical', 'engineering', 'machine', 'motion', 'physics'],
    civil: ['civil engineering', 'infrastructure', 'construction', 'bridge', 'structure'],
    electrical: ['electrical engineering', 'circuit', 'power systems', 'voltage', 'electronics'],
    data_structures: ['computer science', 'algorithm', 'code', 'data structure', 'programming'],
    mathematics: ['mathematics', 'equation', 'geometry', 'calculus', 'algebra'],
    environmental: ['environment', 'ecosystem', 'climate', 'sustainability', 'nature'],
    tech: ['technology', 'electronics', 'sensor', 'embedded', 'circuit'],
    default: ['education', 'science'],
  }
  return map[domain] || map.default
}

function buildPexelsQuery(query, domain) {
  const base = normalize(query)
  const hints = buildDomainHints(domain)
  return [base, ...hints].filter(Boolean).join(' ')
}

function scorePexelsPhoto(photo, queryTokens, domain) {
  const alt = normalizeLower(photo?.alt)
  if (!alt) return 0

  let score = 0
  for (const token of queryTokens) {
    if (alt.includes(token)) score += 4
  }
  for (const hint of buildDomainHints(domain)) {
    if (alt.includes(normalizeLower(hint))) score += 3
  }
  return score
}

function isSpaceTopic(topic, domain) {
  const t = normalizeLower(topic)
  if (domain === 'quantum') return true
  return [
    'space',
    'astronomy',
    'planet',
    'orbit',
    'galaxy',
    'black hole',
    'nasa',
    'cosmic',
    'mars',
    'moon',
    'star',
  ].some((token) => t.includes(token))
}

export async function fetchYouTubeVideoId(query) {
  if (!YOUTUBE_API_KEY || !normalize(query)) return { videoId: '', error: 'missing_key' }
  const url =
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true` +
    `&maxResults=1&safeSearch=strict&q=${encodeURIComponent(query)}&key=${encodeURIComponent(YOUTUBE_API_KEY)}`

  const response = await fetch(url)
  if (!response.ok) {
    let reason = 'request_failed'
    try {
      const errorPayload = await response.json()
      reason = errorPayload?.error?.errors?.[0]?.reason || reason
    } catch {
      reason = response.status === 403 ? 'forbidden' : reason
    }
    return { videoId: '', error: reason }
  }

  const data = await response.json()
  return { videoId: data?.items?.[0]?.id?.videoId || '', error: '' }
}

export async function fetchPexelsImage(query, domain = 'default') {
  if (!PEXELS_API_KEY || !normalize(query)) return ''

  const searchQuery = buildPexelsQuery(query, domain)
  const queryTokens = tokenize(searchQuery)

  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=8&orientation=landscape`,
    {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    },
  )

  if (!response.ok) return ''

  const data = await response.json()
  const photos = Array.isArray(data?.photos) ? data.photos : []
  if (!photos.length) return ''

  const ranked = photos
    .map((photo) => ({ photo, score: scorePexelsPhoto(photo, queryTokens, domain) }))
    .sort((a, b) => b.score - a.score)

  const chosen = ranked[0]?.photo || photos[0]
  return chosen?.src?.large2x || chosen?.src?.large || ''
}

export async function fetchNasaImage(topic, domain) {
  if (!NASA_API_KEY) return ''
  if (!isSpaceTopic(topic, domain)) return ''

  const response = await fetch(
    `https://api.nasa.gov/planetary/apod?api_key=${encodeURIComponent(NASA_API_KEY)}`,
  )
  if (!response.ok) return ''

  const data = await response.json()
  if (data?.media_type !== 'image') return ''
  return data?.hdurl || data?.url || ''
}
