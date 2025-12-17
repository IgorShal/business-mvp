import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api, { getImageUrl } from '../../api/api'
import './PromotionsPage.css'

function PromotionsPage() {
  const [promotions, setPromotions] = useState([])
  const [partners, setPartners] = useState({})

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      const response = await api.get('/api/customer/promotions')
      setPromotions(response.data)
      
      // Fetch partner info for each promotion
      const partnerIds = [...new Set(response.data.map(p => p.partner_id))]
      for (const partnerId of partnerIds) {
        try {
          const partnerResponse = await api.get(`/api/customer/partners/${partnerId}`)
          setPartners(prev => ({ ...prev, [partnerId]: partnerResponse.data }))
        } catch (error) {
          console.error(`Error fetching partner ${partnerId}:`, error)
        }
      }
    } catch (error) {
      console.error('Error fetching promotions:', error)
    }
  }

  return (
    <div className="promotions-page">
      <h1>Все акции</h1>
      <div className="promotions-list">
        {promotions.map(promotion => (
          <div key={promotion.id} className="promotion-item">
            {promotion.image_url && (
              <img src={getImageUrl(promotion.image_url)} alt={promotion.title} />
            )}
            <div className="promotion-info">
              <h2>{promotion.title}</h2>
              <p>{promotion.description}</p>
              {partners[promotion.partner_id] && (
                <p className="partner-name">
                  Заведение: {partners[promotion.partner_id].name}
                </p>
              )}
              {promotion.discount_percent && (
                <span className="discount">Скидка: {promotion.discount_percent}%</span>
              )}
              <Link to={`/customer/map?partner=${promotion.partner_id}`} className="btn btn-primary">
                Посмотреть на карте
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PromotionsPage

