import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* Bắt buộc phải bao bọc App ở đây */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)