import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './RegisterPage.css'

function RegisterPage() {
  const [searchParams] = useSearchParams()
  const typeFromUrl = searchParams.get('type') || 'customer'
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    full_name: '',
    phone: '',
    user_type: typeFromUrl
  })
  const { register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const type = searchParams.get('type')
    if (type === 'customer' || type === 'partner') {
      setFormData(prev => ({ ...prev, user_type: type }))
    }
  }, [searchParams])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await register(formData)
    if (success) {
      if (formData.user_type === 'partner') {
        navigate('/partner/register')
      } else {
        navigate('/customer')
      }
    }
  }

  return (
    <div className="register-page page-transition">
      <div className="register-left">
        <div className="register-container">
          <h1>Регистрация</h1>
          <form onSubmit={handleSubmit} className="register-form">
            <div className="user-type-selector">
              <label className="radio-label">
                <input
                  type="radio"
                  name="user_type"
                  value="customer"
                  checked={formData.user_type === 'customer'}
                  onChange={handleChange}
                />
                <span>Покупатель</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="user_type"
                  value="partner"
                  checked={formData.user_type === 'partner'}
                  onChange={handleChange}
                />
                <span>Партнер</span>
              </label>
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Введите ваш email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="username">Имя пользователя</label>
              <input
                id="username"
                type="text"
                name="username"
                placeholder="Введите имя пользователя"
                value={formData.username}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Введите пароль"
                value={formData.password}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="full_name">Полное имя</label>
              <input
                id="full_name"
                type="text"
                name="full_name"
                placeholder="Введите ваше имя"
                value={formData.full_name}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Телефон</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="Введите номер телефона"
                value={formData.phone}
                onChange={handleChange}
                className="input"
              />
            </div>
            <button type="submit" className="btn-register">
              Зарегистрироваться
            </button>
            <p className="login-link">
              Уже есть аккаунт? <Link to="/login">Войти</Link>
            </p>
          </form>
        </div>
      </div>
      <div className="register-right">
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

export default RegisterPage
