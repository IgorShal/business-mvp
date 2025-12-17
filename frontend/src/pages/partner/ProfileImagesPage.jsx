import React, { useState, useEffect } from 'react'
import api, { getImageUrl } from '../../api/api'
import toast from 'react-hot-toast'
import './ProfileImagesPage.css'

function ProfileImagesPage() {
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      const response = await api.get('/api/partner/images')
      setImages(response.data)
    } catch (error) {
      console.error('Error fetching images:', error)
    }
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        const uploadResponse = await api.post('/api/uploads/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        
        await api.post('/api/partner/images', { image_url: uploadResponse.data.url })
      }
      toast.success('Фото загружены успешно')
      fetchImages()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка при загрузке фото')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (imageId) => {
    if (!window.confirm('Удалить это фото?')) {
      return
    }
    
    try {
      await api.delete(`/api/partner/images/${imageId}`)
      toast.success('Фото удалено')
      fetchImages()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка при удалении фото')
    }
  }

  return (
    <div className="profile-images-page">
      <h1>Фото заведения</h1>
      
      <div className="upload-section">
        <label className="file-upload-label-large">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="file-input"
            disabled={uploading}
          />
          <span className="file-upload-button-large">
            {uploading ? 'Загрузка...' : 'Загрузить фото'}
          </span>
        </label>
        <p className="upload-hint">Можно выбрать несколько фото одновременно</p>
      </div>

      <div className="images-grid">
        {images.map(image => (
          <div key={image.id} className="image-item">
            <img src={getImageUrl(image.image_url)} alt={`Фото ${image.id}`} />
            <button onClick={() => handleDelete(image.id)} className="btn-delete">
              Удалить
            </button>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <p className="no-images">Пока нет загруженных фото</p>
      )}
    </div>
  )
}

export default ProfileImagesPage

