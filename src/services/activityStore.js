const SEARCH_HISTORY_KEY = 'qv:search-history'
const QUIZ_PROGRESS_KEY = 'qv:quiz-progress'

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export function addLocalSearchHistory(entry) {
  const current = readJson(SEARCH_HISTORY_KEY, [])
  const next = [
    {
      ...entry,
      createdAtMs: Date.now(),
    },
    ...current,
  ].slice(0, 30)
  writeJson(SEARCH_HISTORY_KEY, next)
  return next
}

export function getLocalSearchHistory() {
  return readJson(SEARCH_HISTORY_KEY, [])
}

export function addLocalQuizProgress(entry) {
  const current = readJson(QUIZ_PROGRESS_KEY, [])
  const next = [
    {
      ...entry,
      createdAtMs: Date.now(),
    },
    ...current,
  ].slice(0, 50)
  writeJson(QUIZ_PROGRESS_KEY, next)
  return next
}

export function getLocalQuizProgress() {
  return readJson(QUIZ_PROGRESS_KEY, [])
}
