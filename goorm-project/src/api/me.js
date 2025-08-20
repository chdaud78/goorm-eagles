import { http } from './http'

export const me = {
  get: () => http.get('/me'),
}
