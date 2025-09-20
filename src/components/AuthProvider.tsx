'use client'

import { useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { loginSuccess, logout } from '@/store/slices/authSlice'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          dispatch(loginSuccess(data.user))
        } else {
          dispatch(logout())
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
        dispatch(logout())
      }
    }

    checkAuth()
  }, [dispatch])

  return <>{children}</>
}