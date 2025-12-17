import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import LandingPage from './pages/LandingPage'
import CustomerLayout from './layouts/CustomerLayout'
import PartnerLayout from './layouts/PartnerLayout'
import HomePage from './pages/customer/HomePage'
import PromotionsPage from './pages/customer/PromotionsPage'
import MapPage from './pages/customer/MapPage'
import CartPage from './pages/customer/CartPage'
import ProfilePage from './pages/customer/ProfilePage'
import OrdersPage from './pages/customer/OrdersPage'
import HowItWorksPage from './pages/customer/HowItWorksPage'
import PartnerOrdersPage from './pages/partner/OrdersPage'
import PartnerProductsPage from './pages/partner/ProductsPage'
import PartnerPromotionsPage from './pages/partner/PromotionsPage'
import PartnerStatisticsPage from './pages/partner/StatisticsPage'
import PartnerProfilePage from './pages/partner/ProfilePage'
import ProfileImagesPage from './pages/partner/ProfileImagesPage'
import PartnerRegisterPage from './pages/PartnerRegisterPage'
import { PartnerProfileCheck } from './components/PartnerProfileCheck'
import './App.css'

function ProtectedRoute({ children, userType }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div>Загрузка...</div>
  }
  
  if (!user) {
    return <Navigate to="/login" />
  }
  
  if (userType && user.user_type !== userType) {
    return <Navigate to={user.user_type === 'customer' ? '/customer' : '/partner'} />
  }
  
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  
  return (
    <Routes>
      <Route path="/" element={!user ? <LandingPage /> : <Navigate to={user.user_type === 'customer' ? '/customer' : '/partner'} />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={user.user_type === 'customer' ? '/customer' : '/partner'} />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to={user.user_type === 'customer' ? '/customer' : '/partner'} />} />
      
      <Route path="/customer" element={
        <ProtectedRoute userType="customer">
          <CustomerLayout />
        </ProtectedRoute>
      }>
        <Route index element={<HomePage />} />
        <Route path="promotions" element={<PromotionsPage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="how-it-works" element={<HowItWorksPage />} />
      </Route>
      
      <Route path="/partner" element={
        <ProtectedRoute userType="partner">
          <PartnerLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/partner/orders" />} />
        <Route path="register" element={<PartnerRegisterPage />} />
        <Route path="orders" element={<PartnerProfileCheck><PartnerOrdersPage /></PartnerProfileCheck>} />
        <Route path="products" element={<PartnerProfileCheck><PartnerProductsPage /></PartnerProfileCheck>} />
        <Route path="promotions" element={<PartnerProfileCheck><PartnerPromotionsPage /></PartnerProfileCheck>} />
        <Route path="statistics" element={<PartnerProfileCheck><PartnerStatisticsPage /></PartnerProfileCheck>} />
        <Route path="profile" element={<PartnerProfileCheck><PartnerProfilePage /></PartnerProfileCheck>} />
        <Route path="images" element={<PartnerProfileCheck><ProfileImagesPage /></PartnerProfileCheck>} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppRoutes />
          <Toaster position="top-right" />
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App

