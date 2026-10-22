import { useEffect, useId, useRef, useState } from 'react'
import { loadMermaid } from '../../services/mermaidLoader'
import GlassCard from '../ui/GlassCard'

function sanitizeMermaidSource(source) {
  const raw = String(source || '').trim()
  if (!raw) return ''

  if (raw.startsWith('```')) {
    const match = raw.match(/```(?:mermaid)?\s*([\s\S]*?)```/i)
    if (match?.[1]) return match[1].trim()
  }

  const lower = raw.toLowerCase()
  const startIndex = ['flowchart', 'graph', 'sequencediagram', 'classdiagram', 'statediagram']
    .map((token) => lower.indexOf(token))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0]

  if (typeof startIndex === 'number') {
    return raw.slice(startIndex).trim()
  }

  return ''
}

export default function MermaidPanel({ source, labels = [], steps = [] }) {
  const containerRef = useRef(null)
  const [err, setErr] = useState(null)
  const uid = useId().replace(/:/g, '')
  const cleanedSource = sanitizeMermaidSource(source)

  useEffect(() => {
    let cancelled = false
    const el = containerRef.current
    if (!el) return undefined

    // Always clear stale diagram/error markup when source changes.
    el.innerHTML = ''
    if (!cleanedSource) {
      setErr(null)
      return undefined
    }

    const run = async () => {
      setErr(null)
      try {
        const mermaid = await loadMermaid()
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          fontFamily: 'DM Sans, sans-serif',
        })
        const parseResult = await mermaid.parse(cleanedSource, { suppressErrors: true })
        if (!parseResult) throw new Error('Invalid Mermaid source')
        const id = `mmd-${uid}-${Math.random().toString(36).slice(2)}`
        const { svg } = await mermaid.render(id, cleanedSource)
        if (!cancelled) el.innerHTML = svg
      } catch {
        if (!cancelled) {
          setErr('Diagram preview unavailable.')
          el.innerHTML = ''
        }
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [cleanedSource, uid])

  return (
    <GlassCard className="overflow-hidden">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
          Concept diagram
        </h3>
        <span className="rounded-full bg-[var(--qv-accent-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--qv-accent)]">
          Mermaid
        </span>
      </div>
      <div
        ref={containerRef}
        className="flex min-h-[180px] items-center justify-center overflow-x-auto rounded-xl bg-slate-950/50 p-4"
      >
        {!cleanedSource ? <p className="text-xs text-slate-500">No Mermaid flowchart provided for this topic.</p> : null}
      </div>
      {err && <p className="mt-2 text-center text-xs text-rose-400">{err}</p>}
      {labels.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {labels.map((label, index) => (
            <span
              key={`${label}-${index}`}
              className="rounded-full border border-white/10 bg-slate-900/50 px-2 py-1 text-[11px] text-slate-300"
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}
      {steps.length ? (
        <div className="mt-3 space-y-1">
          {steps.map((step, index) => (
            <p key={`${step}-${index}`} className="text-xs text-slate-400">
              {index + 1}. {step}
            </p>
          ))}
        </div>
      ) : null}
    </GlassCard>
  )
}
