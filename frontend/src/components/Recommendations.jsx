import React, { useEffect, useRef } from 'react'
import AOS from 'aos'
import anime from 'animejs/lib/anime.es.js'
import { Activity, Clock, Package, AlertCircle, Droplet, PlusCircle, DollarSign, TrendingUp, Repeat, Award } from 'react-feather'

export default function Recommendations({ data }) {
  const containerRef = useRef(null)

  useEffect(() => {
    AOS.init()
  }, [])

  useEffect(() => {
    if (!data) return
    const el = containerRef.current
    if (!el) return
    anime({
      targets: el.querySelectorAll('[data-anim]'),
      opacity: [0, 1],
      translateY: [20, 0],
      delay: anime.stagger(60),
      duration: 450,
      easing: 'easeOutQuad'
    })
  }, [data])

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6" data-aos="fade-left">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
          <span className="mr-2" /> Recomendações
        </h2>
        <div className="text-center py-12 text-gray-400">
          <p>Preencha os dados das galinhas para obter recomendações personalizadas de alimentação.</p>
        </div>
      </div>
    )
  }

  const { nutrition, feedingTimes, healthNotes, water, supplements, eggs, costs, growth, conversion, eggQuality, amounts, showEggProduction } = data

  return (
    <div className="bg-white rounded-xl shadow-lg p-6" data-aos="fade-left" ref={containerRef}>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <span className="mr-2" /> Recomendações
      </h2>

      <div className="space-y-6" id="recommendations">
        {/* Nutrition */}
        <div className="border border-gray-200 rounded-lg p-4" data-anim>
          <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center"><Activity className="mr-2 text-blue-500" /> Composição Nutricional Recomendada</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-600">Proteína</p>
              <p className="font-semibold">{nutrition.protein}%</p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <p className="text-sm text-gray-600">Carboidratos</p>
              <p className="font-semibold">{nutrition.carbs}%</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded">
              <p className="text-sm text-gray-600">Gorduras</p>
              <p className="font-semibold">{nutrition.fats}%</p>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <p className="text-sm text-gray-600">Fibras</p>
              <p className="font-semibold">{nutrition.fiber}%</p>
            </div>
          </div>
        </div>

        {/* Feeding Schedule */}
        <div className="border border-gray-200 rounded-lg p-4" data-anim>
          <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center"><Clock className="mr-2 text-green-500" /> Horário de Alimentação</h3>
          <ul className="space-y-2">
            {feedingTimes.map((t, idx) => (
              <li key={idx} className="flex items-center">
                <span className="mr-2">☀️</span> {t} - {(amounts.amountPerChicken / feedingTimes.length).toFixed(0)} g por galinha
              </li>
            ))}
          </ul>
        </div>

        {/* Quantity */}
        <div className="border border-gray-200 rounded-lg p-4" data-anim>
          <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center"><Package className="mr-2 text-purple-500" /> Quantidade Diária</h3>

          <div>
            <p className="text-sm text-gray-600">Quantidade total por dia:</p>
            <p className="text-xl font-bold">{amounts.totalAmountKg} kg</p>
            <p className="text-sm text-gray-600 mt-1">Quantidade por galinha:</p>
            <p className="text-lg font-semibold">{amounts.amountPerChicken} g</p>
          </div>
        </div>

        {/* Notes */}
        <div className="border border-gray-200 rounded-lg p-4" data-anim>
          <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center"><AlertCircle className="mr-2 text-red-500" /> Observações</h3>
          <p className="text-sm text-gray-600">{healthNotes}</p>
        </div>

        {/* Water */}
        <div className="border border-gray-200 rounded-lg p-4" data-anim>
          <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center"><Droplet className="mr-2 text-blue-500" /> Consumo de Água</h3>
          <div>
            <p className="text-sm text-gray-600">Quantidade diária recomendada:</p>
            <p className="text-xl font-bold">{water.totalWaterL.toFixed(1)} L</p>
            <p className="text-sm text-gray-600 mt-1">Proporção água:ração:</p>
            <p className="text-lg font-semibold">{water.ratio}</p>
          </div>
        </div>

        {/* Supplements */}
        <div className="border border-gray-200 rounded-lg p-4" data-anim>
          <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center"><PlusCircle className="mr-2 text-green-500" /> Suplementos Recomendados</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            {supplements.length === 0 ? (
              <li>Nenhum suplemento adicional recomendado</li>
            ) : supplements.map((s, idx) => (
              <li key={idx} className="flex items-center">✔️ {s}</li>
            ))}
          </ul>
        </div>

        {/* Costs */}
        <div className="border border-gray-200 rounded-lg p-4" data-anim>
          <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center"><DollarSign className="mr-2 text-green-500" /> Custo Estimado de Ração</h3>
          <div>
            <p className="text-sm text-gray-600">Custo diário:</p>
            <p className="text-xl font-bold">{costs.dailyCost.toFixed(2)} €</p>
            <p className="text-sm text-gray-600 mt-1">Custo mensal:</p>
            <p className="text-lg font-semibold">{costs.monthlyCost.toFixed(2)} €</p>
          </div>
        </div>

        {/* Growth */}
        <div className="border border-gray-200 rounded-lg p-4" data-anim>
          <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center"><TrendingUp className="mr-2 text-blue-500" /> Projeção de Crescimento</h3>
          <div>
            <p className="text-sm text-gray-600">Peso projetado em 4 semanas:</p>
            <p className="text-xl font-bold">{growth ? `${growth.projectedWeight.toFixed(2)} kg` : '--'}</p>
            <p className="text-sm text-gray-600 mt-1">Ganho diário estimado:</p>
            <p className="text-lg font-semibold">{growth ? `${growth.dailyGain} g` : '--'}</p>
          </div>
        </div>

        {/* Conversion */}
        <div className="border border-gray-200 rounded-lg p-4" data-anim>
          <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center"><Repeat className="mr-2 text-purple-500" /> Conversão Alimentar</h3>
          <div>
            <p className="text-sm text-gray-600">Ração por ovo produzido:</p>
            <p className="text-xl font-bold">{conversion ? `${conversion.feedPerEgg} kg` : '--'}</p>
            <p className="text-sm text-gray-600 mt-1">Eficiência alimentar:</p>
            <p className="text-lg font-semibold">{conversion ? `${conversion.feedEfficiency}%` : '--'}</p>
          </div>
        </div>

        {/* Egg Quality */}
        <div className="border border-gray-200 rounded-lg p-4" data-anim>
          <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center"><Award className="mr-2 text-yellow-500" /> Qualidade dos Ovos</h3>
          <div>
            <p className="text-sm text-gray-600">Tamanho estimado:</p>
            <p className="text-xl font-bold">{eggQuality ? `${eggQuality.eggSize} g` : '--'}</p>
            <p className="text-sm text-gray-600 mt-1">Cor da gema:</p>
            <p className="text-lg font-semibold">{eggQuality ? eggQuality.yolkColor : '--'}</p>
          </div>
        </div>

        {/* Egg Production */}
        {showEggProduction && (
          <div className="border border-gray-200 rounded-lg p-4" data-anim>
           <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center"><span className="mr-2">🥚</span> Estimativa de Produção de Ovos</h3>

            <div>
              <p className="text-sm text-gray-600">Produção diária estimada:</p>
              <p className="text-xl font-bold">{eggs.eggProduction} ovos/dia</p>
              <p className="text-sm text-gray-600 mt-1">Taxa de postura:</p>
              <p className="text-lg font-semibold">{Math.round(eggs.layingRate)}%</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
