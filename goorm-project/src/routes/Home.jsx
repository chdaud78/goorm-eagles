import { useContext } from 'react'

import { ThemeContext } from '@/context/ThemeContext'

export default function Home() {
  const theme = useContext(ThemeContext)
  return (
    <>
      <div>첫 페이지 입니다.</div>
      <div>현재 테마는 {theme}입니다.</div>
    </>
  )
}
