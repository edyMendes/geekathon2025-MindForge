import React, { useState } from 'react'

const FIELD_BASE =
  'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'

export default function ChickenForm({ onSubmit }) {
  const [form, setForm] = useState({
    breed: '', age: '', weight: '', quantity: '',
    health: 'healthy', environment: 'free_range', season: 'summer',
    eggPurpose: 'consumption', stressLevel: 'low', feedType: 'commercial'
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    const e = {}
    if (!form.breed) e.breed = 'Selecione a raça'
    if (form.age === '' || Number(form.age) < 0) e.age = 'Indique a idade'
    if (form.weight === '' || Number(form.weight) <= 0) e.weight = 'Indique o peso médio (kg)'
    if (form.quantity === '' || Number(form.quantity) <= 0) e.quantity = 'Indique a quantidade'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = (ev) => {
    ev.preventDefault()
    if (!validate()) return
    onSubmit({ ...form })
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6" data-aos="fade-right">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <span className="mr-2" /> Dados das Galinhas
      </h2>
      <form onSubmit={submit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Raça</label>
            <select name="breed" value={form.breed} onChange={handleChange} className={FIELD_BASE}>
              <option value="" disabled>Selecione a raça</option>
              <option value="rhode_island">Rhode Island Red</option>
              <option value="leghorn">Leghorn Branca</option>
              <option value="sussex">Sussex</option>
              <option value="orpington">Orpington</option>
              <option value="plymouth">Plymouth Rock</option>
              <option value="outra">Outra raça</option>
            </select>
            {errors.breed && <p className="text-sm text-red-600 mt-1">{errors.breed}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Idade (semanas)</label>
            <input type="number" name="age" min="0" value={form.age} onChange={handleChange}
                   className={FIELD_BASE} placeholder="Ex: 20" />
            {errors.age && <p className="text-sm text-red-600 mt-1">{errors.age}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Peso médio (kg)</label>
            <input type="number" name="weight" step="0.1" min="0" value={form.weight} onChange={handleChange}
                   className={FIELD_BASE} placeholder="Ex: 2.5" />
            {errors.weight && <p className="text-sm text-red-600 mt-1">{errors.weight}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade de galinhas</label>
            <input type="number" name="quantity" min="1" value={form.quantity} onChange={handleChange}
                   className={FIELD_BASE} placeholder="Ex: 50" />
            {errors.quantity && <p className="text-sm text-red-600 mt-1">{errors.quantity}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condições de saúde</label>
            <select name="health" value={form.health} onChange={handleChange} className={FIELD_BASE}>
              <option value="healthy">Saudáveis</option>
              <option value="respiratory">Problemas respiratórios</option>
              <option value="digestive">Problemas digestivos</option>
              <option value="parasites">Parasitas internos</option>
              <option value="other">Outros problemas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Ambiente</label>
            <select name="environment" value={form.environment} onChange={handleChange} className={FIELD_BASE}>
              <option value="free_range">Livre (Free Range)</option>
              <option value="barn">Galpão convencional</option>
              <option value="battery">Gaiola (Battery)</option>
              <option value="organic">Produção orgânica</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estação do Ano</label>
            <select name="season" value={form.season} onChange={handleChange} className={FIELD_BASE}>
              <option value="summer">Verão</option>
              <option value="winter">Inverno</option>
              <option value="spring">Primavera</option>
              <option value="autumn">Outono</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Finalidade dos Ovos</label>
            <select name="eggPurpose" value={form.eggPurpose} onChange={handleChange} className={FIELD_BASE}>
              <option value="consumption">Consumo humano</option>
              <option value="hatching">Incubação/Reprodução</option>
              <option value="show">Exposição/Show</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Estresse</label>
            <select name="stressLevel" value={form.stressLevel} onChange={handleChange} className={FIELD_BASE}>
              <option value="low">Baixo</option>
              <option value="medium">Médio</option>
              <option value="high">Alto</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Ração Disponível</label>
            <select name="feedType" value={form.feedType} onChange={handleChange} className={FIELD_BASE}>
              <option value="commercial">Comercial</option>
              <option value="homemade">Caseira</option>
              <option value="mixed">Mista</option>
            </select>
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center">
              Calcular Recomendações
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
