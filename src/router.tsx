import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import { AdminRoot } from './pages/admin/AdminRoot'

export function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin/*" element={<AdminRoot />} />
      </Routes>
    </BrowserRouter>
  )
}
