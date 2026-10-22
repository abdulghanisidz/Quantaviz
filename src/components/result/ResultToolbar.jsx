import { motion } from 'framer-motion'

const PATH_STEPS = ['Discover', 'Visualize', 'Simulate', 'Master']

export default function ResultToolbar({
  broMode,
  onBroToggle,
  compareMode,
  onCompareToggle,
  pathStep,
  onPathStep,
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        <ToggleChip active={broMode} onClick={() => onBroToggle(!broMode)} label="Bro mode" emoji="😎" />
        <ToggleChip
          active={compareMode}
          onClick={() => onCompareToggle(!compareMode)}
          label="Compare"
          emoji="⚖️"
        />
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 px-3 py-2">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Learning path
        </p>
        <div className="flex flex-wrap items-center gap-1">
          {PATH_STEPS.map((step, i) => (
            <motion.button
              key={step}
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onPathStep(i)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                pathStep === i
                  ? 'bg-[var(--qv-accent)] text-slate-950 shadow-[0_0_20px_var(--qv-accent-soft)]'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {step}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ToggleChip({ active, onClick, label, emoji }) {
  return (
    <motion.button
      type="button"
      layout
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
        active
          ? 'border-[var(--qv-accent)]/50 bg-[var(--qv-accent-soft)] text-white shadow-[0_0_24px_var(--qv-accent-soft)]'
          : 'border-white/10 bg-slate-950/40 text-slate-400 hover:border-white/20 hover:text-white'
      }`}
    >
      <span aria-hidden>{emoji}</span>
      {label}
    </motion.button>
  )
}
