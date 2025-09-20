import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import 'aos/dist/aos.css'

import App from './App.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Relatorios from './pages/Relatorios.jsx'
import Configuracoes from './pages/Configuracoes.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'relatorios', element: <Relatorios /> },
      { path: 'configuracoes', element: <Configuracoes /> }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
