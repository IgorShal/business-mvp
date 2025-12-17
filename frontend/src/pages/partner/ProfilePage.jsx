import React, { useState, useEffect } from 'react'
import api from '../../api/api'
import toast from 'react-hot-toast'
import './ProfilePage.css'

function PartnerProfilePage() {
  const [profile, setProfile] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: ''
  })
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/partner/profile')
      setProfile(response.data)
      setFormData({
        name: response.data.name,
        description: response.data.description || '',
        address: response.data.address || '',
        phone: response.data.phone || ''
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      await api.put('/api/partner/profile', formData)
      toast.success('Профиль обновлен')
      setEditing(false)
      fetchProfile()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка при обновлении профиля')
    }
  }

  if (!profile) {
    return <div className="profile-page">Загрузка...</div>
  }

  return (
    <div className="profile-page">
      <h1>Профиль заведения</h1>
      {!editing ? (
        <div className="profile-info">
          <div className="info-card">
            <h2>{profile.name}</h2>
            <p><strong>Описание:</strong> {profile.description || 'Не указано'}</p>
            <p><strong>Адрес:</strong> {profile.address || 'Не указано'}</p>
            <p><strong>Телефон:</strong> {profile.phone || 'Не указано'}</p>
            <p><strong>Координаты:</strong> {profile.latitude.toFixed(6)}, {profile.longitude.toFixed(6)}</p>
            <button onClick={() => setEditing(true)} className="btn btn-primary">
              Редактировать
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="profile-form">
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
            placeholder="Описание"
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
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Сохранить
            </button>
            <button type="button" onClick={() => { setEditing(false); fetchProfile(); }} className="btn btn-secondary">
              Отмена
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default PartnerProfilePage

