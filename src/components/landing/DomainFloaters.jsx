import { motion } from 'framer-motion'

const DOMAINS = [
  {
    label: 'Medical',
    chip: 'DNA',
    media: '/landing-media/dna.mp4',
    className: 'left-[1%] top-[7%] w-[35%] md:left-[2%] md:top-[9%] md:w-[29%]',
    cardHeight: 'h-44 md:h-52',
    floatY: 10,
  },
  {
    label: 'Mechanical',
    chip: 'Torque',
    media: '/landing-media/mechanical.mp4',
    className: 'right-[1%] top-[8%] w-[35%] md:right-[2%] md:top-[10%] md:w-[29%]',
    cardHeight: 'h-44 md:h-52',
    floatY: 11,
  },
  {
    label: 'Tech',
    chip: 'Systems',
    media: '/landing-media/circuit.mp4',
    className: 'bottom-[18%] left-[1%] w-[35%] md:bottom-[16%] md:left-[2%] md:w-[29%]',
    cardHeight: 'h-40 md:h-44',
    floatY: 13,
  },
  {
    label: 'Civil',
    chip: 'Loads',
    media: '/landing-media/civil.mp4',
    className: 'bottom-[18%] right-[1%] w-[35%] md:bottom-[16%] md:right-[2%] md:w-[29%]',
    cardHeight: 'h-40 md:h-44',
    floatY: 12,
  },
]

export default function DomainFloaters() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden md:block">
      {DOMAINS.map(({ label, chip, media, className, cardHeight, floatY }, i) => (
        <motion.div
          key={label}
          className={`absolute ${className}`}
          animate={{ y: [0, -floatY, 0] }}
          transition={{
            duration: 5.1 + i * 0.32,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.16,
          }}
        >
          <div
            className={`glass-panel ${cardHeight} overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/25 shadow-[0_0_38px_rgba(56,189,248,0.08)]`}
          >
            <div className="absolute inset-0 rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_26%,rgba(34,211,238,0.05)_100%)]" />
            <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
            <div className="relative flex h-full flex-col p-3 md:p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-2xl border border-white/10 bg-slate-900/60 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-100">
                  {chip}
                </span>
              </div>
              <VideoPanel src={media} label={label} />
            </div>
          </div>
          <div className="pt-2 text-center text-sm font-medium tracking-tight text-slate-300 md:text-[1.05rem]">
            {label}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function VideoPanel({ src, label }) {
  return (
    <div className="relative flex flex-1 overflow-hidden rounded-[22px] border border-white/8 bg-slate-950/30">
      <video
        className="h-full w-full object-cover"
        src={src}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-label={label}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.14),transparent_26%,rgba(15,23,42,0.26)_100%)]" />
      <div className="absolute inset-0 rounded-[22px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]" />
    </div>
  )
}
