import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'
import { useAuth } from '../contexts/AuthContext'

export function PartnerProfileCheck({ children }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (user?.user_type === 'partner') {
      checkProfile()
    } else {
      setChecking(false)
    }
  }, [user])

  const checkProfile = async () => {
    try {
      await api.get('/api/partner/profile')
      setChecking(false)
    } catch (error) {
      if (error.response?.status === 404) {
        navigate('/partner/register')
      } else {
        setChecking(false)
      }
    }
  }

  if (checking) {
    return <div>Загрузка...</div>
  }

  return children
}

