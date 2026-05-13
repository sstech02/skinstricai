'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type RacePrediction = {
  label: string
  confidence: number
}

type DistributionEntry = {
  label: string
  confidence: number
}

type Metric = 'race' | 'age' | 'sex'

type AnalysisSummary = {
  age: string | null
  sex: string | null
  races: RacePrediction[]
  ageDistributions: DistributionEntry[]
  sexDistributions: DistributionEntry[]
}

const STORAGE_KEYS = [
  'skinstricPhaseTwoResult',
  'phaseTwoResult',
  'analysisData'
] as const

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

const maybePercent = (value: number): number => {
  return value <= 1 ? value * 100 : value
}

const normalizeRaceEntry = (
  label: string,
  value: unknown
): RacePrediction | null => {
  const confidence = toNumber(value)
  if (confidence === null) return null

  return {
    label,
    confidence: maybePercent(confidence)
  }
}

const toRecord = (value: unknown): Record<string, unknown> | null => {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : null
}

const findFirstByKeys = (
  root: Record<string, unknown>,
  keys: string[]
): unknown => {
  const queue: Record<string, unknown>[] = [root]
  const seen = new Set<Record<string, unknown>>()

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current || seen.has(current)) {
      continue
    }

    seen.add(current)

    for (const key of keys) {
      if (
        key in current &&
        current[key] !== undefined &&
        current[key] !== null
      ) {
        return current[key]
      }
    }

    for (const value of Object.values(current)) {
      const nested = toRecord(value)
      if (nested) {
        queue.push(nested)
      }
    }
  }

  return null
}

const findFirstByKeyPattern = (
  root: Record<string, unknown>,
  pattern: RegExp
): unknown => {
  const queue: Record<string, unknown>[] = [root]
  const seen = new Set<Record<string, unknown>>()

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current || seen.has(current)) {
      continue
    }

    seen.add(current)

    for (const [key, value] of Object.entries(current)) {
      if (pattern.test(key) && value !== undefined && value !== null) {
        return value
      }
    }

    for (const value of Object.values(current)) {
      const nested = toRecord(value)
      if (nested) {
        queue.push(nested)
      }
    }
  }

  return null
}

const parseRacePredictions = (
  analysis: Record<string, unknown>
): RacePrediction[] => {
  const bucketCandidates = [analysis.race, analysis.races, analysis.ethnicity]

  for (const bucket of bucketCandidates) {
    if (!bucket || typeof bucket !== 'object') continue

    const entries = Object.entries(bucket as Record<string, unknown>)
      .map(([label, value]) => normalizeRaceEntry(label, value))
      .filter((entry): entry is RacePrediction => entry !== null)
      .sort((a, b) => b.confidence - a.confidence)

    if (entries.length > 0) {
      return entries.slice(0, 4)
    }
  }

  return []
}

const parseAge = (analysis: Record<string, unknown>): string | null => {
  const candidate =
    findFirstByKeys(analysis, [
      'age',
      'faceAge',
      'face_age',
      'predictedAge',
      'predicted_age',
      'apparentAge',
      'apparent_age',
      'ageGroup',
      'age_group',
      'ageRange',
      'age_range',
      'predictedAgeRange',
      'predicted_age_range',
      'estimatedAge',
      'estimated_age'
    ]) ??
    findFirstByKeyPattern(analysis, /(^|_|-)(age|agegroup|agerange)(_|-|$)/i)

  if (typeof candidate === 'number' && Number.isFinite(candidate)) {
    return `${Math.round(candidate)} years`
  }

  const candidateRecord = toRecord(candidate)

  if (candidateRecord) {
    const direct = toNumber(
      candidateRecord.value ??
        candidateRecord.age ??
        candidateRecord.predictedAge ??
        candidateRecord.predicted_age
    )

    if (direct !== null) {
      return `${Math.round(direct)} years`
    }

    const min = toNumber(
      candidateRecord.min ??
        candidateRecord.lower ??
        candidateRecord.low ??
        candidateRecord.start ??
        candidateRecord.minAge ??
        candidateRecord.min_age
    )
    const max = toNumber(
      candidateRecord.max ??
        candidateRecord.upper ??
        candidateRecord.high ??
        candidateRecord.end ??
        candidateRecord.maxAge ??
        candidateRecord.max_age
    )

    if (min !== null && max !== null) {
      return `${Math.round(min)}-${Math.round(max)} years`
    }

    const rangeLabel =
      (typeof candidateRecord.range === 'string' && candidateRecord.range) ||
      (typeof candidateRecord.label === 'string' && candidateRecord.label)

    if (rangeLabel && rangeLabel.trim().length > 0) {
      return rangeLabel.trim()
    }

    // Confidence-map shape: { "0-2": 0.08, "40-49": 0.59, ... }
    // Pick the key with the highest numeric confidence score.
    const confidenceEntries = Object.entries(candidateRecord)
      .map(([label, value]) => ({ label, score: toNumber(value) }))
      .filter((e): e is { label: string; score: number } => e.score !== null)
      .sort((a, b) => b.score - a.score)

    if (confidenceEntries.length > 0) {
      return confidenceEntries[0].label
    }
  }

  if (typeof candidate === 'string' && candidate.trim().length > 0) {
    const trimmed = candidate.trim()
    const numeric = Number(trimmed)

    if (Number.isFinite(numeric)) {
      return `${Math.round(numeric)} years`
    }

    return trimmed
  }

  return null
}

