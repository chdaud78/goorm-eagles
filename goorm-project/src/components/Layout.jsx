import { useState } from 'react'

import Footer from './Footer.jsx'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const toggle = () => setSidebarOpen((v) => !v)
  const close = () => setSidebarOpen(false)

  return (
    <div className="min-h-dvh bg-gray-50 text-gray-900">
      {/* 그리드 레이아웃 (md 이상 2열) */}
      <div className="container h-full mx-auto grid grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[240px_1fr]">
        {/* Sidebar (md 이상 고정 / 모바일 오프캔버스) */}
        <Sidebar open={sidebarOpen} onClose={close} />

        <div className="flex flex-col gap-6 h-full">
          <Header onToggleSidebar={toggle} isOpen={sidebarOpen} />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  )
}
