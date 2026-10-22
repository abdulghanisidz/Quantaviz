import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { detectLanguageProfile } from '../../services/languageProfile'
import GlassCard from '../ui/GlassCard'

function pickVoice(voices, lang) {
  const exact = voices.find((voice) => voice.lang?.toLowerCase() === lang.toLowerCase())
  if (exact) return exact
  const family = lang.split('-')[0].toLowerCase()
  return voices.find((voice) => voice.lang?.toLowerCase().startsWith(family)) || null
}

export default function TheoryPanel({ topic, explanation }) {
  const paragraphs = explanation
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const speechProfile = useMemo(() => detectLanguageProfile(topic), [topic])

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel()
    }
  }, [])

  const speakTheory = () => {
    if (!window.speechSynthesis || !explanation.trim()) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(explanation)
    utterance.lang = speechProfile.ttsLang
    const voice = pickVoice(window.speechSynthesis.getVoices(), speechProfile.ttsLang)
    if (voice) utterance.voice = voice
    utterance.rate = 0.95
    utterance.onend = () => {
      setSpeaking(false)
      setPaused(false)
    }
    utterance.onerror = () => {
      setSpeaking(false)
      setPaused(false)
    }
    setSpeaking(true)
    setPaused(false)
    window.speechSynthesis.speak(utterance)
  }

  const pauseTheory = () => {
    if (!window.speechSynthesis) return
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
      setPaused(false)
      return
    }
    window.speechSynthesis.pause()
    setPaused(true)
  }

  const stopTheory = () => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
    setPaused(false)
  }

  return (
    <GlassCard className="h-full min-h-[320px]" glow={false}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--qv-accent)]">
            Theory core
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-white md:text-2xl">
            {topic || 'Your concept'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={speakTheory}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200"
          >
            Listen
          </button>
          <button
            type="button"
            onClick={pauseTheory}
            disabled={!speaking}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button
            type="button"
            onClick={stopTheory}
            disabled={!speaking}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Stop
          </button>
        </div>
      </div>

      <p className="mb-4 text-xs text-slate-500">
        TTS voice: {speechProfile.label}
      </p>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {paragraphs.map((paragraph, index) => (
          <p key={`${index}-${paragraph.slice(0, 32)}`} className="text-sm leading-relaxed text-slate-300">
            {paragraph}
          </p>
        ))}
      </motion.div>
    </GlassCard>
  )
}
