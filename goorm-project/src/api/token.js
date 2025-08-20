let _token = ''
const listeners = new Set()

export const token = {
  get: () => _token,
  set: (t) => {
    _token = t || ''
    listeners.forEach((fn) => fn(_token))
  },
  clear: () => {
    _token = ''
    listeners.forEach((fn) => fn(_token))
  },
  subscribe: (fn) => {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
}
