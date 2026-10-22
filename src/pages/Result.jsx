import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import MediaPanels from '../components/result/MediaPanels'
import MermaidPanel from '../components/result/MermaidPanel'
import Model3DPanel from '../components/result/Model3DPanel'
import PersistentSearch from '../components/result/PersistentSearch'
import PhETPanel from '../components/result/PhETPanel'
import QuizPanel from '../components/result/QuizPanel'
import TheoryPanel from '../components/result/TheoryPanel'
import { addLocalSearchHistory } from '../services/activityStore'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { getConcept } from '../services/conceptApi'
import { DOMAIN_LABELS, detectDomain } from '../services/domainDetector'
import { detectLanguageProfile } from '../services/languageProfile'
import { logSearchHistory } from '../services/firestoreService'
import { getSimulationSuggestions, getSimulationUrl } from '../services/simulationResolver'

const EMPTY_RESULT = {
  status: 'success',
  reason: '',
  message: '',
  domain: 'default',
  explanation: '',
  flowchart: '',
  visual_type: 'none',
  visual_data: {
    title: '',
    description: '',
    labels: [],
    steps: [],
    simulation_query: '',
  },
  quiz: [],
}

function normalizeVisualData(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return {
      title: String(value.title || ''),
      description: String(value.description || ''),
      labels: Array.isArray(value.labels) ? value.labels : [],
      steps: Array.isArray(value.steps) ? value.steps : [],
      simulation_query: String(value.simulation_query || value.simulationQuery || ''),
    }
  }

  if (typeof value === 'string') {
    return {
      title: '',
      description: value,
      labels: [],
      steps: [],
      simulation_query: value,
    }
  }

  return EMPTY_RESULT.visual_data
}

function hasMeaningfulValue(value) {
  if (!value) return false
  const normalized = String(value).trim().toLowerCase()
  return normalized !== 'none' && normalized !== 'null' && normalized !== 'n/a'
}

function cleanVisualLabel(value) {
  const text = String(value || '').trim()
  if (!text) return ''
  const normalized = text.toLowerCase()
  if (
    normalized.includes('simplified block diagram') ||
    normalized.includes('esp32 microcontroller')
  ) {
    return ''
  }
  return text
}

