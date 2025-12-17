import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/api'
import './ProfilePage.css'

function ProfilePage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/customer/orders')
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const getStatusText = (status) => {
    const statusMap = {
      'in_queue': 'В очереди',
      'in_process': 'В процессе',
      'ready': 'Готов',
      'completed': 'Завершен',
      'cancelled': 'Отменен'
    }
    return statusMap[status] || status
  }

  return (
    <div className="profile-page">
      <h1>Профиль</h1>
      <div className="profile-info">
        <div className="info-card">
          <h2>Личная информация</h2>
          <p><strong>Имя пользователя:</strong> {user?.username}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Полное имя:</strong> {user?.full_name || 'Не указано'}</p>
          <p><strong>Телефон:</strong> {user?.phone || 'Не указано'}</p>
        </div>
      </div>
      
      <div className="orders-section">
        <h2>Мои заказы</h2>
        {orders.length === 0 ? (
          <p>У вас пока нет заказов</p>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <h3>Заказ #{order.id}</h3>
                  <span className={`status status-${order.status}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <p><strong>Заведение:</strong> {order.partner?.name}</p>
                <p><strong>Сумма:</strong> {order.total_amount} ₽</p>
                <p><strong>Дата:</strong> {new Date(order.created_at).toLocaleString('ru-RU')}</p>
                {order.items && order.items.length > 0 && (
                  <div className="order-items">
                    <h4>Товары:</h4>
                    <ul>
                      {order.items.map(item => (
                        <li key={item.id}>
                          {item.product?.name} x{item.quantity} - {item.price * item.quantity} ₽
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {order.qr_code && (
                  <div className="qr-code">
                    <p>QR-код: {order.qr_code}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage

