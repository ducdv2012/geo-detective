import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { difficultyLabels, dossiers } from './data/dossiers'
import { generateUniquePuzzle, seededRandom } from './game/puzzle'
import {
  applyCaseLoss, applyCaseWin, applyRecoveryLoss, applyRecoveryWin, buyClue, getDossierMaxClues, getNextClueCost,
  loadProgress, RECOVERY_REWARD, saveProgress,
} from './game/progress'
import { badgeCatalog, DAILY_REPUTATION_CASE_LIMIT, getRankProgress } from './game/achievements'
import { gameReducer, initialGameState } from './game/reducer'
import { copy, formatClue, formatWeather, interpolate } from './i18n'
import { loadCountries } from './services/countries'
import { fetchWeather } from './services/weather'
import type { CaseRound, Country, Locale, PenaltyResult, RecoveryResult, ScoreResult } from './types'
import { Onboarding } from './components/Onboarding'
import { OutcomeCinematic, type CinematicKind } from './components/OutcomeCinematic'
import { loadUiPreferences, saveUiPreferences } from './ui/preferences'
import { useSoundEffects } from './ui/sound'

type DataSource = 'cache' | 'network' | 'fallback'
type CinematicState = { kind: CinematicKind; final: boolean; country: string }

const icons = [
  <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 34c8-7 13-15 16-24 4 7 9 14 16 22-8 5-24 7-32 2Z"/><path d="M18 34c1-5 4-10 8-14M14 28c7 1 13 0 19-3"/></svg>,
  <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="17"/><path d="M16 24h16M24 16v16"/><circle cx="24" cy="24" r="5"/></svg>,
  <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 12h32v24H8z"/><path d="M8 20h32M18 20v16M31 20v16"/><circle cx="13" cy="16" r="1"/></svg>,
  <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="16"/><path d="M24 8v32M8 24h32M14 14l20 20M34 14 14 34"/></svg>,
  <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 34 18 16l7 11 6-15 7 22Z"/><path d="M8 38h32"/></svg>,
  <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 11h28v26H10z"/><path d="m15 29 6-7 5 4 7-9M15 16h8"/></svg>,
]

