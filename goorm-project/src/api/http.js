import { token } from './token'

const BASE = import.meta.env.VITE_API_URL ? '/api' : (import.meta.env.VITE_API_URL ?? '')
let refreshingPromise = null

async function refreshOnce() {
  if (!refreshingPromise) {
    refreshingPromise = (async () => {
      const res = await fetch(`${BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // rt 쿠키 전송
      })
      if (!res.ok) {
        token.clear()
        throw new Error('REFRESH_FAILED')
      }
      const data = await res.json()
      token.set(data.token)
      return data.token
    })().finally(() => {
      // 다음 리프레시를 위해 초기화
      refreshingPromise = null
    })
  }
  return refreshingPromise
}

export async function request(path, { method = 'GET', body, headers, auth = true, _retried } = {}) {
  const h = { 'Content-Type': 'application/json', ...(headers || {}) }
  const t = token.get()

  if (auth && t) {
    h.Authorization = `Bearer ${t}`
  }

  const res = await fetch(BASE + path, {
    method,
    headers: h,
    body: body ? JSON.stringify(body) : undefined,
  })

  // 401이고, 한 번도 재시도 안 했고, 인증이 필요한 호출이면 → refresh 후 재시도
  if (auth && res.status === 401 && !_retried) {
    try {
      await refreshOnce()
      return request(path, { method, body, headers, auth, _retried: true })
    } catch {
      // 리프레시 실패 → 원본 에러로 처리
    }
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    // JSON 아니라면 data는 null
  }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP_${res.status}`
    const err = new Error(msg)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

// 편의 메서드
export const http = {
  get: (p, o) => request(p, { ...o, method: 'GET' }),
  post: (p, body, o) => request(p, { ...o, method: 'POST', body }),
  patch: (p, body, o) => request(p, { ...o, method: 'PATCH', body }),
  del: (p, o) => request(p, { ...o, method: 'DELETE' }),
}
