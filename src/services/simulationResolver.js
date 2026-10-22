import phetSimulations from '../data/phetSimulations.json'

const DIRECT_FALLBACK_MAP = {
  velocity: 'https://phet.colorado.edu/sims/html/moving-man/latest/moving-man_en.html',
  acceleration: 'https://phet.colorado.edu/sims/html/moving-man/latest/moving-man_en.html',
  gravity: 'https://phet.colorado.edu/sims/html/gravity-force-lab/latest/gravity-force-lab_en.html',
  electricity: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html',
  electric: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html',
  circuit: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html',
  wave: 'https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_en.html',
  waves: 'https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_en.html',
  force: 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_en.html',
  energy: 'https://phet.colorado.edu/sims/html/energy-skate-park/latest/energy-skate-park_en.html',
}

const STOPWORDS = new Set([
  'what',
  'is',
  'the',
  'a',
  'an',
  'of',
  'for',
  'and',
  'to',
  'in',
  'on',
  'about',
  'with',
  'how',
  'explain',
  'topic',
  'simulation',
  'simulations',
  'interactive',
  'find',
])

const QUERY_SYNONYMS = {
  velocity: ['speed', 'motion', 'kinematics'],
  acceleration: ['motion', 'kinematics', 'force'],
  gravity: ['gravitation', 'mass', 'orbit'],
  projectile: ['motion', 'trajectory', 'kinematics'],
  electricity: ['electric', 'current', 'voltage', 'circuit', 'resistance'],
  circuit: ['electric', 'current', 'voltage', 'resistance'],
  'ohms law': ['ohm', 'resistance', 'current', 'voltage', 'circuit'],
  wave: ['waves', 'interference', 'frequency', 'wavelength'],
  sound: ['waves', 'frequency', 'amplitude'],
  gas: ['pressure', 'volume', 'temperature', 'thermodynamics'],
  quantum: ['atom', 'photon', 'electron', 'tunneling'],
  chemistry: ['reaction', 'molecule', 'acid', 'base', 'equation'],
}

const PHRASE_BOOSTS = [
  { phrase: 'ohm', slug: 'circuit-construction-kit-dc' },
  { phrase: 'ohms law', slug: 'circuit-construction-kit-dc' },
  { phrase: 'projectile', slug: 'projectile-motion' },
  { phrase: 'newton', slug: 'forces-and-motion-basics' },
  { phrase: 'acid base', slug: 'acid-base-solutions' },
  { phrase: 'photoelectric', slug: 'photoelectric' },
  { phrase: 'quantum tunneling', slug: 'quantum-tunneling-and-wave-packets' },
  { phrase: 'wave interference', slug: 'wave-interference' },
]

const INTENT_OVERRIDES = [
  { when: ['velocity', 'projectile'], slug: 'projectile-motion' },
  { when: ['projectile'], slug: 'projectile-motion' },
  { when: ['velocity'], slug: 'forces-and-motion-basics' },
  { when: ['newton'], slug: 'forces-and-motion-basics' },
  { when: ['gravity'], slug: 'gravity-force-lab' },
  { when: ['circuit', 'current', 'voltage'], slug: 'circuit-construction-kit-dc' },
  { when: ['ohm'], slug: 'ohms-law' },
  { when: ['acid', 'base'], slug: 'acid-base-solutions' },
  { when: ['wave', 'interference'], slug: 'wave-interference' },
  { when: ['gas', 'pressure', 'volume'], slug: 'gas-properties' },
  { when: ['photoelectric'], slug: 'models-of-the-hydrogen-atom' },
  { when: ['quantum', 'tunnel'], slug: 'models-of-the-hydrogen-atom' },
]

const POPULAR_FALLBACK_SLUGS = [
  'forces-and-motion-basics',
  'wave-interference',
  'circuit-construction-kit-dc',
]

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s/+.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function stemToken(token) {
  let t = token
  if (t.endsWith("'s")) t = t.slice(0, -2)
  if (t.endsWith('ies') && t.length > 4) return `${t.slice(0, -3)}y`
  if (t.endsWith('ing') && t.length > 5) return t.slice(0, -3)
  if (t.endsWith('ed') && t.length > 4) return t.slice(0, -2)
  if (t.endsWith('es') && t.length > 4) return t.slice(0, -2)
  if (t.endsWith('s') && t.length > 3) return t.slice(0, -1)
  return t
}

function tokenize(text) {
  return normalizeText(text)
    .split(' ')
    .map(stemToken)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token))
}

function makeBigrams(tokens) {
  const output = []
  for (let i = 0; i < tokens.length - 1; i += 1) {
    output.push(`${tokens[i]} ${tokens[i + 1]}`)
  }
  return output
}

function expandTokens(normalizedQuery, tokens) {
  const expanded = new Set(tokens)

  for (const [needle, synonyms] of Object.entries(QUERY_SYNONYMS)) {
    if (normalizedQuery.includes(needle)) {
      for (const synonym of synonyms) {
        const normalized = stemToken(normalizeText(synonym))
        if (normalized && normalized.length > 2) expanded.add(normalized)
      }
    }
  }

  return [...expanded]
}

function indexOfWholeToken(haystack, token) {
  return (
    haystack.includes(` ${token} `) ||
    haystack.startsWith(`${token} `) ||
    haystack.endsWith(` ${token}`) ||
    haystack === token
  )
}

