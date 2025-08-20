import { http } from './http'
import { token } from './token'

export const auth = {
  async register({ email, password, name }) {
    return http.post('/auth/register', { email, password, name }, { auth: false })
  },
  async login({ email, password }) {
    const res = await http.post('/auth/login', { email, password }, { auth: false })
    token.set(res.token) // access 토큰 저장
    return res
  },
  async logout() {
    // 서버에 refresh 쿠키가 있으면 정리
    await http.post('/auth/logout', {}, { auth: true })
    token.clear()
  },
}