const parseSex = (analysis: Record<string, unknown>): string | null => {
  const candidate = findFirstByKeys(analysis, [
    'sex',
    'gender',
    'predictedGender',
    'predicted_gender',
    'dominantGender',
    'dominant_gender'
  ])

  if (typeof candidate === 'string' && candidate.trim().length > 0) {
    return candidate.toUpperCase()
  }

  const candidateRecord = toRecord(candidate)

  if (candidateRecord) {
    const entries = Object.entries(candidateRecord)
      .map(([label, value]) => ({ label, score: toNumber(value) }))
      .filter(
        (entry): entry is { label: string; score: number } =>
          entry.score !== null
      )
      .sort((a, b) => b.score - a.score)

    if (entries.length > 0) {
      return entries[0].label.toUpperCase()
    }
  }

  return null
}

const parseDistributions = (
  analysis: Record<string, unknown>,
  keys: string[]
): DistributionEntry[] => {
  const candidate = findFirstByKeys(analysis, keys)
  const candidateRecord = toRecord(candidate)
  if (!candidateRecord) return []

  return Object.entries(candidateRecord)
    .map(([label, value]) => {
      const score = toNumber(value)
      if (score === null) return null
      return { label, confidence: maybePercent(score) }
    })
    .filter((e): e is DistributionEntry => e !== null)
    .sort((a, b) => b.confidence - a.confidence)
}

const parseAnalysisSummary = (raw: unknown): AnalysisSummary | null => {
  if (!raw || typeof raw !== 'object') return null

  const root = raw as Record<string, unknown>
  const nested =
    (root.data as Record<string, unknown> | undefined) ??
    (root.result as Record<string, unknown> | undefined) ??
    root

  const age = parseAge(root) ?? parseAge(nested)
  const sex = parseSex(root) ?? parseSex(nested)
  const races = parseRacePredictions(nested)
  const ageDistributions = parseDistributions(nested, [
    'age',
    'faceAge',
    'face_age',
    'ageGroup',
    'age_group'
  ])
  const sexDistributions = parseDistributions(nested, [
    'gender',
    'sex',
    'predictedGender',
    'predicted_gender'
  ])

  if (!age && !sex && races.length === 0) {
    return null
  }

  return { age, sex, races, ageDistributions, sexDistributions }
}

const getStoredSummary = (): AnalysisSummary | null => {
  if (typeof window === 'undefined') {
    return null
  }

  for (const key of STORAGE_KEYS) {
    const raw = window.localStorage.getItem(key)
    if (!raw) continue

    try {
      const parsed = JSON.parse(raw) as unknown
      const parsedSummary = parseAnalysisSummary(parsed)

      if (parsedSummary) {
        return parsedSummary
      }
    } catch {
      // Ignore malformed storage data and continue scanning known keys.
    }
  }

  return null
}

