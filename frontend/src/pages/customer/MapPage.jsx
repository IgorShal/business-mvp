import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useSearchParams } from 'react-router-dom'
import api, { getImageUrl } from '../../api/api'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import './MapPage.css'

// Component to handle map centering
function MapCenter({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [map, center, zoom])
  return null
}

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function MapPage() {
  const [searchParams] = useSearchParams()
  const [partners, setPartners] = useState([])
  const [selectedPartner, setSelectedPartner] = useState(null)
  const [promotions, setPromotions] = useState({})
  const [partnerImages, setPartnerImages] = useState({})
  const [mapCenter, setMapCenter] = useState([55.0084, 82.9357])
  const [mapZoom, setMapZoom] = useState(12)

  useEffect(() => {
    fetchPartners()
  }, [])

  useEffect(() => {
    // Check if partner ID is in URL params
    const partnerId = searchParams.get('partner')
    if (partnerId && partners.length > 0) {
      const partner = partners.find(p => p.id === parseInt(partnerId))
      if (partner) {
        setSelectedPartner(partner)
        setMapCenter([partner.latitude, partner.longitude])
        setMapZoom(15)
      }
    }
  }, [searchParams, partners])

  const fetchPartners = async () => {
    try {
      const response = await api.get('/api/customer/partners')
      setPartners(response.data)
      
      // Fetch promotions and images for each partner
      const imagePromises = response.data.map(async (partner) => {
        try {
          const promoResponse = await api.get(`/api/customer/promotions?partner_id=${partner.id}`)
          setPromotions(prev => ({ ...prev, [partner.id]: promoResponse.data }))
        } catch (error) {
          console.error(`Error fetching promotions for partner ${partner.id}:`, error)
        }
        
        try {
          const imagesResponse = await api.get(`/api/customer/partners/${partner.id}/images`)
          console.log(`Fetched ${imagesResponse.data.length} images for partner ${partner.id}:`, imagesResponse.data)
          if (imagesResponse.data && imagesResponse.data.length > 0) {
            setPartnerImages(prev => ({ ...prev, [partner.id]: imagesResponse.data }))
          }
        } catch (error) {
          console.error(`Error fetching images for partner ${partner.id}:`, error)
        }
      })
      
      await Promise.all(imagePromises)
    } catch (error) {
      console.error('Error fetching partners:', error)
    }
  }

  const handleMarkerClick = (partner) => {
    setSelectedPartner(partner)
    setMapCenter([partner.latitude, partner.longitude])
    setMapZoom(15)
  }

  return (
    <div className="map-page">
      <h1>Карта заведений</h1>
      <div className="map-container">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '600px', width: '100%', borderRadius: '12px' }}
          key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
        >
          <MapCenter center={mapCenter} zoom={mapZoom} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {partners.map(partner => (
            <Marker
              key={partner.id}
              position={[partner.latitude, partner.longitude]}
              eventHandlers={{
                click: () => handleMarkerClick(partner)
              }}
            >
              <Popup>
                <div className="marker-popup">
                  <h3>{partner.name}</h3>
                  {partner.address && <p className="address"><strong>Адрес:</strong> {partner.address}</p>}
                  {partner.description && <p>{partner.description}</p>}
                  {partnerImages[partner.id] && partnerImages[partner.id].length > 0 ? (
                    <div className="popup-images">
                      {partnerImages[partner.id].slice(0, 2).map(image => (
                        <img 
                          key={image.id} 
                          src={getImageUrl(image.image_url)} 
                          alt={`${partner.name} фото`}
                          className="popup-image"
                          onError={(e) => {
                            console.error('Error loading popup image:', image.image_url)
                            e.target.style.display = 'none'
                          }}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      {selectedPartner && (
        <div className="partner-details">
          <h2>{selectedPartner.name}</h2>
          {selectedPartner.address && (
            <p className="address"><strong>Адрес:</strong> {selectedPartner.address}</p>
          )}
          {selectedPartner.description && <p>{selectedPartner.description}</p>}
          
          {partnerImages[selectedPartner.id] && partnerImages[selectedPartner.id].length > 0 ? (
            <div className="partner-images">
              <h3>Фото заведения:</h3>
              <div className="images-gallery">
                {partnerImages[selectedPartner.id].map(image => (
                  <img 
                    key={image.id} 
                    src={getImageUrl(image.image_url)} 
                    alt={`${selectedPartner.name} фото ${image.id}`}
                    className="gallery-image"
                    onError={(e) => {
                      console.error('Error loading image:', image.image_url)
                      e.target.style.display = 'none'
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="partner-images">
              <p>Фото заведения пока нет</p>
            </div>
          )}
          
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

