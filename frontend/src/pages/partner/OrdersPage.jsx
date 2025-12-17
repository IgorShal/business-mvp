import React, { useState, useEffect } from 'react'
import api from '../../api/api'
import toast from 'react-hot-toast'
import './OrdersPage.css'

function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
    // Set up WebSocket connection for real-time updates
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const token = localStorage.getItem('token')
    if (user.id && token) {
      const ws = new WebSocket(`ws://localhost:8000/api/ws/orders/${user.id}?token=${encodeURIComponent(token)}`)
      
      ws.onopen = () => {
        console.log('WebSocket connected')
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'order_update') {
          fetchOrders() // Refresh orders when update received
        }
      }

      return () => {
        ws.close()
      }
    }
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/partner/orders')
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      if (error.response?.status === 403) {
        toast.error('Нет доступа. Убедитесь, что вы зарегистрированы как партнер.')
      } else if (error.response?.status === 404) {
        toast.error('Профиль партнера не найден. Пожалуйста, зарегистрируйте заведение.')
      } else {
        toast.error('Ошибка при загрузке заказов')
      }
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/api/partner/orders/${orderId}`, { status: newStatus })
      toast.success('Статус заказа обновлен')
      fetchOrders()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка при обновлении статуса')
    }
  }

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот заказ?')) {
      return
    }
    
    try {
      await api.delete(`/api/partner/orders/${orderId}`)
      toast.success('Заказ удален')
      fetchOrders()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка при удалении заказа')
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

  if (loading) {
    return <div className="orders-page">Загрузка...</div>
  }

  return (
    <div className="orders-page">
      <h1>Управление заказами</h1>
      {orders.length === 0 ? (
        <p>Заказов пока нет</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <h2>Заказ #{order.id}</h2>
                <span className={`status status-${order.status}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
              
              <div className="order-info">
                <p><strong>Сумма:</strong> {order.total_amount} ₽</p>
                <p><strong>Дата:</strong> {new Date(order.created_at).toLocaleString('ru-RU')}</p>
                {order.qr_code && (
                  <p><strong>QR-код:</strong> {order.qr_code}</p>
                )}
              </div>

              {order.items && order.items.length > 0 && (
                <div className="order-items">
                  <h3>Товары:</h3>
                  <ul>
                    {order.items.map(item => (
                      <li key={item.id}>
                        {item.product?.name} x{item.quantity} - {item.price * item.quantity} ₽
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="order-actions">
                {order.status === 'in_queue' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'in_process')}
                    className="btn btn-secondary"
                  >
                    Взять в работу
                  </button>
                )}
                {order.status === 'in_process' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'ready')}
                    className="btn btn-primary"
                  >
                    Готов
                  </button>
                )}
                {order.status === 'ready' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'completed')}
                    className="btn btn-primary"
                  >
                    Завершить
                  </button>
                )}
                {order.status === 'completed' && (
                  <button
                    onClick={() => deleteOrder(order.id)}
                    className="btn btn-danger"
                  >
                    Удалить заказ
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrdersPage

