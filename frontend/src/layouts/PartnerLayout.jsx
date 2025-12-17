import React from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './PartnerLayout.css'

function PartnerLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="partner-layout">
      <nav className="partner-nav">
        <div className="nav-brand">
          <Link to="/partner">Business MVP - Партнер</Link>
        </div>
        <div className="nav-links">
          <Link to="/partner/orders">Заказы</Link>
          <Link to="/partner/products">Товары</Link>
          <Link to="/partner/promotions">Акции</Link>
          <Link to="/partner/statistics">Статистика</Link>
          <Link to="/partner/profile">Профиль</Link>
          <button onClick={handleLogout} className="btn-logout">Выход</button>
        </div>
      </nav>
      <main className="partner-main">
        <Outlet />
      </main>
    </div>
  )
}

export default PartnerLayout

