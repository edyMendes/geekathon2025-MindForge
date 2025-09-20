import React from 'react'

export default function Relatorios() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Relatórios</h2>
      <p className="text-gray-600 mb-6">Gera e exporta resumos de consumo, custos e produção de ovos.</p>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-800 mb-2">Resumo Diário</h3>
          <ul className="text-sm text-gray-600 list-disc ml-4">
            <li>Consumo de ração total</li>
            <li>Água consumida</li>
            <li>Produção de ovos</li>
          </ul>
          <button className="mt-3 px-3 py-2 bg-gray-900 text-white rounded-lg text-sm">Exportar CSV</button>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-800 mb-2">Custo Mensal</h3>
          <p className="text-sm text-gray-600">Projeção de custos com base nos últimos 30 dias.</p>
          <button className="mt-3 px-3 py-2 bg-gray-900 text-white rounded-lg text-sm">Exportar PDF</button>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-800 mb-2">Eficiência Alimentar</h3>
          <p className="text-sm text-gray-600">FCR médio e ração por ovo.</p>
          <button className="mt-3 px-3 py-2 bg-gray-900 text-white rounded-lg text-sm">Exportar XLSX</button>
        </div>
      </div>
    </div>
  )
}
