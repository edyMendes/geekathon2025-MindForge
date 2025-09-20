import React, { useState } from 'react'
import ChickenForm from '../components/ChickenForm.jsx'
import Recommendations from '../components/Recommendations.jsx'
import { calculateRecommendations } from '../utils/calculate.js'
import { useSettings } from '../hooks/useSettings.js'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const { settings } = useSettings()

  const onSubmit = (formValues) => {
    const res = calculateRecommendations(formValues, settings)
    setData(res)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ChickenForm onSubmit={onSubmit} />
      <Recommendations data={data} />
    </div>
  )
}
