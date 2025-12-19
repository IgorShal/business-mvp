import React, { useState, useEffect } from 'react'
import api from '../../api/api'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import './StatisticsPage.css'

function PartnerStatisticsPage() {
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    setLoading(true)
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

  // Форматируем даты для графиков
  const dailySalesData = statistics.daily_sales.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
  }))

  const COLORS = ['#54F094', '#54E3F0', '#54F0C9', '#54B2F0', '#A4F0DD', '#FFB84D', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181']

  return (
    <div className="statistics-page">
      <div className="statistics-header">
        <h1>Статистика</h1>
        <button onClick={fetchStatistics} className="btn-refresh">
          🔄 Обновить
        </button>
      </div>
      
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

      <div className="charts-section">
        <div className="chart-card">
          <h2>Продажи по дням (последние 30 дней)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailySalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="orders" stroke="#54F094" strokeWidth={2} name="Заказы" />
              <Line type="monotone" dataKey="revenue" stroke="#54E3F0" strokeWidth={2} name="Выручка (₽)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Количество покупателей по дням</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailySalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="customers" fill="#54F0C9" name="Покупатели" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {statistics.popular_products && statistics.popular_products.length > 0 && (
          <div className="chart-card">
            <h2>Самые популярные товары</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={statistics.popular_products} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="product_name" type="category" width={150} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_quantity" fill="#54B2F0" name="Количество продаж" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {statistics.popular_products && statistics.popular_products.length > 0 && (
          <div className="chart-card">
            <h2>Выручка по товарам</h2>
            <div className="popular-products-list">
              {statistics.popular_products.map((product, index) => (
                <div key={product.product_id} className="popular-product-item">
                  <div className="product-rank">#{index + 1}</div>
                  <div className="product-info">
                    <h3>{product.product_name}</h3>
                    <p>Продано: {product.total_quantity} шт.</p>
                    <p className="product-revenue">Выручка: {product.total_revenue.toFixed(2)} ₽</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PartnerStatisticsPage

