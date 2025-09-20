import { useEffect, useState } from 'react'

const DEFAULTS = {
  feedPrices: { commercial: 0.80, homemade: 0.50, mixed: 0.65 },
  waterRatio: 2 // water grams per 1 gram of feed
}

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULTS)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('gr-settings')
      if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) })
    } catch (_) {}
    // eslint-disable-next-line
  }, [])

  const save = (next) => {
    setSettings(next)
    try {
      localStorage.setItem('gr-settings', JSON.stringify(next))
    } catch (_) {}
  }

  return { settings, setSettings: save, DEFAULTS }
}
