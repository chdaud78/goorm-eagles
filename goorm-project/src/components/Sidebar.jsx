import { useEffect } from 'react'
import { NavLink } from 'react-router'

import { ROUTES } from '@/lib/routes'

export default function Sidebar({ open, onClose }) {
  // 모바일 오버레이 스크롤 잠금 (선택사항)
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => (document.body.style.overflow = '')
  }, [open])

  return (
    <>
      {/* 데스크톱 사이드바 */}
      <aside
        id="app-sidebar"
        className="sticky top-[1.25rem] hidden h-full rounded-lg border bg-white p-4 md:block"
      >
        <SidebarLinks />
      </aside>

      {/* 모바일 오프캔버스 */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition ${open ? 'visible' : 'invisible'}`}
        aria-hidden={!open}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onClose}
        />
        {/* Panel */}
        <div
          className={`absolute left-0 top-0 h-full w-72 transform bg-white p-4 shadow-lg transition-transform ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="모바일 내비게이션"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-base font-semibold">메뉴</span>
            <button className="rounded-md border px-3 py-1" onClick={onClose}>
              닫기
            </button>
          </div>
          <SidebarLinks onNavigate={onClose} />
        </div>
      </div>
    </>
  )
}

function SidebarLinks() {
  return (
    <nav className="space-y-1">
      <NavLink to={ROUTES.MEMBER.PROFILE}>프로필</NavLink>
    </nav>
  )
}
