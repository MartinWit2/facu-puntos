import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { PerfilProvider } from './context/PerfilContext.jsx'
import { registrarServiceWorker } from './utils/push.js'
import './index.css'
import App from './App.jsx'

// Se registra siempre (no solo si el usuario activa notificaciones): sin
// esto instalado de antemano, activar el toggle en Perfil no tendría un
// service worker listo para suscribirse. No pide permiso de notificación
// ni hace nada más por sí solo.
registrarServiceWorker()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PerfilProvider>
          <App />
        </PerfilProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