export default function Result() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const topic = params.get('q')?.trim() || ''
  const { setDomain, domainTheme } = useTheme()
  const { user } = useAuth()

  const [concept, setConcept] = useState(EMPTY_RESULT)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!topic) {
      navigate('/', { replace: true })
      return
    }
    setDomain(detectDomain(topic))
  }, [topic, navigate, setDomain])

  useEffect(() => {
    let active = true

    if (!topic) return undefined

    setLoading(true)
    setError('')
    setConcept(EMPTY_RESULT)

    getConcept(topic)
      .then((data) => {
        if (!active) return
        setConcept({
          status: data?.status || 'success',
          reason: data?.reason || '',
          message: data?.message || '',
          domain: data?.domain || 'default',
          explanation: data?.explanation || '',
          flowchart: data?.flowchart || '',
          visual_type: data?.visual_type || 'none',
          visual_data: normalizeVisualData(data?.visual_data),
          quiz: Array.isArray(data?.quiz) ? data.quiz : [],
        })
        const apiDomain = String(data?.domain || '').toLowerCase()
        const isKnownDomain = Object.prototype.hasOwnProperty.call(DOMAIN_LABELS, apiDomain)
        setDomain(isKnownDomain ? apiDomain : detectDomain(topic))
      })
      .catch((err) => {
        if (!active) return
        setConcept(EMPTY_RESULT)
        setError(err?.response?.data?.detail?.message || err?.message || 'Failed to load topic.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [topic])

  useEffect(() => {
    if (!topic || loading || error) return
    if (concept.status === 'rejected') return
    const domainToStore = Object.prototype.hasOwnProperty.call(DOMAIN_LABELS, concept.domain)
      ? concept.domain
      : detectDomain(topic)
    const language = detectLanguageProfile(topic).label
    addLocalSearchHistory({ topic, domain: domainToStore, language })
    if (!user || !topic) return
    logSearchHistory(user.uid, { topic, domain: domainToStore, language }).catch(() => {})
  }, [user, topic, concept.domain, loading, error, concept.status])

  const visualData = normalizeVisualData(concept.visual_data)

  const visualDescription = cleanVisualLabel(visualData.description || visualData.title || '')
  const isRejected = concept.status === 'rejected'
  const resolvedDomain = Object.prototype.hasOwnProperty.call(DOMAIN_LABELS, concept.domain)
    ? concept.domain
    : detectDomain(topic)
  const simulationQuery = visualData.simulation_query || topic
  const simulationUrl = getSimulationUrl(simulationQuery)
  const simulationSuggestions = simulationUrl ? [] : getSimulationSuggestions(simulationQuery, 3)

  const showTheory = hasMeaningfulValue(concept.explanation)
  const showDiagram =
    concept.visual_type === 'diagram' ||
    hasMeaningfulValue(concept.flowchart) ||
    visualData.labels.length > 0 ||
    visualData.steps.length > 0
  const show3D = concept.visual_type === 'animation' && hasMeaningfulValue(visualDescription)
  const showSimulation =
    concept.visual_type === 'simulation' || Boolean(simulationUrl) || simulationSuggestions.length > 0
  const showQuiz = concept.quiz.length > 0

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative min-h-screen pb-16">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[360px] opacity-90"
        style={{ background: domainTheme?.aura || 'var(--qv-domain-aura)' }}
      />
      <div className="border-b border-white/[0.06] bg-slate-950/40 py-4 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <PersistentSearch />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {loading ? (
          <div className="glass-panel mb-8 rounded-2xl px-4 py-6 text-sm text-slate-300">
            Loading topic...
          </div>
        ) : null}

        {error ? (
          <div className="glass-panel mb-8 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-4 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {isRejected ? (
          <div className="mx-auto max-w-2xl">
            <div className="glass-panel rounded-3xl border border-rose-400/25 bg-rose-500/10 px-6 py-8 text-center shadow-[0_0_60px_rgba(244,63,94,0.12)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-300">
                Content Restricted
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-white md:text-3xl">
                Sorry, can't help with this one
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-rose-100/90">
                {concept.message || 'Please try a different educational topic.'}
              </p>
              <button
                type="button"
                onClick={() => navigate('/', { replace: false })}
                className="mt-6 rounded-2xl px-5 py-3 text-sm font-semibold text-slate-950"
                style={{
                  background: 'linear-gradient(135deg, #fb7185, #fecdd3)',
                }}
              >
                Try another topic
              </button>
            </div>
          </div>
        ) : (
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <motion.div layout className="flex w-full shrink-0 flex-col gap-8 lg:w-[40%]">
            {showTheory ? (
              <motion.div id="panel-theory" layout>
                <TheoryPanel topic={topic} explanation={concept.explanation} />
              </motion.div>
            ) : null}
            {showQuiz ? (
              <motion.div
                id="panel-quiz"
                layout
                transition={{ duration: 0.28 }}
                className="hidden lg:block"
              >
                <QuizPanel topic={topic} questions={concept.quiz} />
              </motion.div>
            ) : null}
          </motion.div>

          <div id="panel-visuals" className="flex w-full flex-1 flex-col gap-6 lg:w-[60%]">
            <div
              className="glass-panel rounded-2xl border border-white/10 px-4 py-3"
              style={{ background: 'color-mix(in srgb, var(--qv-domain-surface) 74%, transparent)' }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--qv-accent)]">
                    Active domain
                  </p>
                  <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold text-white">
                    {DOMAIN_LABELS[resolvedDomain] || DOMAIN_LABELS.default}
                  </h2>
                </div>
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                  style={{ background: 'var(--qv-accent-soft)' }}
                >
                  {resolvedDomain.replace('_', ' ')}
                </span>
              </div>
            </div>
            {showDiagram ? (
              <MermaidPanel source={concept.flowchart} labels={visualData.labels} steps={visualData.steps} />
            ) : null}
            {show3D ? <Model3DPanel label={visualDescription} /> : null}
            {showSimulation ? (
              <div id="panel-sim">
                <PhETPanel
                  label={visualDescription || cleanVisualLabel(visualData.simulation_query)}
                  simulationUrl={simulationUrl}
                  suggestions={simulationSuggestions}
                />
              </div>
            ) : null}
            <MediaPanels topic={topic} visualData={visualData} domain={resolvedDomain} loading={loading} />
          </div>

          {showQuiz ? (
            <motion.div
              id="panel-quiz-mobile"
              layout
              transition={{ duration: 0.28 }}
              className="w-full lg:hidden"
            >
              <QuizPanel topic={topic} questions={concept.quiz} />
            </motion.div>
          ) : null}
        </div>
        )}
      </main>
    </motion.div>
  )
}
