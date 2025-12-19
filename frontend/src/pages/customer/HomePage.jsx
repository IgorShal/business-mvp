import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api, { getImageUrl } from '../../api/api'
import { useCart } from '../../contexts/CartContext'
import toast from 'react-hot-toast'
import './HomePage.css'

function HomePage() {
  const [promotions, setPromotions] = useState([])
  const [products, setProducts] = useState([])
  const [partners, setPartners] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const { addToCart } = useCart()

  useEffect(() => {
    fetchPromotions()
    fetchProducts()
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

  const fetchPromotions = async () => {
    try {
      const response = await api.get('/api/customer/promotions')
      console.log('Fetched promotions:', response.data)
      setPromotions(response.data || [])
    } catch (error) {
      console.error('Error fetching promotions:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/customer/products')
      setProducts(response.data.slice(0, 12))
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const filteredPromotions = promotions.filter(p => {
    if (!p) return false
    return p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const filteredProducts = products.filter(p => 
    p.is_available && p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddToCart = async (product, partnerId) => {
    const result = await addToCart(product, partnerId)
    if (result.success) {
      toast.success('Товар добавлен в корзину')
    } else {
      toast.error(result.error || 'Не удалось добавить товар в корзину')
    }
  }

  return (
    <div className="home-page">
      <section className="hero-section">
        <h1>Добро пожаловать в GoiEat</h1>
        <p className="hero-description">
          Лучший сервис для заказа еды и товаров из ваших любимых заведений.
          Получайте акции, делайте заказы онлайн и наслаждайтесь быстрой доставкой!
        </p>
        <div className="hero-features">
          <div className="feature-card feature-card-1">
            <h3>Большой выбор</h3>
            <p>Тысячи товаров от проверенных партнеров</p>
          </div>
          <div className="feature-card feature-card-2">
            <h3>Выгодные акции</h3>
            <p>Постоянные скидки и специальные предложения</p>
          </div>
          <div className="feature-card feature-card-3">
            <h3>Быстрая доставка</h3>
            <p>Получите заказ в кратчайшие сроки</p>
          </div>
        </div>
      </section>

      <section className="search-section">
        <input
          type="text"
          placeholder="Поиск товаров и акций..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </section>

      <section className="promotions-section">
        <h2>Акции</h2>
        <div className="promotions-grid">
          {filteredPromotions.length > 0 ? filteredPromotions.map(promotion => (
            <Link key={promotion.id} to={`/customer/promotions`} className="promotion-card">
              {promotion.image_url && (
                <img src={getImageUrl(promotion.image_url)} alt={promotion.title} />
              )}
              <div className="promotion-content">
                <h3>{promotion.title}</h3>
                <p>{promotion.description}</p>
                {promotion.discount_percent && (
                  <span className="discount-badge">-{promotion.discount_percent}%</span>
                )}
              </div>
            </Link>
          )) : (
            <p>Акций пока нет</p>
          )}
        </div>
      </section>

      <section className="products-section">
        <h2>Популярные товары</h2>
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              {product.image_url && (
                <img src={getImageUrl(product.image_url)} alt={product.name} />
              )}
              <div className="product-content">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                {partners[product.partner_id] && (
                  <Link 
                    to={`/customer/map?partner=${product.partner_id}`}
                    className="partner-link"
                  >
                    {partners[product.partner_id].name}
                  </Link>
                )}
                <div className="product-footer">
                  <div className="price-section">
                    {product.original_price && product.discount_percent ? (
                      <>
                        <div className="price-with-discount">
                          <span className="old-price">{product.original_price} ₽</span>
                          <span className="new-price">{product.price ? product.price.toFixed(2) : (product.original_price * (1 - product.discount_percent / 100)).toFixed(2)} ₽</span>
                        </div>
                        <span className="discount-badge">-{product.discount_percent}%</span>
                      </>
                    ) : (
                      <span className="price">{product.price || 0} ₽</span>
                    )}
                  </div>
                  <button 
                    onClick={() => handleAddToCart(product, product.partner_id)} 
                    className="btn btn-primary"
                  >
                    В корзину
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage

