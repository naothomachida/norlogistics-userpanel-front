'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loginStart, loginSuccess, logout } from '@/store/slices/authSlice'

export function useAuth() {
  const dispatch = useAppDispatch()
  const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth)

  useEffect(() => {
    const checkAuth = async () => {
      dispatch(loginStart())
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          dispatch(loginSuccess(data.user))
        } else {
          dispatch(logout())
        }
      } catch (error) {
        dispatch(logout())
      }
    }

    // Only check authentication if we have no user data and we're not already loading
    if (!user && !loading) {
      checkAuth()
    }
  }, [dispatch, user, loading])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Erro no logout:', error)
    } finally {
      dispatch(logout())
    }
  }

  return {
    isAuthenticated,
    user,
    loading,
    logout: handleLogout
  }
}