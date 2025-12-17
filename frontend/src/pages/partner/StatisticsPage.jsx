import React, { useState, useEffect } from 'react'
import api from '../../api/api'
import './StatisticsPage.css'

function PartnerStatisticsPage() {
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/api/partner/statistics')
      setStatistics(response.data)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="statistics-page">Загрузка...</div>
  }

  if (!statistics) {
    return <div className="statistics-page">Ошибка при загрузке статистики</div>
  }

  return (
    <div className="statistics-page">
      <h1>Статистика</h1>
      <div className="statistics-grid">
        <div className="stat-card" style={{ backgroundColor: '#54F094' }}>
          <h2>Всего заказов</h2>
          <p className="stat-value">{statistics.total_orders}</p>
        </div>
        
        <div className="stat-card" style={{ backgroundColor: '#54E3F0' }}>
          <h2>Завершенных заказов</h2>
          <p className="stat-value">{statistics.completed_orders}</p>
        </div>
        
        <div className="stat-card" style={{ backgroundColor: '#54F0C9' }}>
          <h2>Общая выручка</h2>
          <p className="stat-value">{statistics.total_revenue.toFixed(2)} ₽</p>
        </div>
        
        <div className="stat-card" style={{ backgroundColor: '#54B2F0' }}>
          <h2>Активных акций</h2>
          <p className="stat-value">{statistics.active_promotions}</p>
        </div>
        
        <div className="stat-card" style={{ backgroundColor: '#A4F0DD' }}>
          <h2>Товаров</h2>
          <p className="stat-value">{statistics.total_products}</p>
        </div>
      </div>
    </div>
  )
}

export default PartnerStatisticsPage

