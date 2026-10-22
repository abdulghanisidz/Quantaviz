import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import domainCatalog from '../data/domainCatalog.json'

/** @typedef {'medical' | 'quantum' | 'mechanical' | 'civil' | 'tech' | 'biology' | 'chemistry' | 'data_structures' | 'electrical' | 'mathematics' | 'environmental' | 'default'} DomainId */
/** @typedef {'dark' | 'light'} AppearanceId */

const DOMAIN_STORAGE_KEY = 'qv:domain'
const APPEARANCE_STORAGE_KEY = 'qv:appearance'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [domain, setDomainState] = useState(
    /** @type {DomainId} */ (localStorage.getItem(DOMAIN_STORAGE_KEY) || 'default'),
  )
  const [appearance, setAppearanceState] = useState(
    /** @type {AppearanceId} */ (localStorage.getItem(APPEARANCE_STORAGE_KEY) || 'dark'),
  )

  const applyCssVars = useCallback((id, mode) => {
    const v = domainCatalog[id] || domainCatalog.default
    const root = document.documentElement
    root.style.setProperty('--qv-accent', v.accent)
    root.style.setProperty('--qv-accent-soft', v.soft)
    root.style.setProperty('--qv-accent-glow', v.glow)
    root.style.setProperty('--qv-domain-surface', v.surface)
    root.style.setProperty('--qv-domain-aura', v.aura)
    root.dataset.appearance = mode
    root.dataset.domain = id
    root.style.colorScheme = mode
  }, [])

  useEffect(() => {
    applyCssVars(domain, appearance)
    localStorage.setItem(DOMAIN_STORAGE_KEY, domain)
  }, [domain, appearance, applyCssVars])

  useEffect(() => {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, appearance)
  }, [appearance])

  const setDomain = useCallback((nextDomain) => {
    setDomainState(nextDomain)
  }, [])

  const setAppearance = useCallback((nextAppearance) => {
    setAppearanceState(nextAppearance)
  }, [])

  const toggleAppearance = useCallback(() => {
    setAppearanceState((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo(
    () => ({
      domain,
      setDomain,
      appearance,
      setAppearance,
      toggleAppearance,
      isDark: appearance === 'dark',
      accent: domainCatalog[domain]?.accent ?? domainCatalog.default.accent,
      domainTheme: domainCatalog[domain] || domainCatalog.default,
    }),
    [appearance, domain, setAppearance, setDomain, toggleAppearance],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