const formatLabel = (value: string): string => {
  return value
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const getActiveEntry = <T extends { label: string }>(
  entries: T[],
  selected: string | null
): T | null => {
  if (!entries.length) return null
  return (
    (selected && entries.find(entry => entry.label === selected)) || entries[0]
  )
}

export default function SummaryPage () {
  const [selectedMetric, setSelectedMetric] = useState<Metric>('race')
  const [selectedLabels, setSelectedLabels] = useState<
    Record<Metric, string | null>
  >({
    race: null,
    age: null,
    sex: null
  })
  const [summary, setSummary] = useState<AnalysisSummary | null>(null)

  useEffect(() => {
    const handleStorage = () => setSummary(getStoredSummary())
    handleStorage()
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const hasData = summary !== null
  const races = useMemo(() => summary?.races ?? [], [summary])
  const ageDistributions = useMemo(
    () => summary?.ageDistributions ?? [],
    [summary]
  )
  const sexDistributions = useMemo(
    () => summary?.sexDistributions ?? [],
    [summary]
  )

  const activeRace = useMemo(
    () => getActiveEntry(races, selectedLabels.race),
    [races, selectedLabels.race]
  )
  const activeAge = useMemo(
    () => getActiveEntry(ageDistributions, selectedLabels.age),
    [ageDistributions, selectedLabels.age]
  )
  const activeSex = useMemo(
    () => getActiveEntry(sexDistributions, selectedLabels.sex),
    [sexDistributions, selectedLabels.sex]
  )

  const entriesByMetric: Record<Metric, DistributionEntry[]> = {
    race: races,
    age: ageDistributions,
    sex: sexDistributions
  }
  const activeByMetric: Record<Metric, DistributionEntry | null> = {
    race: activeRace,
    age: activeAge,
    sex: activeSex
  }

  const activeEntry = activeByMetric[selectedMetric]
  const metricEntries = entriesByMetric[selectedMetric]

  const activePercent = activeEntry
    ? Math.max(0, Math.min(100, activeEntry.confidence))
    : 0
  const activeLabel = activeEntry?.label ?? null

  const circleCircumference = 308.819
  const circleDashOffset = circleCircumference * (1 - activePercent / 100)
  const metricButtons: Array<{ key: Metric; label: string; value: string }> = [
    {
      key: 'race',
      label: 'RACE',
      value: activeRace ? formatLabel(activeRace.label) : 'Unavailable'
    },
    {
      key: 'age',
      label: 'AGE',
      value: activeAge?.label ?? summary?.age ?? 'Unavailable'
    },
    {
      key: 'sex',
      label: 'SEX',
      value: activeSex
        ? formatLabel(activeSex.label)
        : summary?.sex ?? 'Unavailable'
    }
  ]
  const chartHeading = !activeLabel
    ? 'Unavailable'
    : selectedMetric === 'age'
    ? `${activeLabel} y.o.`
    : formatLabel(activeLabel)
  const getDisplayLabel = (metric: Metric, value: string): string => {
    return metric === 'age' ? value : formatLabel(value)
  }

  return (
    <>
      <div className='navbar'>
        <div className='navbar-logo-section'>
          <Link className='navbar-link' href='/'>
            SKINSTRIC
          </Link>
          <Image
            alt='left-bracket'
            width={5}
            height={19}
            className='navbar-bracket'
            src='/left-bracket.png'
          />
          <p className='navbar-section-label'>INTRO</p>
          <Image
            alt='right-bracket'
            width={5}
            height={19}
            className='navbar-bracket'
            src='/right-bracket.png'
          />
        </div>
        <button className='enter-code-btn'>ENTER CODE</button>
      </div>

      <div className='summary-page'>
        <main className='summary-main'>
          <div className='summary-layout'>
            <div className='summary-header'>
              <h2 className='summary-eyebrow'>A.I. ANALYSIS</h2>
              <h3 className='summary-title'>DEMOGRAPHICS</h3>
              <h4 className='summary-subtitle'>PREDICTED RACE &amp; AGE</h4>
            </div>

            {!hasData && (
              <div className='summary-empty-state'>
                <p className='summary-empty-copy'>
                  No analysis data found. Please upload an image first.
                </p>
                <Link href='/result' className='summary-empty-link'>
                  Go to Upload Page or take a Picture with your device
                </Link>
              </div>
            )}

            {hasData && summary && (
              <div className='summary-grid'>
                <div className='summary-metrics-column'>
                  {metricButtons.map(metric => (
                    <button
                      key={metric.key}
                      type='button'
                      onClick={() => setSelectedMetric(metric.key)}
                      className={`summary-metric-button ${
                        selectedMetric === metric.key
                          ? 'summary-metric-button-active'
                          : 'summary-metric-button-inactive'
                      }`}
                    >
                      <p className='summary-metric-value'>{metric.value}</p>
                      <h4 className='summary-metric-label'>{metric.label}</h4>
                    </button>
                  ))}
                </div>

                <div className='summary-chart-panel'>
                  <p className='summary-chart-heading'>{chartHeading}</p>

                  <div className='summary-chart-wrapper'>
                    <div className='summary-circle-container'>
                      <svg
                        className='CircularProgressbar'
                        viewBox='0 0 100 100'
                      >
                        <path
                          className='CircularProgressbar-trail'
                          d='M 50,50 m 0,-49.15 a 49.15,49.15 0 1 1 0,98.3 a 49.15,49.15 0 1 1 0,-98.3'
                          strokeWidth={1.7}
                          fillOpacity={0}
                        />
                        <path
                          className='CircularProgressbar-path'
                          d='M 50,50 m 0,-49.15 a 49.15,49.15 0 1 1 0,98.3 a 49.15,49.15 0 1 1 0,-98.3'
                          strokeWidth={1.7}
                          fillOpacity={0}
                          strokeDashoffset={circleDashOffset}
                        />
                      </svg>

                      <div className='summary-circle-value-wrap'>
                        <p className='summary-circle-value'>
                          {Math.round(activePercent)}
                          <span className='summary-circle-percent'>%</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className='summary-hint'>
                    If A.I. estimate is wrong, select the correct one.
                  </p>
                </div>

                <div className='summary-list-panel'>
                  <div className='summary-list'>
                    <div className='summary-list-header'>
                      <h4 className='summary-list-header-title'>
                        {selectedMetric.toUpperCase()}
                      </h4>
                      <h4 className='summary-list-header-title'>
                        A.I. CONFIDENCE
                      </h4>
                    </div>

                    {metricEntries.map(entry => {
                      const isActive = activeEntry?.label === entry.label
                      return (
                        <button
                          key={entry.label}
                          type='button'
                          onClick={() => {
                            setSelectedLabels(prev => ({
                              ...prev,
                              [selectedMetric]: entry.label
                            }))
                          }}
                          className={`summary-list-item ${
                            isActive
                              ? 'summary-list-item-active'
                              : 'summary-list-item-inactive'
                          }`}
                        >
                          <span className='summary-list-item-left'>
                            <span
                              className={`summary-list-item-dot ${
                                isActive
                                  ? 'summary-list-item-dot-active'
                                  : 'summary-list-item-dot-inactive'
                              }`}
                            />
                            <span className='summary-list-item-text'>
                              {getDisplayLabel(selectedMetric, entry.label)}
                            </span>
                          </span>
                          <span className='summary-list-item-text'>
                            {Math.round(entry.confidence)}%
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className='summary-nav'>
              <div className='summary-nav-inner'>
                <Link href='/select'>
                  <div>
                    <div className='summary-nav-mobile-diamond'>
                      <span className='summary-nav-mobile-label'>BACK</span>
                    </div>
                    <div className='summary-nav-desktop-group'>
                      <div className='summary-nav-desktop-diamond' />
                      <span className='summary-nav-back-arrow'>▶</span>
                      <span className='summary-nav-desktop-label summary-nav-back-label'>
                        BACK
                      </span>
                    </div>
                  </div>
                </Link>

                <Link href='/'>
                  <div>
                    <div className='summary-nav-mobile-diamond'>
                      <span className='summary-nav-mobile-label'>HOME</span>
                    </div>
                    <div className='summary-nav-home-group'>
                      <span className='summary-nav-desktop-label summary-nav-home-label'>
                        HOME
                      </span>
                      <div className='summary-nav-desktop-diamond' />
                      <span className='summary-nav-home-arrow'>▶</span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
