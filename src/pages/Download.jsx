import { motion } from 'framer-motion'

const APK_URL =
  import.meta.env.VITE_APK_URL ||
  'https://drive.google.com/drive/folders/placeholder-replace-with-your-apk-link'

const BULLETS = [
  'Learn concepts visually',
  'AI-powered explanations',
  'Interactive simulations',
  'Works offline (limited mode)',
  'Smooth mobile UI',
]

export default function Download() {
  const openApk = () => {
    window.open(APK_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <main className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center px-4 py-16 md:py-24">
      <motion.div
        className="glass-panel flex max-w-md flex-col items-center rounded-3xl border border-white/10 px-8 py-12 text-center shadow-[0_0_80px_var(--qv-accent-soft)]"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
      >
        <motion.div
          className="mb-8 flex h-28 w-28 items-center justify-center rounded-3xl text-5xl shadow-[0_0_40px_var(--qv-accent-glow)]"
          style={{
            background: `linear-gradient(145deg, var(--qv-accent), #0f172a)`,
          }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        >
          📦
        </motion.div>

        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white md:text-3xl">
          QuantaViz Mobile
        </h1>
        <p className="mt-2 text-sm text-slate-400">Take the orb with you — learn anywhere.</p>

        <ul className="mt-8 w-full space-y-3 text-left text-sm text-slate-300">
          {BULLETS.map((b) => (
            <li key={b} className="flex items-center gap-3">
              <span className="text-[var(--qv-accent)]">✓</span>
              {b}
            </li>
          ))}
        </ul>

        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openApk}
          className="mt-10 w-full rounded-2xl py-3.5 text-sm font-bold text-emerald-950 shadow-[0_0_32px_rgba(34,197,94,0.35)]"
          style={{
            background: `linear-gradient(135deg, #4ade80, #22c55e)`,
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          Download APK
        </motion.button>
        <p className="mt-4 text-[10px] text-slate-500">
          Set <code className="rounded bg-white/5 px-1">VITE_APK_URL</code> in <code className="rounded bg-white/5 px-1">.env</code> to your Google Drive file link.
        </p>
      </motion.div>
    </main>
  )
}