function App() {
  const [locale, setLocale] = useState<Locale>('vi')
  const [state, dispatch] = useReducer(gameReducer, initialGameState)
  const [countries, setCountries] = useState<Country[]>([])
  const [source, setSource] = useState<DataSource>('fallback')
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState('')
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const [selectedDossierIndex, setSelectedDossierIndex] = useState(0)
  const [progress, setProgress] = useState(() => loadProgress(localStorage))
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null)
  const [penaltyResult, setPenaltyResult] = useState<PenaltyResult | null>(null)
  const [recoveryResult, setRecoveryResult] = useState<RecoveryResult | null>(null)
  const [uiPreferences, setUiPreferences] = useState(() => loadUiPreferences(localStorage))
  const [showOnboarding, setShowOnboarding] = useState(() => !loadUiPreferences(localStorage).hasSeenOnboarding)
  const [cinematic, setCinematic] = useState<CinematicState | null>(null)
  const randomRef = useRef(seededRandom(Date.now()))
  const evidenceHeadingRef = useRef<HTMLHeadingElement>(null)
  const resultHeadingRef = useRef<HTMLHeadingElement>(null)
  const resolvingRef = useRef(false)
  const { unlock: unlockSound, playCapture, playEscape } = useSoundEffects(uiPreferences.soundEnabled)
  const text = copy[locale]
  const recoveryActive = state.status === 'briefing' ? progress.recoveryRequired : state.isRecovery
  const activeDossierIndex = recoveryActive ? progress.recoveryDossierIndex : selectedDossierIndex
  const dossier = dossiers[activeDossierIndex]
  const maxClues = recoveryActive ? 3 : getDossierMaxClues(dossier)
  const recoveryOptionCount = Math.max(8, Math.ceil(dossier.optionCount * .75))
  const unlockedDossierIndex = progress.highestUnlockedDossier
  const rankProgress = getRankProgress(progress.reputation)
  const caseLabel = recoveryActive
    ? `${text.recoveryFile} #R-${dossier.id}`
    : `${locale === 'vi' ? 'HỒ SƠ' : 'CASE FILE'} #${dossier.id}`
  const careerResult = scoreResult ?? recoveryResult

  useEffect(() => {
    loadCountries().then((result) => {
      setCountries(result.countries)
      setSource(result.source)
      setIsLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!state.round || state.round.weather !== null) return
    let active = true
    fetchWeather(state.round.target).then((weather) => {
      if (active) dispatch({ type: 'SET_WEATHER', weather })
    })
    return () => { active = false }
  }, [state.round?.target.code, state.round?.weather])

  useEffect(() => {
    if (showOnboarding || cinematic) return
    const target = state.status === 'investigating' ? evidenceHeadingRef.current
      : state.status === 'won' || state.status === 'lost' ? resultHeadingRef.current
        : null
    if (!target) return
    const frame = window.requestAnimationFrame(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      target.focus({ preventScroll: true })
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [state.status, state.round?.day, showOnboarding, cinematic])

  const makeRound = (day: number, excludedCodes: string[] = [], recovery = recoveryActive): CaseRound =>
    generateUniquePuzzle(
      countries,
      day,
      randomRef.current,
      excludedCodes,
      recovery ? dossier.clueKinds.slice(0, 3) : dossier.clueKinds,
      recovery ? recoveryOptionCount : dossier.optionCount,
    )

  const startGame = () => {
    if (countries.length < 8) return
    unlockSound()
    setSelected('')
    setQuery('')
    setNotice('')
    setScoreResult(null)
    setPenaltyResult(null)
    setRecoveryResult(null)
    dispatch({ type: 'START', round: makeRound(1), isRecovery: progress.recoveryRequired })
  }

  const submitGuess = () => {
    if (!state.round || resolvingRef.current) return
    if (!selected) {
      setNotice(text.selectPrompt)
      return
    }
    const correct = selected === state.round.target.code
    resolvingRef.current = true
    setCinematic({
      kind: correct ? 'capture' : 'escape',
      final: correct || state.round.day >= 3,
      country: state.round.target.name[locale],
    })
    if (correct) playCapture()
    else playEscape()
    if (correct) {
      if (state.isRecovery) {
        const outcome = applyRecoveryWin(progress, dossier, state.round.day, state.round.target.region)
        setProgress(outcome.progress)
        setRecoveryResult(outcome.result)
        saveProgress(localStorage, outcome.progress)
      } else {
        const outcome = applyCaseWin(
          progress, dossier, activeDossierIndex, state.round.day, state.pointsSpentThisAttempt,
          state.round.target.region,
        )
        setProgress(outcome.progress)
        setScoreResult(outcome.result)
        saveProgress(localStorage, outcome.progress)
      }
    } else if (state.round.day >= 3 && !state.isRecovery) {
      const outcome = applyCaseLoss(progress, dossier, activeDossierIndex)
      setProgress(outcome.progress)
      setPenaltyResult(outcome.result)
      saveProgress(localStorage, outcome.progress)
    } else if (state.round.day >= 3 && state.isRecovery) {
      const updated = applyRecoveryLoss(progress)
      setProgress(updated)
      saveProgress(localStorage, updated)
    }
    const nextRound = !correct && state.round.day < 3
      ? makeRound(state.round.day + 1, [state.round.target.code], state.isRecovery)
      : undefined
    dispatch({ type: 'SUBMIT', countryCode: selected, nextRound })
    setSelected('')
    setQuery('')
    setNotice('')
  }

  const visibleOptions = useMemo(() => {
    if (!state.round) return []
    const normalized = query.trim().toLocaleLowerCase(locale)
    if (!normalized) return state.round.options
    return state.round.options.filter((country) =>
      country.name[locale].toLocaleLowerCase(locale).includes(normalized)
      || country.name.en.toLowerCase().includes(normalized),
    )
  }, [state.round, query, locale])

  const toggleLocale = () => {
    setLocale((current) => current === 'vi' ? 'en' : 'vi')
    setNotice('')
  }

  const closeOnboarding = useCallback(() => {
    setShowOnboarding(false)
    unlockSound()
    setUiPreferences((current) => {
      const updated = { ...current, hasSeenOnboarding: true }
      saveUiPreferences(localStorage, updated)
      return updated
    })
  }, [unlockSound])

  const toggleSound = () => {
    setUiPreferences((current) => {
      const updated = { ...current, soundEnabled: !current.soundEnabled }
      saveUiPreferences(localStorage, updated)
      return updated
    })
    if (!uiPreferences.soundEnabled) unlockSound()
  }

  const finishCinematic = useCallback(() => {
    resolvingRef.current = false
    setCinematic(null)
  }, [])

  const sourceLabel = source === 'network' ? text.dataNetwork : source === 'cache' ? text.dataCache : text.dataFallback

  const purchaseNextClue = () => {
    const nextClueNumber = state.revealedClueCount + 1
    if (nextClueNumber > maxClues) return
    const cost = getNextClueCost(nextClueNumber)
    if (cost === null) return
    const updated = buyClue(progress, cost)
    if (!updated) {
      setNotice(text.notEnoughPoints)
      return
    }
    setProgress(updated)
    saveProgress(localStorage, updated)
    dispatch({ type: 'BUY_CLUE', cost, maxClues })
    setNotice('')
  }

  const openDossier = (index: number) => {
    if (progress.recoveryRequired || index > unlockedDossierIndex) return
    setSelectedDossierIndex(index)
    setNotice('')
  }

  const returnToArchive = (next = false) => {
    // Starting another case must never roll back the balance already awarded
    // on the result screen. Persist once more before resetting attempt state.
    saveProgress(localStorage, progress)
    if (state.isRecovery) setSelectedDossierIndex(progress.recoveryDossierIndex)
    else if (next && selectedDossierIndex < dossiers.length - 1) setSelectedDossierIndex(selectedDossierIndex + 1)
    dispatch({ type: 'RESET' })
    setSelected('')
    setQuery('')
    setNotice('')
    setScoreResult(null)
    setPenaltyResult(null)
    setRecoveryResult(null)
  }

  return (
    <main className="app-shell">
      <div className="grain" />
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true"><span>G</span><i /></div>
        <div className="brand-copy">
          <p>{text.eyebrow}</p>
          <h1>{text.title}</h1>
        </div>
        <div className="rank-chip" aria-label={`${text.reputation}: ${progress.reputation}`}>
          <small>{rankProgress.current.label[locale]}</small><strong>{progress.reputation} REP</strong>
        </div>
        <div className="points-wallet" aria-label={`${text.points}: ${progress.pointBalance}`}>
          <small>{text.points}</small><strong>{progress.pointBalance}</strong><span>PTS</span>
        </div>
        <button className="utility-button" onClick={() => setShowOnboarding(true)} aria-label={locale === 'vi' ? 'Mở hướng dẫn' : 'Open tutorial'}>?</button>
        <button className="utility-button sound-toggle" onClick={toggleSound} aria-label={locale === 'vi' ? 'Bật hoặc tắt âm thanh' : 'Toggle sound'} aria-pressed={uiPreferences.soundEnabled}>
          {uiPreferences.soundEnabled ? '◖))' : '◖×'}
        </button>
        <button className="language-switch" onClick={toggleLocale} aria-label="Switch language">
          <span className={locale === 'vi' ? 'active' : ''}>VI</span><i /><span className={locale === 'en' ? 'active' : ''}>EN</span>
        </button>
      </header>

      <section className="case-strip">
        <span>{caseLabel}</span><span className="case-status">● {sourceLabel}</span><span>{text.classified}</span>
      </section>

      {state.status === 'briefing' && (
        <>
          {!progress.recoveryRequired ? (
            <section className="archive panel-enter">
              <div className="archive-heading">
                <div><span className="kicker">◢ {text.caseArchive}</span><h2>{text.chooseCase}</h2></div>
                <p>{text.archiveHint}</p>
              </div>
              <section className="career-profile" aria-label={text.careerProfile}>
                <div className="career-rank">
                  <span className="career-seal">G</span>
                  <div>
                    <small>{text.careerProfile}</small>
                    <strong>{rankProgress.current.label[locale]}</strong>
                    <div className="reputation-track"><i style={{ width: `${rankProgress.percent}%` }} /></div>
                    <p>{rankProgress.next
                      ? interpolate(text.nextRank, { points: rankProgress.remaining, rank: rankProgress.next.label[locale] })
                      : text.maxRank}
                    </p>
                  </div>
                  <div className="daily-reputation">
                    <small>{text.dailyReputation}</small>
                    <strong>{progress.reputationCasesToday} / {DAILY_REPUTATION_CASE_LIMIT}</strong>
                  </div>
                </div>
                <div className="badge-vault">
                  <small>{text.badges}</small>
                  {progress.earnedBadges.length ? (
                    <div className="badge-list">
                      {progress.earnedBadges.map((badgeId) => {
                        const badge = badgeCatalog[badgeId]
                        return (
                          <div className="badge-token" key={badgeId} title={badge.description[locale]}>
                            <span>{badge.icon}</span><b>{badge.name[locale]}</b>
                          </div>
                        )
                      })}
                    </div>
                  ) : <p>{text.noBadges}</p>}
                </div>
              </section>
              <div className="dossier-rail">
                {dossiers.map((item, index) => {
                  const locked = index > unlockedDossierIndex
                  return (
                    <button
                      key={item.id}
                      className={`dossier-tab ${selectedDossierIndex === index ? 'selected' : ''} ${locked ? 'locked' : ''}`}
                      onClick={() => openDossier(index)}
                      disabled={locked}
                    >
                      <span>{locked ? '⌁' : `#${item.id}`}</span>
                      <b>{item.title[locale]}</b>
                      <small>{locked
                        ? text.locked
                        : `${difficultyLabels[locale][item.difficulty]} · ${progress.bestScoresByDossier[item.id] ?? 0} PTS`}
                      </small>
                    </button>
                  )
                })}
              </div>
            </section>
          ) : (
            <section className="recovery-notice panel-enter" role="status">
              <div><span>!</span><strong>{text.recoveryStatus}</strong></div>
              <p>{text.recoveryArchiveHint}</p>
            </section>
          )}
          <section className={`briefing panel-enter ${progress.recoveryRequired ? 'recovery-briefing' : ''}`} key={`${dossier.id}-${progress.recoveryRequired}`}>
            <div className="file-tab">{caseLabel} · {difficultyLabels[locale][dossier.difficulty]}</div>
            <div className="briefing-grid">
              <div className="suspect-card">
                <div className="suspect-silhouette" aria-hidden="true"><div className="head"/><div className="shoulders"/></div>
                <div className="redacted"><span/><span/><span/></div>
                <small>SUBJECT / 7X–{dossier.id}</small>
              </div>
              <div className="briefing-copy">
                <span className="kicker">◢ {progress.recoveryRequired ? text.recoveryStatus : text.briefing}</span>
                <h2>{progress.recoveryRequired ? text.recoveryTitle : dossier.title[locale]}</h2>
                <p>{progress.recoveryRequired ? text.recoveryBriefing : dossier.briefing[locale]}</p>
                <div className="case-metrics">
                  <span><b>3 / {maxClues}</b> {text.cluesCount}</span>
                  <span><b>{progress.recoveryRequired ? recoveryOptionCount : dossier.optionCount}</b> {text.suspectsCount}</span>
                  <span><b>{progress.recoveryRequired ? `+${RECOVERY_REWARD}` : progress.bestScoresByDossier[dossier.id] ?? 0}</b> {progress.recoveryRequired ? 'PTS' : text.bestScore}</span>
                </div>
                <div className="route-line"><span>{dossier.origin}</span><i/><b>?</b><i/><span>72H</span></div>
                <button className="primary-button" onClick={startGame} disabled={isLoading}>
                  <span>{isLoading ? text.loading : progress.recoveryRequired ? text.startRecovery : text.start}</span><b>→</b>
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {state.status === 'investigating' && state.round && (
        <section className="investigation panel-enter">
          {state.isRecovery && <div className="recovery-mode-badge">◆ {text.recoveryBadge}</div>}
          <div className="day-header">
            <div><span>{text.day}</span><strong>0{state.round.day}</strong></div>
            <div className="day-track" aria-label={`${state.round.day} / 3`}>
              {[1, 2, 3].map((day) => <i key={day} className={day <= state.round!.day ? 'active' : ''}/>)}
            </div>
            <p><b>{4 - state.round.day}</b> {text.daysRemaining}</p>
          </div>

          {state.lastWrongCountry && (
            <div className="alert" role="status">× {interpolate(text.wrong, { country: state.lastWrongCountry.name[locale] })}</div>
          )}

          <div className="board-grid">
            <section className="evidence-board">
              <div className="section-heading"><span>01</span><h2 ref={evidenceHeadingRef} tabIndex={-1}>{text.evidence}</h2></div>
              <div className="clue-list">
                {state.round.clues.slice(0, maxClues).map((clue, index) => {
                  const clueNumber = index + 1
                  const revealed = clueNumber <= state.revealedClueCount
                  const cost = getNextClueCost(clueNumber)
                  const isNext = clueNumber === state.revealedClueCount + 1
                  return revealed ? (
                    <article className="clue-card" key={`${clue.kind}-${index}`}>
                      <div className="clue-icon">{icons[index % icons.length]}</div>
                      <div><small>{locale === 'vi' ? `MANH MỐI 0${clueNumber}` : `CLUE 0${clueNumber}`}</small><p>{formatClue(clue, locale)}</p></div>
                      <span className="pin"/>
                    </article>
                  ) : (
                    <article className="clue-card locked-clue" key={`${clue.kind}-${index}`}>
                      <div className="clue-icon lock-icon">⌁</div>
                      <div>
                        <small>{locale === 'vi' ? `MANH MỐI 0${clueNumber}` : `CLUE 0${clueNumber}`}</small>
                        <p>{text.encryptedClue}</p>
                      </div>
                      {isNext && cost !== null && (
                        <button
                          className="unlock-clue"
                          onClick={purchaseNextClue}
                          disabled={progress.pointBalance < cost}
                        >
                          {text.unlock} · {cost} PTS
                        </button>
                      )}
                    </article>
                  )
                })}
              </div>

              <div className="live-intel">
                <div className="pulse"><i/></div>
                <div><small>{text.lead}</small><p>
                  {state.round.weather === null
                    ? text.weatherLoading
                    : state.round.weather.available
                      ? formatWeather(state.round.weather, state.round.target.capital, locale)
                      : interpolate(text.timezoneFallback, { timezone: state.round.target.timezones[0] ?? 'UTC' })}
                </p></div>
              </div>
            </section>

            <section className="decision-panel">
              <div className="section-heading"><span>02</span><h2>{text.choose}</h2></div>
              <label className="search-box">
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></svg>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.search} />
              </label>
              <div className="country-grid" role="listbox" aria-label={text.choose}>
                {visibleOptions.map((country) => (
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected === country.code}
                    className={selected === country.code ? 'country-option selected' : 'country-option'}
                    key={country.code}
                    onClick={() => { setSelected(country.code); setNotice('') }}
                  >
                    <span className={dossier.hideFlags ? 'redacted-flag' : ''}>{dossier.hideFlags ? '◼' : country.flag}</span>
                    <b>{country.name[locale]}</b>
                    <small>{dossier.hideCodes ? '•••' : country.code}</small>
                  </button>
                ))}
              </div>
              {visibleOptions.length === 0 && <div className="empty-state">— NO MATCH —</div>}
              <button className="primary-button arrest-button" onClick={submitGuess}><span>{text.arrest}</span><b>⌖</b></button>
              {notice && <p className="form-notice" role="alert">{notice}</p>}
            </section>
          </div>
        </section>
      )}

      {(state.status === 'won' || state.status === 'lost') && state.round && (
        <section className={`result-card panel-enter ${state.status} ${state.isRecovery ? 'recovery-result' : ''}`}>
          <div className="result-stamp">{state.isRecovery ? 'RECOVERY' : state.status === 'won' ? 'CLOSED' : 'COLD CASE'}</div>
          <span className="result-flag">{state.round.target.flag}</span>
          <p className="kicker">{caseLabel}</p>
          <h2 ref={resultHeadingRef} tabIndex={-1}>{state.isRecovery
            ? state.status === 'won' ? text.recoveryWonTitle : text.recoveryLostTitle
            : state.status === 'won' ? text.wonTitle : text.lostTitle}
          </h2>
          <p>{interpolate(state.isRecovery
            ? state.status === 'won' ? text.recoveryWonBody : text.recoveryLostBody
            : state.status === 'won' ? text.wonBody : text.lostBody, {
            country: state.round.target.name[locale], day: state.round.day,
          })}</p>
          {state.status === 'won' && !state.isRecovery && scoreResult && (
            <div className="score-breakdown">
              <div><small>{text.caseScore}</small><strong>{scoreResult.grossScore}</strong></div>
              <div><small>{text.previousBest}</small><strong>{scoreResult.previousBest}</strong></div>
              <div className="score-earned"><small>{text.pointsEarned}</small><strong>+{scoreResult.earnedPoints}</strong></div>
              <div><small>{text.pointsSpent}</small><strong>{scoreResult.pointsSpent > 0 ? `−${scoreResult.pointsSpent}` : '0'}</strong></div>
              <div><small>{text.newBalance}</small><strong>{scoreResult.balance}</strong></div>
            </div>
          )}
          {state.status === 'lost' && !state.isRecovery && penaltyResult && (
            <div className="score-breakdown loss-breakdown">
              <div><small>{text.casePenalty}</small><strong>{penaltyResult.configuredPenalty}</strong></div>
              <div className="score-penalty"><small>{text.pointsDeducted}</small><strong>−{penaltyResult.deductedPoints}</strong></div>
              <div><small>{text.newBalance}</small><strong>{penaltyResult.balance}</strong></div>
            </div>
          )}
          {state.isRecovery && state.status === 'won' && recoveryResult && (
            <div className="score-breakdown recovery-breakdown">
              <div className="score-earned"><small>{text.recoveryReward}</small><strong>+{recoveryResult.reward}</strong></div>
              <div><small>{text.newBalance}</small><strong>{recoveryResult.balance}</strong></div>
            </div>
          )}
          {state.status === 'won' && careerResult && (
            <section className="career-reward" aria-label={text.reputationEarned}>
              <div className="reputation-earned">
                <small>{text.reputationEarned}</small>
                <strong>+{careerResult.reputationEarned} REP</strong>
                {careerResult.reputationEarned === 0 && <p>{text.dailyCapReached}</p>}
              </div>
              {careerResult.rankAdvanced && <div className="rank-up">↟ {text.rankUp} · {rankProgress.current.label[locale]}</div>}
              {careerResult.unlockedBadges.map((badgeId) => {
                const badge = badgeCatalog[badgeId]
                return (
                  <div className="badge-unlocked" key={badgeId}>
                    <span>{badge.icon}</span>
                    <div><small>{text.badgeUnlocked}</small><strong>{badge.name[locale]}</strong></div>
                  </div>
                )
              })}
            </section>
          )}
          {state.isRecovery && state.status === 'lost' && (
            <div className="recovery-safe"><span>✓</span>{text.noFurtherPenalty}</div>
          )}
          {!state.isRecovery && state.status === 'lost' && penaltyResult?.recoveryTriggered && (
            <div className="recovery-triggered">! {text.recoveryRequired}</div>
          )}
          <div className="result-actions">
            {state.isRecovery ? (
              <button className="primary-button" onClick={() => state.status === 'won' ? returnToArchive(false) : startGame()}>
                <span>{state.status === 'won' ? text.resumeCampaign : text.retryRecovery}</span><b>→</b>
              </button>
            ) : state.status === 'won' && selectedDossierIndex < dossiers.length - 1 && (
              <button className="primary-button" onClick={() => returnToArchive(true)}><span>{text.nextCase}</span><b>→</b></button>
            )}
            {!state.isRecovery && (
              <button className={state.status === 'lost' && penaltyResult?.recoveryTriggered ? 'primary-button' : 'secondary-button'} onClick={() => returnToArchive(false)}>
                {state.status === 'lost' && penaltyResult?.recoveryTriggered
                  ? <><span>{text.startRecovery}</span><b>→</b></>
                  : text.replay}
              </button>
            )}
          </div>
        </section>
      )}

      {cinematic && (
        <OutcomeCinematic
          kind={cinematic.kind}
          final={cinematic.final}
          locale={locale}
          country={cinematic.country}
          onComplete={finishCinematic}
        />
      )}

      {showOnboarding && <Onboarding locale={locale} onToggleLocale={toggleLocale} onClose={closeOnboarding} />}

      <footer><span>© 2026 GEO-DETECTIVE</span><span>{text.footer}</span></footer>
    </main>
  )
}

export default App
