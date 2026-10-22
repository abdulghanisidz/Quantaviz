import { motion } from 'framer-motion'
import HeroSearch from '../components/landing/HeroSearch'

export default function Landing() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, var(--qv-accent), transparent 40%),
            radial-gradient(circle at 80% 30%, #6366f1, transparent 35%)`,
        }}
      />
      <HeroSearch />
    </motion.main>
  )
}
