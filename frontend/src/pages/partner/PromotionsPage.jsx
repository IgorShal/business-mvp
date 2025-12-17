import React, { useState, useEffect } from 'react'
import api, { getImageUrl } from '../../api/api'
import toast from 'react-hot-toast'
import './PromotionsPage.css'

function PartnerPromotionsPage() {
  const [promotions, setPromotions] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    discount_percent: '',
    is_active: true,
    expires_at: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      const response = await api.get('/api/partner/promotions')
      setPromotions(response.data)
    } catch (error) {
      console.error('Error fetching promotions:', error)
      toast.error('Ошибка при загрузке акций')
    }
  }

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value
    })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/api/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data.url
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      let imageUrl = formData.image_url
      
      // Upload image if file selected
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile)
        imageUrl = uploadedUrl
      }
      
      const data = {
        ...formData,
        image_url: imageUrl,
        discount_percent: formData.discount_percent ? parseFloat(formData.discount_percent) : null,
        expires_at: formData.expires_at || null
      }
      
      if (editingPromotion) {
        await api.put(`/api/partner/promotions/${editingPromotion.id}`, data)
        toast.success('Акция обновлена')
      } else {
        await api.post('/api/partner/promotions', data)
        toast.success('Акция создана')
      }
      setShowForm(false)
      setEditingPromotion(null)
      setImageFile(null)
      setImagePreview(null)
      setFormData({
        title: '',
        description: '',
        image_url: '',
        discount_percent: '',
        is_active: true,
        expires_at: ''
      })
      fetchPromotions()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка при сохранении акции')
    }
  }

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion)
    setFormData({
      title: promotion.title,
      description: promotion.description || '',
      image_url: promotion.image_url || '',
      discount_percent: promotion.discount_percent?.toString() || '',
      is_active: promotion.is_active,
      expires_at: promotion.expires_at ? promotion.expires_at.split('T')[0] : ''
    })
    setImageFile(null)
    setImagePreview(promotion.image_url || null)
    setShowForm(true)
  }

  const handleDelete = async (promotionId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту акцию?')) {
      return
    }
    
    try {
      await api.delete(`/api/partner/promotions/${promotionId}`)
      toast.success('Акция удалена')
      fetchPromotions()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка при удалении акции')
    }
  }

  return (
    <div className="promotions-page">
      <div className="page-header">
        <h1>Управление акциями</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingPromotion(null); setImageFile(null); setImagePreview(null); setFormData({ title: '', description: '', image_url: '', discount_percent: '', is_active: true, expires_at: '' }) }} className="btn btn-primary">
          {showForm ? 'Отмена' : 'Создать акцию'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="promotion-form">
          <h2>{editingPromotion ? 'Редактировать акцию' : 'Новая акция'}</h2>
          <input
            type="text"
            name="title"
            placeholder="Название акции *"
            value={formData.title}
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
          <div className="image-upload-section">
            <label className="file-upload-label">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
              <span className="file-upload-button">Выбрать изображение</span>
            </label>
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
            {!imageFile && formData.image_url && (
              <input
                type="text"
                name="image_url"
                placeholder="Или введите URL изображения"
                value={formData.image_url}
                onChange={handleChange}
                className="input"
              />
            )}
          </div>
          <input
            type="number"
            name="discount_percent"
            placeholder="Процент скидки"
            value={formData.discount_percent}
            onChange={handleChange}
            step="0.1"
            min="0"
            max="100"
            className="input"
          />
          <input
            type="date"
            name="expires_at"
            placeholder="Дата окончания"
            value={formData.expires_at}
            onChange={handleChange}
            className="input"
          />
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
            Активна
          </label>
          <button type="submit" className="btn btn-primary">
            {editingPromotion ? 'Сохранить' : 'Создать'}
          </button>
        </form>
      )}

      <div className="promotions-grid">
        {promotions.map(promotion => (
          <div key={promotion.id} className="promotion-card">
            {promotion.image_url && (
              <img src={getImageUrl(promotion.image_url)} alt={promotion.title} />
            )}
            <div className="promotion-content">
              <h3>{promotion.title}</h3>
              <p>{promotion.description}</p>
              {promotion.discount_percent && (
                <span className="discount-badge">-{promotion.discount_percent}%</span>
              )}
              <div className="promotion-footer">
                <span className={`status ${promotion.is_active ? 'active' : 'inactive'}`}>
                  {promotion.is_active ? 'Активна' : 'Неактивна'}
                </span>
                {promotion.expires_at && (
                  <span className="expires">До: {new Date(promotion.expires_at).toLocaleDateString('ru-RU')}</span>
                )}
              </div>
              <div className="promotion-actions">
                <button onClick={() => handleEdit(promotion)} className="btn btn-secondary">
                  Редактировать
                </button>
                <button onClick={() => handleDelete(promotion.id)} className="btn btn-danger">
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PartnerPromotionsPage

