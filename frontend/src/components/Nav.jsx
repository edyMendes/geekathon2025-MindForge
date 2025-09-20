import React from 'react'
import { NavLink } from 'react-router-dom'

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-lg transition ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`
      }
      end
    >
      {children}
    </NavLink>
  )
}

export default function Nav() {
  return (
    <nav className="flex flex-wrap gap-2">
      <NavItem to="/">Dashboard</NavItem>
      <NavItem to="/relatorios">Relatórios</NavItem>
      <NavItem to="/configuracoes">Configurações</NavItem>
    </nav>
  )
}
