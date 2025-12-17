import React from 'react'
import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing-page">
      <div className="landing-hero">
        <h1>Business MVP</h1>
        <p className="hero-subtitle">Лучший сервис для заказа еды и товаров</p>
      </div>

      <div className="features-section">
        <h2>Почему выбирают нас?</h2>
        <div className="features-grid">
          <div className="feature-card" style={{ backgroundColor: '#54F094' }}>
            <div className="feature-icon">🚀</div>
            <h3>Быстро</h3>
            <p>Мгновенное оформление заказов и быстрая обработка</p>
          </div>
          <div className="feature-card" style={{ backgroundColor: '#54E3F0' }}>
            <div className="feature-icon">💰</div>
            <h3>Выгодно</h3>
            <p>Постоянные акции и специальные предложения</p>
          </div>
          <div className="feature-card" style={{ backgroundColor: '#54F0C9' }}>
            <div className="feature-icon">📍</div>
            <h3>Удобно</h3>
            <p>Интерактивная карта с реальными заведениями</p>
          </div>
          <div className="feature-card" style={{ backgroundColor: '#54B2F0' }}>
            <div className="feature-icon">📱</div>
            <h3>Современно</h3>
            <p>Отслеживание заказов в реальном времени</p>
          </div>
        </div>
      </div>

      <div className="user-type-selection">
        <h2>Выберите ваш тип аккаунта</h2>
        <div className="user-type-cards">
          <div className="user-type-card customer-card" onClick={() => navigate('/register?type=customer')}>
            <div className="card-icon">🛒</div>
            <h3>Я покупатель</h3>
            <p>Хочу заказывать товары и еду из заведений</p>
            <ul>
              <li>Просмотр акций и товаров</li>
              <li>Интерактивная карта заведений</li>
              <li>Онлайн заказы с QR-кодами</li>
              <li>Отслеживание статуса заказов</li>
            </ul>
            <button className="btn btn-primary">Начать покупки</button>
          </div>

          <div className="user-type-card partner-card" onClick={() => navigate('/register?type=partner')}>
            <div className="card-icon">🏪</div>
            <h3>Я партнер</h3>
            <p>Хочу добавить свое заведение и продавать товары</p>
            <ul>
              <li>Управление заказами</li>
              <li>Создание товаров и акций</li>
              <li>Статистика продаж</li>
              <li>Регистрация на карте</li>
            </ul>
            <button className="btn btn-secondary">Стать партнером</button>
          </div>
        </div>

        <div className="login-link">
          <p>Уже есть аккаунт? <button onClick={() => navigate('/login')} className="link-button">Войти</button></p>
        </div>
      </div>
    </div>
  )
}

export default LandingPage

