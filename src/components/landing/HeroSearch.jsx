import { motion } from 'framer-motion'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { detectDomain } from '../../services/domainDetector'
import { detectLanguageProfile } from '../../services/languageProfile'
import EnergyOrb from './EnergyOrb'
import DomainFloaters from './DomainFloaters'

export default function HeroSearch() {
  const [q, setQ] = useState('')
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
    const domain = detectDomain(topic)
    setDomain(domain)
    navigate(`/learn?q=${encodeURIComponent(topic)}`)
  }, [q, navigate, setDomain])

  const onVoice = useCallback(() => {
    start()
  }, [start])

  return (
    <section className="relative mx-auto flex min-h-[calc(100vh-88px)] max-w-6xl flex-col items-center justify-center px-4 pb-24 pt-10 md:pb-32">
      <div className="relative mb-10 w-full max-w-[1120px]">
        <DomainFloaters />
        <EnergyOrb />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.55 }}
      >
        <p className="mb-4 text-center font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Ask the <span className="text-[var(--qv-accent)]">future</span> of learning
        </p>
        <p className="mb-8 text-center text-sm text-slate-400 md:text-base">
          Theory, diagrams, 3D, simulations, media, and quizzes unified in one intelligent canvas.
        </p>

        <div className="flex gap-2">
          <div className="glass-panel relative flex flex-1 items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 shadow-[0_0_40px_var(--qv-accent-soft)]">
            <span className="text-[var(--qv-accent)]" aria-hidden>
              *
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="Ask anything..."
              className="min-w-0 flex-1 bg-transparent py-2 text-sm text-white outline-none placeholder:text-slate-500 md:text-base"
              aria-label="Topic or question"
            />
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: supported ? 1.03 : 1 }}
            whileTap={{ scale: supported ? 0.97 : 1 }}
            onClick={onVoice}
            disabled={!supported}
            className="glass-panel flex h-12 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 text-sm font-semibold text-[var(--qv-accent)] disabled:cursor-not-allowed disabled:opacity-50 md:h-[52px] md:w-[72px]"
            aria-label="Voice input"
          >
            {listening ? 'Live' : 'Mic'}
          </motion.button>
        </div>
        <p className="mt-3 text-center text-xs text-slate-500">
          {error || (listening ? `Listening in ${speechProfile.label}...` : 'Type or speak in your own language.')}
        </p>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={submit}
          className="mt-4 w-full rounded-2xl py-3 text-sm font-semibold text-slate-950 md:text-base"
          style={{
            background: `linear-gradient(135deg, var(--qv-accent), #e2e8f0)`,
            boxShadow: `0 0 32px var(--qv-accent-glow)`,
          }}
        >
          Visualize concept
        </motion.button>
      </motion.div>
    </section>
  )
}
