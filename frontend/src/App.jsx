import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import Nav from './components/Nav.jsx'

export default function App() {
  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-6">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-center md:text-left">
              <Link to="/" className="inline-block">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Gestor de Ração para Galinhas</h1>
              </Link>
              <p className="text-gray-600">Otimize a alimentação do seu plantel com recomendações personalizadas</p>
            </div>
            <Nav />
          </div>
        </header>

        <main>
          <Outlet />
        </main>

        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Gestor de Ração para Galinhas. Todos os direitos reservados.</p>
          <p className="mt-2">Recomendações baseadas em diretrizes gerais — consulte um veterinário para orientações específicas.</p>
        </footer>
      </div>
    </div>
  )
}
