import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import GlassCard from '../components/ui/GlassCard'
import { submitContactMessage } from '../services/firestoreService'

const CATEGORIES = [
  { value: 'feedback', label: 'Feedback' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
]

const initial = {
  fullName: '',
  email: '',
  phone: '',
  subject: '',
  category: 'feedback',
  message: '',
}

export default function Contact() {
  const [form, setForm] = useState(initial)
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSending(true)
    try {
      await submitContactMessage({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject.trim(),
        category: form.category,
        message: form.message.trim(),
      })
      setDone(true)
      setForm(initial)
    } catch {
      setError('Could not send right now. Check Firestore rules and connection.')
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-12 md:py-16">
      <motion.header
        className="mb-10 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white md:text-4xl">
          Contact
        </h1>
        <p className="mt-2 text-slate-400">We read every message. Expect thoughtful follow-up.</p>
      </motion.header>

      <GlassCard
        as={motion.form}
        noMotion
        onSubmit={onSubmit}
        className="space-y-4 p-6 md:p-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Field
          label="Full Name"
          name="fullName"
          value={form.fullName}
          onChange={onChange}
          required
        />
        <Field
          label="Email Address"
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          required
        />
        <Field label="Phone Number" name="phone" value={form.phone} onChange={onChange} />
        <Field label="Subject" name="subject" value={form.subject} onChange={onChange} required />
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Type (optional)</label>
          <select
            name="category"
            value={form.category}
            onChange={onChange}
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-[var(--qv-accent)]/50"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Concern / Message</label>
          <textarea
            name="message"
            value={form.message}
            onChange={onChange}
            required
            rows={5}
            className="w-full resize-y rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[var(--qv-accent)]/50"
            placeholder="Tell us what’s on your mind…"
          />
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <motion.button
          type="submit"
          disabled={sending}
          whileHover={{ scale: sending ? 1 : 1.02 }}
          whileTap={{ scale: sending ? 1 : 0.98 }}
          className="w-full rounded-xl py-3 text-sm font-bold text-slate-950 disabled:opacity-50"
          style={{
            background: `linear-gradient(135deg, var(--qv-accent), #e2e8f0)`,
            boxShadow: `0 0 28px var(--qv-accent-soft)`,
          }}
        >
          {sending ? 'Sending…' : 'Send Message'}
        </motion.button>
      </GlassCard>

      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass-panel glow-ring mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center"
          >
            <motion.p
              className="text-lg font-semibold text-emerald-300"
              initial={{ scale: 0.8 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5 }}
            >
              Message received ✓
            </motion.p>
            <p className="mt-2 text-sm text-slate-400">Thanks — we’ll get back to you soon.</p>
            <button
              type="button"
              onClick={() => setDone(false)}
              className="mt-4 text-xs font-medium text-[var(--qv-accent)] underline-offset-2 hover:underline"
            >
              Send another
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

function Field({ label, name, type = 'text', value, onChange, required }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-xs font-medium text-slate-400">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[var(--qv-accent)]/50"
      />
    </div>
  )
}
