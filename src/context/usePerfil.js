import { useContext } from 'react'
import { PerfilContext } from './perfilContextObject.js'

export function usePerfil() {
  const context = useContext(PerfilContext)
  if (context === undefined) {
    throw new Error('usePerfil tiene que usarse dentro de <PerfilProvider>')
  }
  return context
}
