import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { RealtimeProvider } from './context/RealtimeContext.jsx'
import { LampProvider } from './context/LampContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RealtimeProvider>
        <LampProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </LampProvider>
      </RealtimeProvider>
    </AuthProvider>
  </React.StrictMode>,
)