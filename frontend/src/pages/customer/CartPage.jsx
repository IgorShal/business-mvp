import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import api from '../../api/api'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'
import './CartPage.css'

function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotal } = useCart()
  const [orderPlaced, setOrderPlaced] = useState(null)
  const [partners, setPartners] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    try {
      const response = await api.get('/api/customer/partners')
      const partnersMap = {}
      response.data.forEach(partner => {
        partnersMap[partner.id] = partner
      })
      setPartners(partnersMap)
    } catch (error) {
      console.error('Error fetching partners:', error)
    }
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Корзина пуста')
      return
    }

    // Group items by partner
    const ordersByPartner = {}
    cart.forEach(item => {
      if (!ordersByPartner[item.partnerId]) {
        ordersByPartner[item.partnerId] = []
      }
      ordersByPartner[item.partnerId].push({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      })
    })

    try {
      // Create orders for each partner
      for (const [partnerId, items] of Object.entries(ordersByPartner)) {
        const orderData = {
          partner_id: parseInt(partnerId),
          items: items
        }
        const response = await api.post('/api/customer/orders', orderData)
        if (response.data) {
          setOrderPlaced(response.data)
          clearCart()
          toast.success('Заказ создан успешно!')
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка при создании заказа')
    }
  }

  if (orderPlaced) {
    return (
      <div className="cart-page">
        <div className="order-success">
          <h1>Заказ успешно создан!</h1>
          <p>Номер заказа: #{orderPlaced.id}</p>
          <p>Статус: {orderPlaced.status === 'in_queue' ? 'В очереди' : orderPlaced.status}</p>
          {orderPlaced.qr_code && (
            <div className="qr-code-container">
              <QRCodeSVG value={orderPlaced.qr_code} size={200} />
              <p>Покажите этот QR-код в заведении</p>
            </div>
          )}
          <button onClick={() => { setOrderPlaced(null); navigate('/customer/orders') }} className="btn btn-primary">
            Посмотреть заказы
          </button>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <h1>Корзина пуста</h1>
        <p>Добавьте товары в корзину, чтобы сделать заказ</p>
        <button onClick={() => navigate('/customer')} className="btn btn-primary">
          Перейти к товарам
        </button>
      </div>
    )
  }

  // Group cart by partner
  const cartByPartner = {}
  cart.forEach(item => {
    if (!cartByPartner[item.partnerId]) {
      cartByPartner[item.partnerId] = []
    }
    cartByPartner[item.partnerId].push(item)
  })

  return (
    <div className="cart-page">
      <h1>Корзина</h1>
      {Object.entries(cartByPartner).map(([partnerId, items]) => (
        <div key={partnerId} className="partner-cart-section">
          <h2>{partners[partnerId]?.name || `Заведение #${partnerId}`}</h2>
          {items.map(item => (
            <div key={`${item.product.id}-${item.partnerId}`} className="cart-item">
              <div className="cart-item-info">
                <h3>{item.product.name}</h3>
                <p>{item.product.description}</p>
                <span className="price">{item.product.price} ₽</span>
              </div>
              <div className="cart-item-controls">
                <button onClick={() => updateQuantity(item.product.id, item.partnerId, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product.id, item.partnerId, item.quantity + 1)}>+</button>
                <button onClick={() => removeFromCart(item.product.id, item.partnerId)} className="btn-remove">
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
      <div className="cart-summary">
        <h2>Итого: {getTotal()} ₽</h2>
        <button onClick={handleCheckout} className="btn btn-primary btn-large">
          Оформить заказ
        </button>
      </div>
    </div>
  )
}

export default CartPage

