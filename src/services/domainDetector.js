import domainCatalog from '../data/domainCatalog.json'

/** @typedef {'medical' | 'quantum' | 'mechanical' | 'civil' | 'tech' | 'biology' | 'chemistry' | 'data_structures' | 'electrical' | 'mathematics' | 'environmental' | 'default'} DomainId */

const DOMAIN_KEYWORDS = {
  medical: {
    strong: [
      'medicine', 'medical', 'anatomy', 'physiology', 'pathology', 'diagnosis', 'treatment',
      'symptom', 'patient', 'hospital', 'pharmacology', 'immunology', 'cardiology', 'neurology',
      'oncology', 'vaccine',
    ],
    weak: ['blood', 'organ', 'tissue', 'disease', 'therapy', 'clinical'],
  },
  biology: {
    strong: [
      'biology', 'botany', 'zoology', 'ecology', 'cell biology', 'genetics', 'evolution',
      'photosynthesis', 'respiration', 'enzyme', 'mitosis', 'meiosis', 'dna', 'rna',
    ],
    weak: ['cell', 'organism', 'species', 'protein', 'chromosome', 'bacteria'],
  },
  chemistry: {
    strong: [
      'chemistry', 'organic chemistry', 'inorganic chemistry', 'chemical bonding', 'stoichiometry',
      'mole concept', 'acid base', 'reaction mechanism', 'electrochemistry', 'thermochemistry',
      'periodic table', 'equilibrium',
    ],
    weak: ['atom', 'molecule', 'compound', 'reaction', 'acid', 'base', 'ph', 'salt'],
  },
  quantum: {
    strong: [
      'quantum', 'qubit', 'entanglement', 'superposition', 'uncertainty principle',
      'wave function', 'schrodinger', 'heisenberg', 'particle physics', 'atomic orbital',
      'quantum tunneling', 'spin state',
    ],
    weak: ['photon', 'boson', 'fermion', 'planck', 'decoherence'],
  },
  mechanical: {
    strong: [
      'mechanical', 'mechanics', 'kinematics', 'dynamics', 'thermodynamics', 'fluid dynamics',
      'machine design', 'heat transfer', 'strength of materials', 'stress strain', 'torque',
      'gear', 'engine', 'turbine', 'refrigeration', 'hvac',
    ],
    weak: [
      'velocity', 'acceleration', 'force', 'momentum', 'friction', 'newton', 'work', 'power',
      'pressure', 'mass', 'energy', 'projectile', 'motion', 'spring', 'pendulum',
    ],
  },
  civil: {
    strong: [
      'civil engineering', 'structural', 'reinforced concrete', 'geotechnical', 'foundation',
      'surveying', 'transportation engineering', 'highway', 'bridge', 'dam',
      'construction management', 'soil mechanics', 'urban planning',
    ],
    weak: ['concrete', 'beam', 'column', 'slab', 'retaining wall', 'infrastructure'],
  },
  electrical: {
    strong: [
      'electrical engineering', 'power systems', 'circuit analysis', 'transformer', 'alternator',
      'motor', 'generator', 'three phase', 'control systems', 'electromagnetics', 'power factor',
    ],
    weak: ['circuit', 'voltage', 'current', 'resistance', 'capacitance', 'inductance'],
  },
  data_structures: {
    strong: [
      'data structures', 'linked list', 'binary tree', 'graph traversal', 'stack', 'queue',
      'heap', 'hash table', 'binary search tree', 'dfs', 'bfs', 'dynamic programming',
    ],
    weak: ['algorithm', 'array', 'node', 'pointer', 'recursion', 'sorting'],
  },
  mathematics: {
    strong: [
      'mathematics', 'algebra', 'calculus', 'linear algebra', 'probability', 'statistics',
      'trigonometry', 'differential equation', 'integration', 'derivative', 'matrix',
    ],
    weak: ['equation', 'function', 'theorem', 'integral', 'limit', 'vector'],
  },
  environmental: {
    strong: [
      'environmental science', 'climate change', 'ecosystem', 'sustainability', 'biodiversity',
      'pollution', 'greenhouse effect', 'carbon cycle', 'water treatment', 'renewable energy',
    ],
    weak: ['environment', 'habitat', 'conservation', 'waste management', 'air quality'],
  },
  tech: {
    strong: [
      'technology', 'technical', 'computer science', 'programming', 'software engineering',
      'iot', 'internet of things', 'embedded system', 'firmware', 'microcontroller',
      'sensor network', 'edge device', 'mqtt', 'zigbee', 'ble', 'esp32', 'arduino',
      'raspberry pi', 'api', 'database', 'javascript', 'python', 'react', 'cloud computing',
      'operating system', 'networking', 'cybersecurity',
    ],
    weak: ['actuator', 'telemetry', 'wifi module', 'node mcu', 'esp8266', 'lora', 'gateway', 'code'],
  },
}

const DOMAIN_ORDER = /** @type {DomainId[]} */ ([
  'medical',
  'biology',
  'chemistry',
  'quantum',
  'mechanical',
  'civil',
  'electrical',
  'data_structures',
  'mathematics',
  'environmental',
  'tech',
  'default',
])

function normalizeInput(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s/+.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function countHits(text, phrase) {
  if (!phrase) return 0
  if (phrase.includes(' ')) return text.includes(phrase) ? 1 : 0
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`\\b${escaped}\\b`, 'g')
  return (text.match(re) || []).length
}

/**
 * @param {string} text
 * @returns {DomainId}
 */
export function detectDomain(text) {
  const t = normalizeInput(text)
  if (!t) return 'default'

  /** @type {Record<Exclude<DomainId, 'default'>, number>} */
  const scores = {
    medical: 0,
    biology: 0,
    chemistry: 0,
    quantum: 0,
    mechanical: 0,
    civil: 0,
    electrical: 0,
    data_structures: 0,
    mathematics: 0,
    environmental: 0,
    tech: 0,
  }

  for (const id of /** @type {Exclude<DomainId, 'default'>[]} */ ([
    'medical',
    'biology',
    'chemistry',
    'quantum',
    'mechanical',
    'civil',
    'electrical',
    'data_structures',
    'mathematics',
    'environmental',
    'tech',
  ])) {
    const bucket = DOMAIN_KEYWORDS[id]
    for (const phrase of bucket.strong) scores[id] += countHits(t, phrase) * 5
    for (const phrase of bucket.weak) scores[id] += countHits(t, phrase) * 2
  }

  let bestDomain = /** @type {DomainId} */ ('default')
  let bestScore = 0

  for (const domain of DOMAIN_ORDER) {
    if (domain === 'default') continue
    const score = scores[domain]
    if (score > bestScore) {
      bestScore = score
      bestDomain = domain
    }
  }

  return bestScore > 0 ? bestDomain : 'default'
}

export const DOMAIN_LABELS = Object.fromEntries(
  Object.entries(domainCatalog).map(([key, value]) => [key, value.label]),
)
