import React from 'react'
import { useSettings } from '../hooks/useSettings.js'

export default function Configuracoes() {
  const { settings, setSettings, DEFAULTS } = useSettings()

  const updatePrice = (key, value) => {
    const v = Number(value)
    setSettings({ ...settings, feedPrices: { ...settings.feedPrices, [key]: isNaN(v) ? 0 : v } })
  }

  const updateWater = (value) => {
    const v = Number(value)
    setSettings({ ...settings, waterRatio: isNaN(v) || v <= 0 ? DEFAULTS.waterRatio : v })
  }

  const reset = () => setSettings(DEFAULTS)

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Configurações</h2>
      <p className="text-gray-600 mb-6">Define preços padrão de ração e a razão água:ração usada nos cálculos.</p>

      <div className="space-y-6">
        <div>
          <h3 className="font-medium text-gray-800 mb-2">Preços de Ração (€ / kg)</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Comercial</label>
              <input type="number" step="0.01" className="w-full border border-gray-300 rounded-lg px-3 py-2"
                     value={settings.feedPrices.commercial}
                     onChange={(e) => updatePrice('commercial', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Caseira</label>
              <input type="number" step="0.01" className="w-full border border-gray-300 rounded-lg px-3 py-2"
                     value={settings.feedPrices.homemade}
                     onChange={(e) => updatePrice('homemade', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Mista</label>
              <input type="number" step="0.01" className="w-full border border-gray-300 rounded-lg px-3 py-2"
                     value={settings.feedPrices.mixed}
                     onChange={(e) => updatePrice('mixed', e.target.value)} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-800 mb-2">Razão Água:Ração</h3>
          <div className="flex items-center gap-3">
            <span className="text-gray-700">Água por 1g de ração:</span>
            <input type="number" step="0.1" min="0.1"
                   className="w-28 border border-gray-300 rounded-lg px-3 py-2"
                   value={settings.waterRatio}
                   onChange={(e) => updateWater(e.target.value)} />
            <span className="text-gray-500">ex.: 2 → "2 : 1"</span>
          </div>
        </div>

        <div className="pt-2 flex gap-3">
          <button onClick={reset} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Repor valores padrão</button>
        </div>
      </div>
    </div>
  )
}
