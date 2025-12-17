import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'
import api from '../../api/api'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import './MapPage.css'

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function MapPage() {
  const [partners, setPartners] = useState([])
  const [selectedPartner, setSelectedPartner] = useState(null)
  const [promotions, setPromotions] = useState({})

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    try {
      const response = await api.get('/api/customer/partners')
      setPartners(response.data)
      
      // Fetch promotions for each partner
      for (const partner of response.data) {
        try {
          const promoResponse = await api.get(`/api/customer/promotions?partner_id=${partner.id}`)
          setPromotions(prev => ({ ...prev, [partner.id]: promoResponse.data }))
        } catch (error) {
          console.error(`Error fetching promotions for partner ${partner.id}:`, error)
        }
      }
    } catch (error) {
      console.error('Error fetching partners:', error)
    }
  }

  const defaultCenter = partners.length > 0 
    ? [partners[0].latitude, partners[0].longitude]
    : [55.0084, 82.9357] // Novosibirsk default

  return (
    <div className="map-page">
      <h1>Карта заведений</h1>
      <div className="map-container">
        <MapContainer
          center={defaultCenter}
          zoom={12}
          style={{ height: '600px', width: '100%', borderRadius: '12px' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {partners.map(partner => (
            <Marker
              key={partner.id}
              position={[partner.latitude, partner.longitude]}
              eventHandlers={{
                click: () => setSelectedPartner(partner)
              }}
            >
              <Popup>
                <div className="marker-popup">
                  <h3>{partner.name}</h3>
                  <p>{partner.description}</p>
                  {partner.address && <p>{partner.address}</p>}
                  <Link to={`/customer?partner=${partner.id}`} className="btn btn-primary">
                    Посмотреть товары
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      {selectedPartner && (
        <div className="partner-details">
          <h2>{selectedPartner.name}</h2>
          <p>{selectedPartner.description}</p>
          {promotions[selectedPartner.id] && promotions[selectedPartner.id].length > 0 && (
            <div className="partner-promotions">
              <h3>Акции:</h3>
              {promotions[selectedPartner.id].map(promo => (
                <div key={promo.id} className="promo-card">
                  <h4>{promo.title}</h4>
                  <p>{promo.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MapPage

