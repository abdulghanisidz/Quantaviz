import { useCallback, useEffect, useRef, useState } from 'react'

function getRecognitionConstructor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export function useSpeechRecognition({ lang = 'en-US', onResult } = {}) {
  const recognitionRef = useRef(null)
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const Recognition = getRecognitionConstructor()
    setSupported(Boolean(Recognition))
  }, [])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const start = useCallback(() => {
    const Recognition = getRecognitionConstructor()
    if (!Recognition) {
      setError('Speech recognition is not supported in this browser.')
      return false
    }

    recognitionRef.current?.stop()

    const recognition = new Recognition()
    recognition.lang = lang
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setListening(true)
      setError('')
    }

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results || [])
        .map((result) => result?.[0]?.transcript || '')
        .join(' ')
        .trim()

      if (transcript && onResult) onResult(transcript)
    }

    recognition.onerror = (event) => {
      setError(event?.error === 'not-allowed' ? 'Microphone permission was denied.' : 'Voice input failed.')
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    return true
  }, [lang, onResult])

  useEffect(() => stop, [stop])

  return { supported, listening, error, start, stop, clearError: () => setError('') }
}
