/** Load Mermaid from CDN so production bundles stay lean and npm installs stay reliable. */
const MERMAID_CDN =
  'https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js'

let loadPromise = null

export function loadMermaid() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if (window.mermaid) return Promise.resolve(window.mermaid)
  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-mermaid-cdn="1"]`)
      if (existing) {
        existing.addEventListener('load', () => resolve(window.mermaid))
        existing.addEventListener('error', () => reject(new Error('Mermaid script failed')))
        return
      }
      const s = document.createElement('script')
      s.src = MERMAID_CDN
      s.async = true
      s.dataset.mermaidCdn = '1'
      s.onload = () => resolve(window.mermaid)
      s.onerror = () => reject(new Error('Mermaid script failed'))
      document.head.appendChild(s)
    })
  }
  return loadPromise
}
