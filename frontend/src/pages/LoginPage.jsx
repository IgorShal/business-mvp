import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './LoginPage.css'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await login(email, password)
    if (success) {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      navigate(user.user_type === 'customer' ? '/customer' : '/partner')
    }
  }

  return (
    <div className="login-page page-transition">
      <div className="login-left">
        <div className="login-container">
          <h1>Вход</h1>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Введите ваш email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input
                id="password"
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
              />
            </div>
            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Запомнить меня</span>
              </label>
              <Link to="#" className="forgot-password">Забыли пароль?</Link>
            </div>
            <button type="submit" className="btn-login">
              Войти
            </button>
            <div className="divider">
              <span>Или</span>
            </div>
            <button type="button" className="btn-google">
              Войти через Google
            </button>
            <p className="register-link">
              Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
            </p>
          </form>
        </div>
      </div>
      <div className="login-right">
        <div className="food-background">
          <div className="food-item food-item-1">🍕</div>
          <div className="food-item food-item-2">🍔</div>
          <div className="food-item food-item-3">🍜</div>
          <div className="food-item food-item-4">🥗</div>
          <div className="food-item food-item-5">🍰</div>
          <div className="food-item food-item-6">☕</div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

