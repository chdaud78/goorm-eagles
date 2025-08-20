import { lazy } from 'react'
import { Routes, Route } from 'react-router'

import RootLayout from '@/layouts/RootLayout'
import { ROUTES } from '@/lib/routes'
import AuthLayout from '@/routes/auth/AuthLayout'
import Login from '@/routes/auth/Login'
import Register from '@/routes/auth/Register'
import Home from '@/routes/Home'
import NotFound from '@/routes/NotFound'

const Profile = lazy(() => import('@/routes/member/Profile'))

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path={ROUTES.MEMBER.ROOT}>
          <Route path={ROUTES.MEMBER.PROFILE} element={<Profile />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.AUTH.LOGIN} element={<Login />} />
          <Route path={ROUTES.AUTH.REGISTER} element={<Register />} />
        </Route>
        <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
      </Route>
    </Routes>
  )
}
