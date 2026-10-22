import { motion } from 'framer-motion'

export default function GlassCard({
  children,
  className = '',
  glow = true,
  noMotion = false,
  as: Component = motion.section,
  ...motionProps
}) {
  const cls = `glass-panel rounded-2xl p-5 md:p-6 ${glow ? 'glow-ring' : ''} ${className}`
  if (noMotion) {
    return (
      <Component className={cls} {...motionProps}>
        {children}
      </Component>
    )
  }
  return (
    <Component
      className={cls}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      {...motionProps}
    >
      {children}
    </Component>
  )
}
