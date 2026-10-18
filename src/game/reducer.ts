import type { CaseRound, GameState } from '../types'

export const initialGameState: GameState = {
  status: 'briefing',
  round: null,
  lastWrongCountry: null,
  revealedClueCount: 3,
  pointsSpentThisAttempt: 0,
  isRecovery: false,
}

export type GameAction =
  | { type: 'START'; round: CaseRound; isRecovery?: boolean }
  | { type: 'SET_WEATHER'; weather: CaseRound['weather'] }
  | { type: 'BUY_CLUE'; cost: number; maxClues: number }
  | { type: 'SUBMIT'; countryCode: string; nextRound?: CaseRound }
  | { type: 'RESET' }

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START':
      return {
        status: 'investigating', round: action.round, lastWrongCountry: null,
        revealedClueCount: 3, pointsSpentThisAttempt: 0, isRecovery: action.isRecovery ?? false,
      }
    case 'SET_WEATHER':
      if (!state.round) return state
      return { ...state, round: { ...state.round, weather: action.weather } }
    case 'BUY_CLUE':
      if (state.status !== 'investigating' || state.revealedClueCount >= action.maxClues) return state
      return {
        ...state,
        revealedClueCount: state.revealedClueCount + 1,
        pointsSpentThisAttempt: state.pointsSpentThisAttempt + action.cost,
      }
    case 'SUBMIT': {
      if (!state.round || state.status !== 'investigating') return state
      if (action.countryCode === state.round.target.code) {
        return { ...state, status: 'won', round: { ...state.round, submittedGuess: action.countryCode } }
      }
      if (state.round.day >= 3) {
        return { ...state, status: 'lost', round: { ...state.round, submittedGuess: action.countryCode } }
      }
      if (!action.nextRound) return state
      return {
        status: 'investigating',
        round: action.nextRound,
        lastWrongCountry: state.round.target,
        revealedClueCount: state.revealedClueCount,
        pointsSpentThisAttempt: state.pointsSpentThisAttempt,
        isRecovery: state.isRecovery,
      }
    }
    case 'RESET':
      return initialGameState
  }
}
