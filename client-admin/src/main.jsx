import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { LoadingProvider } from './context/LoadingContext'
import SmoothScroll from './components/common/SmoothScroll'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LoadingProvider>
        <ThemeProvider>
          <AuthProvider>
            <SmoothScroll>
              <App />
            </SmoothScroll>
          </AuthProvider>
        </ThemeProvider>
      </LoadingProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
