import React, { createContext, useContext, useState, useEffect } from 'react'

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

  const addToCart = (product, partnerId) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id && item.partnerId === partnerId)
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id && item.partnerId === partnerId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, partnerId, quantity: 1 }]
    })
  }

  const removeFromCart = (productId, partnerId) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.partnerId === partnerId)))
  }

  const updateQuantity = (productId, partnerId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, partnerId)
      return
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId && item.partnerId === partnerId
          ? { ...item, quantity }
          : item
      )
    )
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

