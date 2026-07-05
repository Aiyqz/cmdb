import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import { ToastProvider } from './components/ui/Toast'
import Services from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import Topology from './pages/Topology'
import Health from './pages/Health'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
          <Navbar />
          <main className="max-w-[1400px] mx-auto px-5 py-6">
            <Routes>
              <Route path="/" element={<Services />} />
              <Route path="/services/:id" element={<ServiceDetail />} />
              <Route path="/topology" element={<Topology />} />
              <Route path="/health" element={<Health />} />
            </Routes>
          </main>
        </div>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
