import { http } from '@/api/http'
import { token } from '@/api/token'

export const auth = {
  register: (payload) => http.post('/auth/register', payload, { auth: false }),
  login: async (payload) => {
    const res = await http.post('/auth/login', payload, { auth: false })
    token.set(res.token) // access 토큰 저장(동일 동작)
    return res
  },
  logout: async () => {
    await http.post('/auth/logout', {}, { auth: true })
    token.clear()
  },
}
