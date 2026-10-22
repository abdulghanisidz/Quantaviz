import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const METADATA_URL =
  'https://phet.colorado.edu/services/metadata/1.3/simulations?format=json&type=html&locale=en'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const outputPath = path.join(rootDir, 'src', 'data', 'phetSimulations.json')

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s/+.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function fetchMetadata() {
  const response = await fetch(METADATA_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch PhET metadata (${response.status})`)
  }
  return response.json()
}

function buildKeywordMap(data) {
  const map = new Map()
  const keywords = Array.isArray(data?.keywords) ? data.keywords : []
  for (const keyword of keywords) {
    const id = keyword?.id
    const label =
      keyword?.strings?.find((entry) => entry?.en)?.en ||
      keyword?.strings?.[0]?.en ||
      keyword?.key ||
      ''
    if (typeof id === 'number' && label) {
      map.set(id, label)
    }
  }
  return map
}

function buildSimulationIndex(data) {
  const projects = Array.isArray(data?.projects) ? data.projects : []
  const keywordMap = buildKeywordMap(data)
  const rows = []

  for (const project of projects) {
    const simulations = Array.isArray(project?.simulations) ? project.simulations : []
    for (const sim of simulations) {
      const localized = sim?.localizedSimulations?.en
      const runUrl = localized?.runUrl
      if (!runUrl || !runUrl.includes('/sims/html/')) continue

      const keywords = Array.isArray(sim?.keywordIds)
        ? sim.keywordIds.map((id) => keywordMap.get(id)).filter(Boolean)
        : []

      const title = localized?.title || sim?.name || project?.name || 'PhET Simulation'
      const description = localized?.description || ''
      const slug = String(sim?.name || project?.name || '')
        .replace(/^html\//, '')
        .trim()

      rows.push({
        id: Number(sim?.id || 0),
        slug,
        title: String(title),
        runUrl: `https://phet.colorado.edu${runUrl}`,
        simPageUrl: localized?.simPageUrl
          ? `https://phet.colorado.edu${localized.simPageUrl}`
          : '',
        description: String(description),
        keywords: keywords.map((k) => String(k)),
        searchText: normalizeText(`${title} ${description} ${keywords.join(' ')} ${slug}`),
      })
    }
  }

  rows.sort((a, b) => a.title.localeCompare(b.title))
  return rows
}

async function main() {
  const data = await fetchMetadata()
  const index = buildSimulationIndex(data)

  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, `${JSON.stringify(index, null, 2)}\n`, 'utf8')

  console.log(`Saved ${index.length} PhET simulations -> ${outputPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

