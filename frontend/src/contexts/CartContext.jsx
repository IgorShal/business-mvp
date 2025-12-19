import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/api'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = async (product, partnerId) => {
    try {
      // Проверяем актуальное состояние товара на сервере
      const response = await api.get(`/api/customer/products/${product.id}`)
      const currentProduct = response.data
      
      if (!currentProduct) {
        throw new Error('Товар не найден')
      }
      
      if (!currentProduct.is_available) {
        throw new Error('Товар временно недоступен')
      }
      
      // Если товар в наличии, добавляем в корзину
      setCart(prev => {
        const existingItem = prev.find(item => item.product.id === product.id && item.partnerId === partnerId)
        if (existingItem) {
          return prev.map(item =>
            item.product.id === product.id && item.partnerId === partnerId
              ? { ...item, quantity: item.quantity + 1, product: currentProduct }
              : item
          )
        }
        return [...prev, { product: currentProduct, partnerId, quantity: 1 }]
      })
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || error.message || 'Ошибка при добавлении товара в корзину' 
      }
    }
  }

  const removeFromCart = (productId, partnerId) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.partnerId === partnerId)))
  }

  const updateQuantity = async (productId, partnerId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, partnerId)
      return { success: true }
    }
    
    try {
      // Проверяем наличие товара перед увеличением количества
      const response = await api.get(`/api/customer/products/${productId}`)
      const currentProduct = response.data
      
      if (!currentProduct || !currentProduct.is_available) {
        // Удаляем товар из корзины, если он больше не доступен
        removeFromCart(productId, partnerId)
        return { 
          success: false, 
          error: 'Товар временно недоступен. Он был удален из корзины.' 
        }
      }
      
      setCart(prev =>
        prev.map(item =>
          item.product.id === productId && item.partnerId === partnerId
            ? { ...item, quantity, product: currentProduct }
            : item
        )
      )
      return { success: true }
    } catch (error) {
      // Если товар не найден, удаляем его из корзины
      if (error.response?.status === 404) {
        removeFromCart(productId, partnerId)
        return { 
          success: false, 
          error: 'Товар не найден. Он был удален из корзины.' 
        }
      }
      return { 
        success: false, 
        error: error.response?.data?.detail || error.message || 'Ошибка при обновлении количества' 
      }
    }
  }

  const clearCart = () => {
    setCart([])
  }

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getTotal }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

