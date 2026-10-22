import { motion } from 'framer-motion'
import GlassCard from '../components/ui/GlassCard'

const SECTIONS = [
  {
    id: 1,
    text: `QuantaViz solves the biggest problem in education — lack of intuitive understanding. Students struggle not because concepts are difficult, but because explanations are disconnected from visualization. This platform bridges that gap by combining AI-generated explanations with real-time visuals.`,
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80',
    alt: 'Abstract visualization of learning',
  },
  {
    id: 2,
    text: `Unlike traditional learning platforms, QuantaViz delivers multi-format learning. Instead of switching between textbooks, YouTube, and simulations, everything is unified into one seamless experience powered by intelligent APIs.`,
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
    alt: 'Science and technology workspace',
  },
  {
    id: 3,
    text: `The system dynamically adapts to different domains such as biology, chemistry, mathematics, environmental science, engineering, and tech. Each concept is translated into diagrams, 3D visuals, and simulations to match the learning style of the user.`,
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80',
    alt: 'Laboratory research environment',
  },
  {
    id: 4,
    text: `Our mission is to redefine how students interact with knowledge. Learning should feel intuitive, engaging, and interactive — not frustrating. QuantaViz transforms complexity into clarity.`,
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    alt: 'Earth from space — clarity and perspective',
  },
]

export default function About() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <motion.header
        className="mb-14 text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--qv-accent)]">
          About QuantaViz
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-white md:text-4xl">
          Clarity at the speed of thought
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-400">
          We merge narrative, structure, and motion so ideas stick — not as facts to memorize, but as models you can see and test.
        </p>
      </motion.header>

      <div className="flex flex-col gap-16 md:gap-24">
        {SECTIONS.map((s, i) => {
          const textFirst = i % 2 === 0
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5 }}
              className={`grid items-center gap-8 md:grid-cols-2 md:gap-12 ${textFirst ? '' : 'md:[&>*:first-child]:order-2'}`}
            >
              <GlassCard className="p-6 md:p-8" as={motion.article}>
                <p className="text-base leading-relaxed text-slate-300 md:text-lg">{s.text}</p>
              </GlassCard>
              <motion.div
                className="glass-panel glow-ring overflow-hidden rounded-2xl p-1"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              >
                <img src={s.image} alt={s.alt} className="h-full w-full rounded-xl object-cover" loading="lazy" />
              </motion.div>
            </motion.div>
          )
        })}
      </div>
    </main>
  )
}
