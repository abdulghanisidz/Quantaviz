import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { detectDomain } from '../../services/domainDetector'
import { detectLanguageProfile } from '../../services/languageProfile'

export default function PersistentSearch() {
  const [params] = useSearchParams()
  const qp = params.get('q') || ''
  const [q, setQ] = useState(qp)

  useEffect(() => {
    setQ(qp)
  }, [qp])

  const navigate = useNavigate()
  const { setDomain } = useTheme()
  const speechProfile = useMemo(() => detectLanguageProfile(q), [q])
  const { supported, listening, error, start } = useSpeechRecognition({
    lang: speechProfile.sttLang,
    onResult: setQ,
  })

  const submit = useCallback(() => {
    const topic = q.trim()
    if (!topic) return
    setDomain(detectDomain(topic))
    navigate(`/learn?q=${encodeURIComponent(topic)}`, { replace: true })
  }, [q, navigate, setDomain])

  return (
    <div>
      <motion.div
        className="glass-panel mx-auto flex max-w-3xl items-center gap-2 rounded-2xl border border-white/10 px-3 py-2 md:px-4"
        layout
      >
        <span className="text-[var(--qv-accent)]" aria-hidden>
          *
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Refine your topic..."
          className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-white outline-none placeholder:text-slate-500"
        />
        <button
          type="button"
          onClick={start}
          disabled={!supported}
          className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-[var(--qv-accent)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {listening ? 'Live' : 'Mic'}
        </button>
        <button
          type="button"
          onClick={submit}
          className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-950 md:text-sm"
          style={{
            background: `linear-gradient(135deg, var(--qv-accent), #e2e8f0)`,
          }}
        >
          Update
        </button>
      </motion.div>
      <p className="mt-2 text-center text-xs text-slate-500">
        {error || (listening ? `Listening in ${speechProfile.label}...` : 'You can refine by text or mic.')}
      </p>
    </div>
  )
}
