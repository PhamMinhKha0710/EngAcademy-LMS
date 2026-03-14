import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './styles/index.css'
import { initTheme } from './store/themeStore'

initTheme()

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <GoogleOAuthProvider clientId="41159444132-hrtm19jreeauf6344t4osdupfhpg1ckd.apps.googleusercontent.com">
                <App />
            </GoogleOAuthProvider>
        </BrowserRouter>
    </React.StrictMode>,
)
