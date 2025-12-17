import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import api from '../api/api'
import toast from 'react-hot-toast'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import './PartnerRegisterPage.css'

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function LocationMarker({ onLocationSelect }) {
  const [position, setPosition] = useState(null)
  
  useMapEvents({
    click(e) {
      setPosition(e.latlng)
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })

  return position === null ? null : (
    <Marker position={position} />
  )
}

function PartnerRegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    latitude: null,
    longitude: null
  })
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleLocationSelect = (lat, lng) => {
    setFormData({
      ...formData,
      latitude: lat,
      longitude: lng
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.latitude || !formData.longitude) {
      toast.error('Пожалуйста, выберите местоположение на карте')
      return
    }

    try {
      await api.post('/api/auth/register-partner', formData)
      toast.success('Профиль партнера создан успешно!')
      navigate('/partner/orders')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка при создании профиля')
    }
  }

  return (
    <div className="partner-register-page">
      <h1>Регистрация заведения</h1>
      <p>Выберите местоположение вашего заведения на карте, кликнув на нужное место</p>
      
      <div className="map-container">
        <MapContainer
          center={[55.0084, 82.9357]}
          zoom={12}
          style={{ height: '400px', width: '100%', borderRadius: '12px' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationMarker onLocationSelect={handleLocationSelect} />
        </MapContainer>
      </div>

      {formData.latitude && formData.longitude && (
        <div className="location-info">
          <p>Выбрано местоположение: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="partner-form">
        <input
          type="text"
          name="name"
          placeholder="Название заведения *"
          value={formData.name}
          onChange={handleChange}
          required
          className="input"
        />
        <textarea
          name="description"
          placeholder="Описание заведения"
          value={formData.description}
          onChange={handleChange}
          className="input"
          rows="4"
        />
        <input
          type="text"
          name="address"
          placeholder="Адрес"
          value={formData.address}
          onChange={handleChange}
          className="input"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Телефон"
          value={formData.phone}
          onChange={handleChange}
          className="input"
        />
        <button type="submit" className="btn btn-primary">
          Создать профиль
        </button>
      </form>
    </div>
  )
}

export default PartnerRegisterPage

