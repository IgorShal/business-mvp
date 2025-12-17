import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/api'
import { QRCodeSVG } from 'qrcode.react'
import './OrdersPage.css'

function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)

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
    <div className="orders-page">
      <h1>Мои заказы</h1>
      {orders.length === 0 ? (
        <div className="empty-orders">
          <p>У вас пока нет заказов</p>
        </div>
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
                <div className="qr-section">
                  <button 
                    onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                    className="btn-show-qr"
                  >
                    {selectedOrder === order.id ? 'Скрыть QR-код' : 'Показать QR-код'}
                  </button>
                  {selectedOrder === order.id && (
                    <div className="qr-code-container">
                      <QRCodeSVG value={order.qr_code} size={200} />
                      <p>Покажите этот QR-код в заведении</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrdersPage

