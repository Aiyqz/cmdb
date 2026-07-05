import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Services from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import Topology from './pages/Topology'
import Health from './pages/Health'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Navigation */}
        <nav className="bg-gray-800 shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <a href="/" className="text-xl font-bold text-blue-400">
                  CMDB
                </a>
                <div className="hidden md:flex space-x-4">
                  <a href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                    服务列表
                  </a>
                  <a href="/topology" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                    拓扑图
                  </a>
                  <a href="/health" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                    健康检查
                  </a>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/topology" element={<Topology />} />
            <Route path="/health" element={<Health />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
