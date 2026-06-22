import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createSpeechRecognitionService,
  type SpeechError,
} from '../services/SpeechRecognitionService'

export function useSpeechRecognition() {
  const serviceRef = useRef(createSpeechRecognitionService())
  const [isSupported] = useState(() => serviceRef.current.isSupported())
  const [isListening, setIsListening] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [finalTranscript, setFinalTranscript] = useState('')
  const [error, setError] = useState<SpeechError | null>(null)

  useEffect(() => {
    const service = serviceRef.current

    service.onResult(({ transcript, isFinal }) => {
      if (isFinal) {
        setFinalTranscript(transcript.trim())
        setInterimTranscript('')
        setIsListening(false)
      } else {
        setInterimTranscript(transcript.trim())
      }
    })

    service.onError((speechError) => {
      setError(speechError)
      setIsListening(false)
    })

    return () => {
      service.destroy()
    }
  }, [])

  const startListening = useCallback(() => {
    setError(null)
    setInterimTranscript('')
    setIsListening(true)
    serviceRef.current.start({ lang: 'en-US', continuous: false, interimResults: true })
  }, [])

  const stopListening = useCallback(() => {
    serviceRef.current.stop()
    setIsListening(false)
  }, [])

  const resetTranscript = useCallback(() => {
    setInterimTranscript('')
    setFinalTranscript('')
    setError(null)
  }, [])

  return {
    isSupported,
    isListening,
    interimTranscript,
    finalTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  }
}
