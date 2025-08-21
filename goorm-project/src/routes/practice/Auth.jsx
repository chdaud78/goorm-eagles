// Auth.jsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, useRef, useCallback } from 'react'

// 경로는 프로젝트 구조에 맞게 조정
import { auth } from '@/api/auth' // register / login / logout
import { http } from '@/api/http' // http.get('/me') 용
import { token as tokenStore } from '@/api/token'

export default function Auth() {
  const qc = useQueryClient()

  // UI 상태
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('test@example.com')
  const [name, setName] = useState('Sion')
  const [token, setToken] = useState('')
  const [output, setOutput] = useState('')
  const pwRef = useRef(null)

  // 토큰 구독(현재 토큰 표시/버튼 활성화용)
  useEffect(() => {
    const unsub = tokenStore.subscribe(setToken)
    setToken(tokenStore.get())
    return unsub
  }, [])

  // /me: 필요할 때만 호출(on-demand)
  const { refetch: refetchMe, isFetching: meFetching } = useQuery({
    queryKey: ['me'],
    queryFn: () => http.get('/me'),
    enabled: false, // 버튼 클릭 시에만
  })

  // 회원가입
  const registerM = useMutation({
    mutationFn: (payload) => auth.register(payload),
    onMutate: () => setOutput('요청 중…'),
    onSuccess: () => {
      setOutput('✅ 회원가입 완료 — 로그인 해보세요')
      setMode('login')
    },
    onError: (err) => setOutput(`❌ ${err.message} (${err.status || '-'})`),
  })

  // 로그인
  const loginM = useMutation({
    mutationFn: (payload) => auth.login(payload), // 성공 시 token.set 수행(전역 인터셉터 전제)
    onMutate: () => setOutput('요청 중…'),
    onSuccess: () => {
      setOutput('✅ 로그인 성공')
      qc.invalidateQueries({ queryKey: ['me'] })
    },
    onError: (err) => setOutput(`❌ ${err.message} (${err.status || '-'})`),
  })

  // 로그아웃
  const logoutM = useMutation({
    mutationFn: () => auth.logout(),
    onSuccess: () => {
      setOutput('로그아웃 완료')
      qc.invalidateQueries({ queryKey: ['me'] })
    },
  })

  // 폼 제출
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault()
      const password = pwRef.current?.value || ''
      if (mode === 'register') {
        registerM.mutate({ email, password, name })
      } else {
        loginM.mutate({ email, password })
      }
      if (pwRef.current) {
        pwRef.current.value = ''
      }
    },
    [mode, email, name, registerM, loginM]
  )

  // /me 호출
  const handleFetchMe = useCallback(async () => {
    setOutput('요청 중…')
    try {
      const { data } = await refetchMe()
      setOutput(JSON.stringify(data, null, 2))
    } catch (err) {
      setOutput(`❌ ${err.message} (${err.status || '-'})`)
    }
  }, [refetchMe])

  // 로그아웃
  const handleLogout = useCallback(() => {
    logoutM.mutate()
  }, [logoutM])

  return (
    <div className="mx-auto mt-10 max-w-[520px] font-sans">
      <h1 className="mb-2 text-xl font-semibold">Login Smoke Test</h1>
      <p className="mt-0 text-sm text-gray-500">
        API: <code className="rounded bg-gray-100 px-1 py-0.5">{import.meta.env.VITE_API_URL}</code>
      </p>

      {/* 탭 */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setMode('login')}
          className={`rounded-md border px-3 py-1.5 ${
            mode === 'login'
              ? 'border-gray-900 bg-gray-900 text-white'
              : 'border-transparent bg-gray-200 text-gray-900'
          }`}
        >
          로그인
        </button>
        <button
          onClick={() => setMode('register')}
          className={`rounded-md border px-3 py-1.5 ${
            mode === 'register'
              ? 'border-gray-900 bg-gray-900 text-white'
              : 'border-transparent bg-gray-200 text-gray-900'
          }`}
        >
          회원가입
        </button>
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="mb-3 grid gap-2">
        <label className="space-y-1">
          <div className="text-sm">이메일</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
          />
        </label>

        <label className="space-y-1">
          <div className="text-sm">비밀번호</div>
          <input
            ref={pwRef}
            type="password"
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
          disabled={registerM.isPending || loginM.isPending}
          className="rounded-md bg-gray-900 px-3 py-2 text-white hover:bg-black/90 disabled:opacity-50"
        >
          {mode === 'register' ? '회원가입' : '로그인'}
        </button>
      </form>

      {/* 액션 */}
      <div className="mb-2 flex gap-2">
        <button
          onClick={handleFetchMe}
          disabled={!token || meFetching}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
        >
          /me 호출 {meFetching && '…'}
        </button>
        <button
          onClick={handleLogout}
          disabled={!token || logoutM.isPending}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
        >
          로그아웃
        </button>
      </div>

      {/* 토큰/출력 */}
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
