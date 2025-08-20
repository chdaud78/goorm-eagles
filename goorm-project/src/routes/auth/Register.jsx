import { useEffect, useState, useCallback } from 'react'

import { auth } from '@/api/auth'
import { me } from '@/api/me'
import { token as tokenStore } from '@/api/token'

export default function App() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('pass1234')
  const [name, setName] = useState('Sion')
  const [token, setToken] = useState('')
  const [output, setOutput] = useState('')

  useEffect(() => {
    const unsub = tokenStore.subscribe(setToken)
    setToken(tokenStore.get())
    return unsub
  }, [])

  const onSubmit = useCallback(async () => {
    setOutput('요청 중…')
    try {
      if (mode === 'register') {
        await auth.register({ email, password, name })
        setOutput('✅ 회원가입 완료 — 로그인 해보세요')
        setMode('login')
      } else {
        await auth.login({ email, password })
        setOutput('✅ 로그인 성공')
      }
    } catch (err) {
      setOutput(`❌ ${err.message} (${err.status || '-'})`)
    }
  }, [mode, email, password, name])

  const fetchMe = useCallback(async () => {
    setOutput('요청 중…')
    try {
      const res = await me.get()
      setOutput(JSON.stringify(res, null, 2))
    } catch (err) {
      setOutput(`❌ ${err.message} (${err.status || '-'})`)
    }
  }, [])

  const logout = useCallback(async () => {
    await auth.logout()
    setOutput('로그아웃 완료')
  }, [])

  const handleOnSubmit = useCallback(
    (e) => {
      e.preventDefault()
      onSubmit()
    },
    [onSubmit]
  )
  const handleFetchMe = useCallback(
    (e) => {
      e.preventDefault()
      fetchMe()
    },
    [fetchMe]
  )

  const handleLogout = useCallback(
    (e) => {
      e.preventDefault()
      logout()
    },
    [logout]
  )

  return (
    <div className="mx-auto mt-10 max-w-[520px] font-sans">
      <h1 className="mb-2 text-xl font-semibold">Login Smoke Test</h1>
      <p className="mt-0 text-sm text-gray-500">
        API: <code className="rounded bg-gray-100 px-1 py-0.5">{import.meta.env.VITE_API_URL}</code>
      </p>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setMode('login')}
          className={[
            'rounded-md px-3 py-1.5 border',
            mode === 'login'
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-gray-200 text-gray-900 border-transparent',
          ].join(' ')}
        >
          로그인
        </button>
        <button
          onClick={() => setMode('register')}
          className={[
            'rounded-md px-3 py-1.5 border',
            mode === 'register'
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-gray-200 text-gray-900 border-transparent',
          ].join(' ')}
        >
          회원가입
        </button>
      </div>

      <form onSubmit={handleOnSubmit} className="mb-3 grid gap-2">
        <label className="space-y-1">
          <div className="text-sm">이메일</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
          />
        </label>

        <label className="space-y-1">
          <div className="text-sm">비밀번호</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
          />
        </label>

        {mode === 'register' && (
          <label className="space-y-1">
            <div className="text-sm">이름</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
            />
          </label>
        )}

        <button
          type="submit"
          className="rounded-md bg-gray-900 px-3 py-2 text-white hover:bg-black/90 disabled:opacity-50"
        >
          {mode === 'register' ? '회원가입' : '로그인'}
        </button>
      </form>

      <div className="mb-2 flex gap-2">
        <button
          onClick={handleFetchMe}
          disabled={!token}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
        >
          /me 호출 (토큰 필요)
        </button>
        <button
          onClick={handleLogout}
          disabled={!token}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
        >
          로그아웃(토큰 삭제)
        </button>
      </div>

      <div className="mt-3">
        <div className="text-xs text-gray-500">현재 토큰</div>
        <textarea
          readOnly
          value={token}
          rows={3}
          className="mt-1 w-full rounded-md border border-gray-300 font-mono text-xs leading-relaxed"
        />
      </div>

      <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-gray-100 p-3">{output}</pre>
    </div>
  )
}
