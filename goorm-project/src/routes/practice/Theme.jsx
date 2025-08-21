import { createContext, useContext, useState } from 'react'

// 컨텍스트 기본값(안전한 디폴트)
const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
})

export default function MyApp() {
  const [theme, setTheme] = useState('light')
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  return (
    // React19 문법: Provider 대신 컨텍스트를 컴포넌트처럼 사용
    <ThemeContext value={{ theme, setTheme, toggleTheme }}>
      <div>
        <div className="mb-6">
          <ToggleThemeButton />
        </div>
        <Form
          className={
            theme === 'dark'
              ? 'min-h-dvh bg-gray-950 text-gray-100'
              : 'min-h-dvh bg-gray-50 text-gray-900'
          }
        />
      </div>
    </ThemeContext>
  )
}

function ToggleThemeButton() {
  const { theme, toggleTheme } = useContext(ThemeContext)
  const btnBase = 'rounded-md border px-3 py-2 text-sm font-medium transition-colors'
  const btnTheme =
    theme === 'dark'
      ? 'bg-gray-800 text-gray-100 hover:bg-gray-700 active:bg-gray-700/80 border-gray-700'
      : 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-200/80 border-gray-200'

  return (
    <button
      onClick={toggleTheme}
      className={`${btnBase} ${btnTheme}`}
      aria-pressed={theme === 'dark'}
      title="Toggle theme"
    >
      {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
    </button>
  )
}

function Form() {
  return (
    <Panel title="Welcome">
      <div className="flex gap-2">
        <Button>Sign up</Button>
        <Button>Log in</Button>
      </div>
    </Panel>
  )
}

function Panel({ title, children }) {
  const { theme } = useContext(ThemeContext)
  const panelBase = 'rounded-2xl border p-6 shadow-sm transition-colors duration-200'
  const panelTheme =
    theme === 'dark'
      ? 'bg-gray-900 border-gray-800 text-gray-100'
      : 'bg-white border-gray-200 text-gray-900'

  return (
    <section className={`${panelBase} ${panelTheme}`}>
      <h2 className="mb-3 text-xl font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function Button({ children }) {
  const { theme } = useContext(ThemeContext)
  const btnBase =
    'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors'
  const btnTheme =
    theme === 'dark'
      ? 'bg-gray-800 text-gray-100 hover:bg-gray-700 active:bg-gray-700/80 border border-gray-700'
      : 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-200/80 border border-gray-200'

  return <button className={`${btnBase} ${btnTheme}`}>{children}</button>
}
