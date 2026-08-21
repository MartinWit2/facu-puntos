import { useContext } from 'react'
import { AuthContext } from './authContextObject.js'

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth tiene que usarse dentro de <AuthProvider>')
  }
  return context
}
