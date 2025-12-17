import React, { useState, useEffect } from 'react'
import api, { getImageUrl } from '../../api/api'
import toast from 'react-hot-toast'
import './ProductsPage.css'

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    is_available: true
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/partner/products')
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Ошибка при загрузке товаров')
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
      
      const submitData = {
        ...formData,
        image_url: imageUrl
      }
      
      if (editingProduct) {
        await api.put(`/api/partner/products/${editingProduct.id}`, submitData)
        toast.success('Товар обновлен')
      } else {
        await api.post('/api/partner/products', submitData)
        toast.success('Товар создан')
      }
      setShowForm(false)
      setEditingProduct(null)
      setImageFile(null)
      setImagePreview(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        image_url: '',
        is_available: true
      })
      fetchProducts()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка при сохранении товара')
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      image_url: product.image_url || '',
      is_available: product.is_available
    })
    setImageFile(null)
    setImagePreview(product.image_url || null)
    setShowForm(true)
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      return
    }
    
    try {
      await api.delete(`/api/partner/products/${productId}`)
      toast.success('Товар удален')
      fetchProducts()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка при удалении товара')
    }
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Управление товарами</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingProduct(null); setImageFile(null); setImagePreview(null); setFormData({ name: '', description: '', price: '', image_url: '', is_available: true }) }} className="btn btn-primary">
          {showForm ? 'Отмена' : 'Добавить товар'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="product-form">
          <h2>{editingProduct ? 'Редактировать товар' : 'Новый товар'}</h2>
          <input
            type="text"
            name="name"
            placeholder="Название товара *"
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
            type="number"
            name="price"
            placeholder="Цена *"
            value={formData.price}
            onChange={handleChange}
            required
            step="0.01"
            min="0"
            className="input"
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
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_available"
              checked={formData.is_available}
              onChange={handleChange}
            />
            Доступен для заказа
          </label>
          <button type="submit" className="btn btn-primary">
            {editingProduct ? 'Сохранить' : 'Создать'}
          </button>
        </form>
      )}

      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            {product.image_url && (
              <img src={getImageUrl(product.image_url)} alt={product.name} />
            )}
            <div className="product-content">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <div className="product-footer">
                <span className="price">{product.price} ₽</span>
                <span className={`availability ${product.is_available ? 'available' : 'unavailable'}`}>
                  {product.is_available ? 'Доступен' : 'Недоступен'}
                </span>
              </div>
              <div className="product-actions">
                <button onClick={() => handleEdit(product)} className="btn btn-secondary">
                  Редактировать
                </button>
                <button onClick={() => handleDelete(product.id)} className="btn btn-danger">
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

export default ProductsPage

