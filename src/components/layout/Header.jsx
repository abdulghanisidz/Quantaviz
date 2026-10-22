import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'

const nav = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/download', label: 'Download APK' },
  { to: '/contact', label: 'Contact' },
  { to: '/settings', label: 'Settings' },
]

export default function Header({ showSearchSlot }) {
  const { user, loading, signInWithGoogle, signOutUser } = useAuth()
  const { appearance, toggleAppearance } = useTheme()
  const { pathname } = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-white/[0.06] bg-slate-950/55 backdrop-blur-xl"
      style={{ backgroundColor: 'color-mix(in srgb, var(--qv-bg-mid) 84%, transparent)' }}
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto hidden max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:flex md:px-6">
        <Link to="/" className="group flex items-center gap-2">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl text-lg font-bold text-white shadow-[0_0_24px_var(--qv-accent-glow)]"
            style={{ background: `linear-gradient(135deg, var(--qv-accent), transparent)` }}
            aria-hidden
          >
            Q
          </span>
          <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-white">
            Quanta<span className="text-[var(--qv-accent)]">Viz</span>
          </span>
        </Link>

        <nav className="order-3 flex w-full justify-center gap-1 sm:order-none sm:w-auto sm:justify-start md:gap-2">
          {nav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 text-sm font-medium transition-colors md:px-4 ${
                  isActive
                    ? 'bg-white/10 text-white shadow-[0_0_20px_var(--qv-accent-soft)]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {showSearchSlot}
          <button
            type="button"
            onClick={toggleAppearance}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
          >
            {appearance === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          {!loading && !user && (
            <>
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:border-[var(--qv-accent)]/40 hover:bg-white/10"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                className="rounded-full px-4 py-1.5 text-sm font-semibold text-slate-950 transition hover:opacity-95"
                style={{
                  background: `linear-gradient(135deg, var(--qv-accent), #e2e8f0)`,
                  boxShadow: `0 0 28px var(--qv-accent-soft)`,
                }}
              >
                Sign up
              </button>
            </>
          )}
          {!loading && user && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => signOutUser()}
                className="hidden rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-white/5 sm:inline"
              >
                Sign out
              </button>
              <img
                src={user.photoURL || '/favicon.svg'}
                alt=""
                className="h-9 w-9 rounded-full border border-white/20 object-cover ring-2 ring-[var(--qv-accent)]/40"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>
      </div>

      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="glass-panel flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-200"
          aria-label="Open menu"
        >
          <span aria-hidden className="text-lg">
            ☰
          </span>
        </button>

        <Link to="/" className="absolute left-1/2 -translate-x-1/2 font-[family-name:var(--font-display)] text-lg font-semibold text-white">
          Quanta<span className="text-[var(--qv-accent)]">Viz</span>
        </Link>

        <div className="h-10 w-10" aria-hidden />
      </div>

      <AnimatePresence>
        {mobileMenuOpen ? (
          <>
            <motion.button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-black/50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-label="Close menu overlay"
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-[61] w-[82%] max-w-[320px] border-r border-white/10 bg-slate-950/92 p-5 backdrop-blur-xl md:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">
                  Quanta<span className="text-[var(--qv-accent)]">Viz</span>
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="glass-panel rounded-lg px-2 py-1 text-sm text-slate-300"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>

              <nav className="space-y-2">
                {nav.map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `block rounded-xl px-3 py-2 text-sm font-medium transition ${
                        isActive
                          ? 'bg-[var(--qv-accent-soft)] text-white shadow-[0_0_18px_var(--qv-accent-soft)]'
                          : 'text-slate-300 hover:bg-white/5'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </nav>

              <div className="mt-6 space-y-2">
                <button
                  type="button"
                  onClick={toggleAppearance}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200"
                >
                  Switch to {appearance === 'dark' ? 'light' : 'dark'} mode
                </button>
                {!loading && !user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => signInWithGoogle()}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200"
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => signInWithGoogle()}
                      className="w-full rounded-xl px-3 py-2 text-sm font-semibold text-slate-950"
                      style={{
                        background: `linear-gradient(135deg, var(--qv-accent), #e2e8f0)`,
                        boxShadow: `0 0 22px var(--qv-accent-soft)`,
                      }}
                    >
                      Sign up
                    </button>
                  </>
                ) : null}
                {!loading && user ? (
                  <button
                    type="button"
                    onClick={() => signOutUser()}
                    className="w-full rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-slate-300"
                  >
                    Sign out
                  </button>
                ) : null}
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      {pathname.startsWith('/learn') && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--qv-accent)]/50 to-transparent" />
      )}
    </motion.header>
  )
}
