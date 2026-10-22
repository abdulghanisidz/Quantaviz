import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import GlassCard from '../components/ui/GlassCard'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { getLocalQuizProgress, getLocalSearchHistory } from '../services/activityStore'
import { fetchQuizProgress, fetchSearchHistory } from '../services/firestoreService'

function formatWhen(entry) {
  const value = entry?.createdAt?.seconds
    ? entry.createdAt.seconds * 1000
    : entry?.createdAtMs || Date.now()
  return new Date(value).toLocaleString()
}

export default function Settings() {
  const { appearance, setAppearance } = useTheme()
  const { user, loading, signInWithGoogle } = useAuth()
  const [history, setHistory] = useState([])
  const [progress, setProgress] = useState([])
  const [showAllHistory, setShowAllHistory] = useState(false)

  useEffect(() => {
    let active = true

    async function loadActivity() {
      const localHistory = getLocalSearchHistory()
      const localProgress = getLocalQuizProgress()

      if (!user?.uid) {
        if (!active) return
        setHistory(localHistory)
        setProgress(localProgress)
        return
      }

      try {
        const [remoteHistory, remoteProgress] = await Promise.all([
          fetchSearchHistory(user.uid),
          fetchQuizProgress(user.uid),
        ])
        if (!active) return
        setHistory(remoteHistory.length ? remoteHistory : localHistory)
        setProgress(remoteProgress.length ? remoteProgress : localProgress)
      } catch {
        if (!active) return
        setHistory(localHistory)
        setProgress(localProgress)
      }
    }

    loadActivity()
    return () => {
      active = false
    }
  }, [user])

  const averageAccuracy = useMemo(() => {
    if (!progress.length) return 0
    const total = progress.reduce((sum, item) => sum + Number(item.accuracy || 0), 0)
    return Math.round(total / progress.length)
  }, [progress])

  const visibleHistory = showAllHistory ? history : history.slice(0, 3)

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <motion.header
        className="mb-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--qv-accent)]">
          Settings
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-white md:text-4xl">
          Profile, appearance, and learning memory
        </h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Control the look of QuantaViz, revisit your search history, and track how your quiz accuracy is improving.
        </p>
      </motion.header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <GlassCard className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--qv-accent)]">
                  Profile
                </p>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
                  {user?.displayName || 'Guest learner'}
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  {user?.email || 'Sign in to sync your history and quiz progress across devices.'}
                </p>
              </div>
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  className="h-16 w-16 rounded-2xl border border-white/10 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : null}
            </div>
            {!loading && !user ? (
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-950"
                style={{ background: `linear-gradient(135deg, var(--qv-accent), #e2e8f0)` }}
              >
                Sign in with Google
              </button>
            ) : null}
          </GlassCard>

          <GlassCard className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--qv-accent)]">
                Appearance
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
                Theme mode
              </h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setAppearance('dark')}
                className={`rounded-2xl border p-4 text-left transition ${
                  appearance === 'dark'
                    ? 'border-[var(--qv-accent)] bg-[var(--qv-accent-soft)] text-white'
                    : 'border-white/10 bg-white/5 text-slate-300'
                }`}
              >
                <p className="font-semibold">Dark mode</p>
                <p className="mt-1 text-sm opacity-80">Keep the current cinematic look as default.</p>
              </button>
              <button
                type="button"
                onClick={() => setAppearance('light')}
                className={`rounded-2xl border p-4 text-left transition ${
                  appearance === 'light'
                    ? 'border-[var(--qv-accent)] bg-[var(--qv-accent-soft)] text-white'
                    : 'border-white/10 bg-white/5 text-slate-300'
                }`}
              >
                <p className="font-semibold">Light mode</p>
                <p className="mt-1 text-sm opacity-80">Use a brighter matching theme across result pages too.</p>
              </button>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--qv-accent)]">
                  Chat history
                </p>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
                  Recent searches
                </h2>
              </div>
              <span className="text-xs text-slate-500">{history.length} items</span>
            </div>
            <div className="space-y-3">
              {history.length ? visibleHistory.map((item, index) => (
                <div key={item.id || `${item.topic}-${index}`} className="qv-panel-subtle rounded-xl border border-white/10 p-4">
                  <p className="text-sm font-semibold text-white">{item.topic}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {item.domain || 'default'} | {item.language || 'English'} | {formatWhen(item)}
                  </p>
                </div>
              )) : (
                <p className="text-sm text-slate-400">No searches yet. Start exploring a concept and it will appear here.</p>
              )}
            </div>
            {history.length > 3 ? (
              <button
                type="button"
                onClick={() => setShowAllHistory((current) => !current)}
                className="mt-4 text-sm font-semibold text-[var(--qv-accent)] underline-offset-2 hover:underline"
              >
                {showAllHistory ? 'Show less' : `Show more (${history.length - 3} more)`}
              </button>
            ) : null}
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--qv-accent)]">
              Progress tracker
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
              Quiz performance
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="qv-panel-subtle rounded-2xl border border-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Attempts</p>
                <p className="mt-2 text-3xl font-bold text-white">{progress.length}</p>
              </div>
              <div className="qv-panel-subtle rounded-2xl border border-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Average accuracy</p>
                <p className="mt-2 text-3xl font-bold text-white">{averageAccuracy}%</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--qv-accent)]">
                  Recent quiz runs
                </p>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
                  Topic mastery trail
                </h2>
              </div>
              <span className="text-xs text-slate-500">{progress.length} records</span>
            </div>
            <div className="space-y-3">
              {progress.length ? progress.map((item, index) => (
                <div key={item.id || `${item.topic}-${index}`} className="qv-panel-subtle rounded-xl border border-white/10 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{item.topic}</p>
                    <span className="rounded-full bg-[var(--qv-accent-soft)] px-3 py-1 text-xs font-semibold text-white">
                      {item.accuracy || 0}%
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    {item.correctAnswers || 0}/{item.totalQuestions || 0} correct | {formatWhen(item)}
                  </p>
                </div>
              )) : (
                <p className="text-sm text-slate-400">No quiz attempts yet. Submit a quiz on any result page to start tracking.</p>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </main>
  )
}
