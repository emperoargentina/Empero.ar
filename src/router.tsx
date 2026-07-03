import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'

const AdminRoot = lazy(() =>
  import('./pages/admin/AdminRoot').then(m => ({ default: m.AdminRoot }))
)

export function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin/*" element={
          <Suspense fallback={null}>
            <AdminRoot />
          </Suspense>
        } />
      </Routes>
    </BrowserRouter>
  )
}