function scoreSimulation(query, tokens, sim) {
  const searchable = sim.searchText || normalizeText(`${sim.title} ${sim.description} ${sim.keywords?.join(' ') || ''}`)
  const title = normalizeText(sim.title)
  const slug = normalizeText(sim.slug)
  const keywords = normalizeText((sim.keywords || []).join(' '))
  let score = 0

  if (query && title.includes(query)) score += 20
  if (query && slug.includes(query)) score += 26

  for (const boost of PHRASE_BOOSTS) {
    if (query.includes(boost.phrase) && slug.includes(boost.slug)) score += 40
  }

  for (const token of tokens) {
    if (indexOfWholeToken(slug, token)) score += 10
    if (indexOfWholeToken(title, token)) score += 9
    if (indexOfWholeToken(keywords, token)) score += 8
    if (indexOfWholeToken(searchable, token)) score += 4
    else if (searchable.includes(token)) score += 2
  }

  const queryBigrams = makeBigrams(tokens)
  for (const bg of queryBigrams) {
    if (title.includes(bg)) score += 8
    if (keywords.includes(bg)) score += 7
    if (slug.includes(bg)) score += 9
  }

  // Short slugs can dominate noise; this keeps results topical.
  if (tokens.length > 0 && !tokens.some((t) => indexOfWholeToken(searchable, t))) {
    score -= 8
  }

  return score
}

function countTokenHits(sim, tokens) {
  const searchable = sim.searchText || normalizeText(`${sim.title} ${sim.description} ${sim.keywords?.join(' ') || ''}`)
  let hits = 0
  for (const token of tokens) {
    if (indexOfWholeToken(searchable, token)) hits += 1
  }
  return hits
}

function rankSimulations(query, tokens) {
  const ranked = phetSimulations
    .map((sim) => {
      const score = scoreSimulation(query, tokens, sim)
      const tokenHits = countTokenHits(sim, tokens)
      const coverage = tokens.length ? tokenHits / tokens.length : 0
      return { sim, score, tokenHits, coverage }
    })
    .sort((a, b) => b.score - a.score)

  return ranked
}

function findSimBySlug(slugFragment) {
  const needle = normalizeText(slugFragment)
  return phetSimulations.find((sim) => normalizeText(sim.slug).includes(needle)) || null
}

function resolveIntentOverride(query) {
  for (const rule of INTENT_OVERRIDES) {
    if (rule.when.every((token) => query.includes(token))) {
      return findSimBySlug(rule.slug)
    }
  }
  return null
}

function resolveFromIndex(query) {
  const normalized = normalizeText(query)
  if (!normalized) return null

  const override = resolveIntentOverride(normalized)
  if (override) return override

  const tokens = expandTokens(normalized, tokenize(normalized))
  const ranked = rankSimulations(normalized, tokens)
  const bestEntry = ranked[0]
  const secondEntry = ranked[1]
  const best = bestEntry?.sim || null
  const bestScore = bestEntry?.score || 0
  const secondBest = secondEntry?.score || 0
  const margin = bestScore - secondBest
  const tokenHits = bestEntry?.tokenHits || 0
  const coverage = bestEntry?.coverage || 0

  if (bestScore < 16) return null
  if (coverage >= 0.28 && (bestScore >= 24 || margin >= 4)) return best
  if (bestScore >= 40 && tokenHits >= 2) return best

  // Top-3 fallback mode: increase recall when strict confidence fails.
  // Choose the first candidate that clears minimum safety checks.
  const topThree = ranked.slice(0, 3)
  const fallback = topThree.find((entry) => {
    const strongEnough = entry.score >= 14
    const coverageEnough = entry.coverage >= 0.22
    const tokenHitsEnough = entry.tokenHits >= 2
    return strongEnough && coverageEnough && tokenHitsEnough
  })

  if (fallback) return fallback.sim

  if (coverage < 0.28 && bestScore < 40) return null
  if (bestScore < 24 && margin < 4) return null
  return best
}

export function getSimulationSuggestions(query, limit = 3) {
  const normalized = normalizeText(query)
  if (!normalized) return []

  const override = resolveIntentOverride(normalized)
  if (override?.runUrl) {
    return [
      {
        title: override.title,
        runUrl: override.runUrl,
        simPageUrl: override.simPageUrl || '',
      },
    ]
  }

  const tokens = expandTokens(normalized, tokenize(normalized))
  const ranked = rankSimulations(normalized, tokens)
  const related = ranked
    .filter((entry) => entry.score >= 12 && entry.coverage >= 0.24 && entry.tokenHits >= 2)
    .slice(0, Math.max(1, limit))
    .map((entry) => ({
      title: entry.sim.title,
      runUrl: entry.sim.runUrl,
      simPageUrl: entry.sim.simPageUrl || '',
    }))

  if (related.length) return related

  return POPULAR_FALLBACK_SLUGS
    .map((slug) => findSimBySlug(slug))
    .filter(Boolean)
    .slice(0, Math.max(1, limit))
    .map((sim) => ({
      title: sim.title,
      runUrl: sim.runUrl,
      simPageUrl: sim.simPageUrl || '',
    }))
}

export function getSimulationUrl(query) {
  const normalized = normalizeText(query)
  if (!normalized) return ''

  const match = resolveFromIndex(normalized)
  if (match?.runUrl) return match.runUrl

  const direct = DIRECT_FALLBACK_MAP[normalized]
  if (direct) return direct

  const token = Object.keys(DIRECT_FALLBACK_MAP).find((key) => normalized.includes(key))
  return token ? DIRECT_FALLBACK_MAP[token] : ''
}
