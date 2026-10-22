import { motion } from 'framer-motion'

export default function EnergyOrb() {
  const particles = [
    { size: 8, top: '18%', left: '21%', color: 'rgba(250, 204, 21, 0.85)', duration: 4.6 },
    { size: 6, top: '26%', left: '72%', color: 'rgba(34, 211, 238, 0.82)', duration: 5.1 },
    { size: 10, top: '62%', left: '17%', color: 'rgba(168, 85, 247, 0.78)', duration: 5.5 },
    { size: 7, top: '71%', left: '77%', color: 'rgba(251, 191, 36, 0.8)', duration: 4.9 },
    { size: 5, top: '48%', left: '84%', color: 'rgba(125, 211, 252, 0.8)', duration: 4.2 },
    { size: 6, top: '39%', left: '11%', color: 'rgba(196, 181, 253, 0.82)', duration: 5.8 },
  ]

  const arcs = [
    {
      inset: '7%',
      border: 'rgba(34, 211, 238, 0.35)',
      shadow: '0 0 28px rgba(34, 211, 238, 0.3)',
      rotate: 12,
      duration: 18,
    },
    {
      inset: '14%',
      border: 'rgba(250, 204, 21, 0.3)',
      shadow: '0 0 30px rgba(250, 204, 21, 0.24)',
      rotate: -18,
      duration: 24,
    },
    {
      inset: '21%',
      border: 'rgba(168, 85, 247, 0.25)',
      shadow: '0 0 25px rgba(168, 85, 247, 0.22)',
      rotate: 28,
      duration: 16,
    },
  ]

  return (
    <div className="relative mx-auto flex aspect-square w-[min(100%,620px)] items-center justify-center">
      <motion.div
        className="absolute inset-[8%] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(34,211,238,0.3) 0%, rgba(250,204,21,0.18) 38%, rgba(168,85,247,0.24) 58%, transparent 78%)',
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.78, 0.45] }}
        transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-0 rounded-full opacity-70 blur-2xl"
        style={{
          background:
            'conic-gradient(from 180deg, transparent 0deg, rgba(34,211,238,0.9) 36deg, transparent 78deg, rgba(250,204,21,0.95) 130deg, transparent 196deg, rgba(168,85,247,0.9) 254deg, transparent 320deg, rgba(34,211,238,0.8) 360deg)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute inset-[6%] rounded-full opacity-60"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, transparent 42%, rgba(15,23,42,0.18) 43%, rgba(34,211,238,0.16) 53%, transparent 64%)',
          boxShadow: '0 0 60px rgba(34, 211, 238, 0.15)',
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />
      {arcs.map((arc) => (
        <motion.span
          key={arc.inset}
          className="absolute rounded-full border-t"
          style={{
            inset: arc.inset,
            borderColor: 'transparent',
            borderTopColor: arc.border,
            boxShadow: arc.shadow,
            transform: `rotate(${arc.rotate}deg)`,
          }}
          animate={{ rotate: [arc.rotate, arc.rotate + 360] }}
          transition={{ duration: arc.duration, repeat: Infinity, ease: 'linear' }}
        />
      ))}
      <motion.div
        className="relative z-10 h-[46%] w-[46%] rounded-full md:h-[52%] md:w-[52%]"
        style={{
          background: `
            radial-gradient(circle at 32% 28%, rgba(255,255,255,0.34), transparent 18%),
            radial-gradient(circle at 67% 36%, rgba(250,204,21,0.82), transparent 22%),
            radial-gradient(circle at 44% 62%, rgba(34,211,238,0.36), transparent 32%),
            radial-gradient(circle at 52% 52%, rgba(16,185,129,0.18), rgba(2,6,23,0.96) 72%)
          `,
          boxShadow: `
            0 0 90px rgba(34, 211, 238, 0.22),
            0 0 120px rgba(250, 204, 21, 0.16),
            inset 0 0 60px rgba(255,255,255,0.12)
          `,
        }}
        animate={{ y: [0, -8, 0], scale: [1, 1.015, 1] }}
        transition={{ duration: 6.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.span
          className="absolute inset-[9%] rounded-full border border-white/10"
          animate={{ rotate: -360 }}
          transition={{ duration: 36, repeat: Infinity, ease: 'linear' }}
        />
        <motion.span
          className="absolute inset-[4%] rounded-full border border-[var(--qv-accent)]/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        />
        <motion.span
          className="absolute inset-[16%] rounded-full"
          style={{
            border: '1px solid rgba(250, 204, 21, 0.2)',
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />
        <motion.span
          className="absolute inset-[22%] rounded-full"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.16), transparent 65%)',
            filter: 'blur(10px)',
          }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.28, 0.42, 0.28] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
      {particles.map((particle) => (
        <motion.span
          key={`${particle.top}-${particle.left}`}
          className="absolute rounded-full"
          style={{
            top: particle.top,
            left: particle.left,
            width: particle.size,
            height: particle.size,
            background: particle.color,
            boxShadow: `0 0 18px ${particle.color}`,
          }}
          animate={{ y: [0, -12, 0], opacity: [0.35, 1, 0.35], scale: [1, 1.25, 1] }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      <div
        className="pointer-events-none absolute -inset-[8%] rounded-full opacity-60"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(34,211,238,0.18) 0%, rgba(168,85,247,0.14) 32%, transparent 68%)',
        }}
      />
    </div>
  )
}
