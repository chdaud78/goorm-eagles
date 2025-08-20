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
  }

  async function logout() {
    await auth.logout()
    setOutput('로그아웃 완료')
  }

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1 style={{ marginBottom: 8 }}>Login Smoke Test</h1>
      <p style={{ marginTop: 0, color: '#666' }}>
        API: <code>{import.meta.env.VITE_API_URL}</code>
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setMode('login')}
          style={{
            padding: '6px 10px',
            background: mode === 'login' ? '#111' : '#ddd',
            color: mode === 'login' ? '#fff' : '#111',
            border: 0,
            borderRadius: 6,
          }}
        >
          로그인
        </button>
        <button
          onClick={() => setMode('register')}
          style={{
            padding: '6px 10px',
            background: mode === 'register' ? '#111' : '#ddd',
            color: mode === 'register' ? '#fff' : '#111',
            border: 0,
            borderRadius: 6,
          }}
        >
          회원가입
        </button>
      </div>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
        <label>
          <div>이메일</div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} required style={input} />
        </label>
        <label>
          <div>비밀번호</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={input}
          />
        </label>

        {mode === 'register' && (
          <label>
            <div>이름</div>
            <input value={name} onChange={(e) => setName(e.target.value)} style={input} />
          </label>
        )}

        <button type="submit" style={primaryBtn}>
          {mode === 'register' ? '회원가입' : '로그인'}
        </button>
      </form>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button onClick={fetchMe} disabled={!token} style={secondaryBtn}>
          /me 호출 (토큰 필요)
        </button>
        <button onClick={logout} disabled={!token} style={secondaryBtn}>
          로그아웃(토큰 삭제)
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, color: '#666' }}>현재 토큰</div>
        <textarea
          readOnly
          value={token}
          rows={3}
          style={{ width: '100%', fontFamily: 'monospace' }}
        />
      </div>

      <pre
        style={{
          background: '#f7f7f8',
          padding: 12,
          borderRadius: 8,
          marginTop: 12,
          whiteSpace: 'pre-wrap',
        }}
      >
        {output}
      </pre>
    </div>
  )
}

const input = { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd' }
const primaryBtn = {
  padding: '8px 10px',
  borderRadius: 6,
  border: 0,
  background: '#111',
  color: '#fff',
}
const secondaryBtn = {
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid #ddd',
  background: '#fff',
}
