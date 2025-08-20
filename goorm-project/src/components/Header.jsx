import { NavLink, Link } from 'react-router'

import { ROUTES } from '@/lib/routes'

export default function Header({ onToggleSidebar, isOpen }) {
  return (
    <header className="sticky top-0 z-40 border rounded-xl bg-white/80 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* 모바일 햄버거 */}
          <button
            type="button"
            className="md:hidden rounded-md border px-3 py-2"
            aria-controls="app-sidebar"
            aria-expanded={isOpen}
            onClick={onToggleSidebar}
          >
            <span className="sr-only">메뉴 열기</span>☰
          </button>
          <Link to={ROUTES.HOME} className="text-lg font-semibold text-brand">
            MyApp
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <NavLink to={ROUTES.AUTH.LOGIN}>로그인</NavLink>
          <NavLink to={ROUTES.AUTH.REGISTER}>회원가입</NavLink>
        </div>
      </div>
    </header>
  )
}
