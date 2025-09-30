import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "@excalidraw/excalidraw/index.css";   // for excalidraw ui
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
