import { useCallback, useEffect, useRef, useState } from 'react'
import { ROUND_DURATION_MS } from '../constants/gameConfig'
import { flashcardGameEngine } from '../services/FlashcardGameEngine'
import type { GameState, RoundResult } from '../types/flashcard.types'
import { useSpeechRecognition } from './useSpeechRecognition'
import { useTimer } from './useTimer'

export function useFlashcardGame() {
  const [gameState, setGameState] = useState<GameState>(() => flashcardGameEngine.getState())
  const [lastResult, setLastResult] = useState<RoundResult | null>(null)
  const submittingRef = useRef(false)
  const initializedRef = useRef(false)
  const speech = useSpeechRecognition()

  const syncState = useCallback((state: GameState) => {
    setGameState(state)
    const latestResult = state.roundResults[state.roundResults.length - 1]
    if (state.phase === 'feedback' && latestResult) {
      setLastResult(latestResult)
    }
  }, [])

  const handleTimeout = useCallback(() => {
    if (submittingRef.current) return
    submittingRef.current = true
    speech.stopListening()
    syncState(flashcardGameEngine.handleTimeout())
    submittingRef.current = false
  }, [speech, syncState])

  const {
    remainingMs,
    remainingSeconds,
    isRunning,
    start: startTimer,
    pause: pauseTimer,
    reset: resetTimer,
  } = useTimer({
    durationMs: ROUND_DURATION_MS,
    onExpire: handleTimeout,
  })

  const beginActiveRound = useCallback(() => {
    speech.resetTranscript()
    submittingRef.current = false
    syncState(flashcardGameEngine.beginRound())
    resetTimer()
    startTimer()
  }, [resetTimer, speech, startTimer, syncState])

  const startGame = useCallback(async () => {
    const state = await flashcardGameEngine.start()
    syncState(state)
    if (state.phase === 'ready') {
      beginActiveRound()
    }
  }, [beginActiveRound, syncState])

  const submitAnswer = useCallback(
    (input: string) => {
      if (submittingRef.current || gameState.phase !== 'playing') return
      submittingRef.current = true
      pauseTimer()
      speech.stopListening()
      syncState(flashcardGameEngine.submitAnswer(input))
      submittingRef.current = false
    },
    [gameState.phase, pauseTimer, speech, syncState],
  )

  const skipRound = useCallback(() => {
    if (submittingRef.current || gameState.phase !== 'playing') return
    submittingRef.current = true
    pauseTimer()
    speech.stopListening()
    syncState(flashcardGameEngine.skipRound())
    submittingRef.current = false
  }, [gameState.phase, pauseTimer, speech, syncState])

  const nextRound = useCallback(() => {
    const state = flashcardGameEngine.nextRound()
    syncState(state)
    if (state.phase === 'playing') {
      speech.resetTranscript()
      submittingRef.current = false
      resetTimer()
      startTimer()
    }
  }, [resetTimer, speech, startTimer, syncState])

  const restartSession = useCallback(async () => {
    setLastResult(null)
    const state = await flashcardGameEngine.restart()
    syncState(state)
    if (state.phase === 'ready') {
      beginActiveRound()
    }
  }, [beginActiveRound, syncState])

  const toggleVoiceInput = useCallback(() => {
    if (gameState.phase !== 'playing') return
    if (speech.isListening) {
      speech.stopListening()
    } else {
      speech.startListening()
    }
  }, [gameState.phase, speech])

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    void startGame()
  }, [startGame])

  useEffect(() => {
    if (speech.finalTranscript && gameState.phase === 'playing') {
      submitAnswer(speech.finalTranscript)
    }
  }, [speech.finalTranscript, gameState.phase, submitAnswer])

  return {
    phase: gameState.phase,
    error: gameState.error,
    currentRound: gameState.currentRound,
    roundIndex: gameState.roundIndex,
    maxRounds: gameState.maxRounds,
    sessionStats: gameState.sessionStats,
    lastResult,
    timer: {
      remainingMs,
      remainingSeconds,
      isRunning,
    },
    speech,
    actions: {
      startGame,
      submitAnswer,
      skipRound,
      nextRound,
      restartSession,
      toggleVoiceInput,
    },
  }
}
