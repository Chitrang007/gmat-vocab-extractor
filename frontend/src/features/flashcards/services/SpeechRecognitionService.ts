export interface SpeechResult {
  transcript: string
  isFinal: boolean
  confidence: number
}

export interface SpeechError {
  code: string
  message: string
}

type ResultCallback = (result: SpeechResult) => void
type ErrorCallback = (error: SpeechError) => void

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: { error: string; message?: string }) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionEventLike {
  resultIndex: number
  results: {
    length: number
    [index: number]: {
      isFinal: boolean
      [index: number]: { transcript: string; confidence?: number }
    }
  }
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance
  }
}

export class SpeechRecognitionService {
  private recognition: SpeechRecognitionInstance | null = null
  private resultCallback: ResultCallback | null = null
  private errorCallback: ErrorCallback | null = null

  isSupported(): boolean {
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  }

  onResult(callback: ResultCallback): void {
    this.resultCallback = callback
  }

  onError(callback: ErrorCallback): void {
    this.errorCallback = callback
  }

  start(options: { lang?: string; continuous?: boolean; interimResults?: boolean } = {}): void {
    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognitionCtor) {
      this.errorCallback?.({
        code: 'not-supported',
        message: 'Speech recognition is not supported in this browser.',
      })
      return
    }

    this.destroy()
    this.recognition = new SpeechRecognitionCtor()
    this.recognition.lang = options.lang ?? 'en-US'
    this.recognition.continuous = options.continuous ?? false
    this.recognition.interimResults = options.interimResults ?? true

    this.recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        const alternative = result[0]
        this.resultCallback?.({
          transcript: alternative.transcript,
          isFinal: result.isFinal,
          confidence: alternative.confidence ?? 0,
        })
      }
    }

    this.recognition.onerror = (event) => {
      this.errorCallback?.({
        code: event.error,
        message: event.message ?? event.error,
      })
    }

    this.recognition.start()
  }

  stop(): void {
    this.recognition?.stop()
  }

  destroy(): void {
    if (this.recognition) {
      this.recognition.onresult = null
      this.recognition.onerror = null
      this.recognition.onend = null
      this.recognition.abort()
      this.recognition = null
    }
  }
}

export function createSpeechRecognitionService(): SpeechRecognitionService {
  return new SpeechRecognitionService()
}
