import React from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './CustomerLayout.css'

function CustomerLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="customer-layout">
      <nav className="customer-nav">
        <div className="nav-brand">
          <Link to="/customer">Business MVP</Link>
        </div>
        <div className="nav-links">
          <Link to="/customer">Главная</Link>
          <Link to="/customer/promotions">Акции</Link>
          <Link to="/customer/map">Карта</Link>
          <Link to="/customer/cart">Корзина</Link>
          <Link to="/customer/orders">Заказы</Link>
          <Link to="/customer/profile">Профиль</Link>
          <Link to="/customer/how-it-works">Как это работает</Link>
          <button onClick={handleLogout} className="btn-logout">Выход</button>
        </div>
      </nav>
      <main className="customer-main">
        <Outlet />
      </main>
    </div>
  )
}

export default CustomerLayout

