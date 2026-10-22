import { useEffect, useMemo, useState } from 'react'
import GlassCard from '../ui/GlassCard'
import { fetchNasaImage, fetchPexelsImage, fetchYouTubeVideoId } from '../../services/mediaApis'

function hashSeed(seedValue) {
  let hash = 0
  for (let index = 0; index < seedValue.length; index += 1) {
    hash = (hash << 5) - hash + seedValue.charCodeAt(index)
  }
  return Math.abs(hash).toString(36)
}

function cleanCaption(value) {
  const text = String(value || '').trim()
  if (!text) return ''
  const normalized = text.toLowerCase()
  if (
    normalized.includes('simplified block diagram') ||
    normalized.includes('esp32 microcontroller')
  ) {
    return ''
  }
  return text
}

export default function MediaPanels({ topic, visualData, domain, loading = false }) {
  const seed = hashSeed(topic || 'quantaviz')
  const fallbackImgSrc = `https://picsum.photos/seed/${seed}/960/540`
  const description = cleanCaption(
    typeof visualData === 'string' ? visualData : visualData?.description || visualData?.title || '',
  )
  const mediaQuery = useMemo(
    () => [topic, description].filter(Boolean).join(' ').trim(),
    [topic, description],
  )
  const [imgSrc, setImgSrc] = useState('')
  const [videoId, setVideoId] = useState('')
  const [videoError, setVideoError] = useState('')
  const [mediaLoading, setMediaLoading] = useState(true)

  useEffect(() => {
    let active = true
    setMediaLoading(true)
    setVideoId('')
    setVideoError('')
    setImgSrc('')

    if (loading) {
      return () => {
        active = false
      }
    }

    const run = async () => {
      const [youtubeResult, pexelsImage, nasaImage] = await Promise.all([
        fetchYouTubeVideoId(mediaQuery),
        fetchPexelsImage(mediaQuery || topic, domain),
        fetchNasaImage(mediaQuery || topic, domain),
      ])

      if (!active) return
      setVideoId(youtubeResult?.videoId || '')
      setVideoError(youtubeResult?.error || '')
      setImgSrc(pexelsImage || nasaImage || fallbackImgSrc)
      setMediaLoading(false)
    }

    run().catch(() => {
      if (!active) return
      setVideoId('')
      setVideoError('request_failed')
      setImgSrc(fallbackImgSrc)
      setMediaLoading(false)
    })

    return () => {
      active = false
    }
  }, [mediaQuery, topic, domain, fallbackImgSrc, loading])

  return (
    <>
      {description ? (
        <GlassCard className="overflow-hidden">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
              Visual reference
            </h3>
            <span className="rounded-full bg-[var(--qv-accent-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--qv-accent)]">
              Image
            </span>
          </div>
          <div className="overflow-hidden rounded-xl border border-white/10">
            {mediaLoading ? (
              <div className="h-[220px] w-full animate-pulse bg-slate-900/60" />
            ) : (
              <img src={imgSrc || fallbackImgSrc} alt="" className="h-auto w-full object-cover" loading="lazy" />
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </GlassCard>
      ) : null}

      <GlassCard className="overflow-hidden">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
            Explainer video
          </h3>
          <span className="rounded-full bg-[var(--qv-accent-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--qv-accent)]">
            YouTube
          </span>
        </div>
        <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
          {mediaLoading ? (
            <div className="h-full w-full animate-pulse bg-slate-900/70" />
          ) : videoId ? (
            <iframe
              title="YouTube embed"
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${videoId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-slate-400">
              {videoError === 'quotaExceeded'
                ? 'YouTube API quota exceeded. Try again later or update the API key quota.'
                : videoError === 'missing_key'
                  ? 'YouTube API key is missing. Add VITE_YOUTUBE_API_KEY in your .env file.'
                  : 'No related video found for this topic yet.'}
            </div>
          )}
        </div>
      </GlassCard>
    </>
  )
}
