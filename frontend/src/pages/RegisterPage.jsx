import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/api'
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
  const { register, login } = useAuth()
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
      // Auto login after registration
      const loginSuccess = await login(formData.username, formData.password)
      if (loginSuccess) {
        if (formData.user_type === 'partner') {
          navigate('/partner/register')
        } else {
          navigate('/customer')
        }
      }
    }
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>Регистрация</h1>
        <form onSubmit={handleSubmit}>
          <div className="user-type-selector">
            <label>
              <input
                type="radio"
                name="user_type"
                value="customer"
                checked={formData.user_type === 'customer'}
                onChange={handleChange}
              />
              Покупатель
            </label>
            <label>
              <input
                type="radio"
                name="user_type"
                value="partner"
                checked={formData.user_type === 'partner'}
                onChange={handleChange}
              />
              Партнер
            </label>
          </div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input"
          />
          <input
            type="text"
            name="username"
            placeholder="Имя пользователя"
            value={formData.username}
            onChange={handleChange}
            required
            className="input"
          />
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={handleChange}
            required
            className="input"
          />
          <input
            type="text"
            name="full_name"
            placeholder="Полное имя"
            value={formData.full_name}
            onChange={handleChange}
            className="input"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Телефон"
            value={formData.phone}
            onChange={handleChange}
            className="input"
          />
          <button type="submit" className="btn btn-primary">
            Зарегистрироваться
          </button>
        </form>
        <p>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage

