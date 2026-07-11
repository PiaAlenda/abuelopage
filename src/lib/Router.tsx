import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

interface RouterContextValue {
  params: URLSearchParams
  navigate: (to: string) => void
}

const RouterContext = createContext<RouterContextValue | null>(null)

export function Router({ children }: { children: ReactNode }) {
  const [params, setParams] = useState(() => new URLSearchParams(window.location.search))

  useEffect(() => {
    const onPop = () => setParams(new URLSearchParams(window.location.search))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((to: string) => {
    window.history.pushState(null, '', to)
    setParams(new URLSearchParams(window.location.search))
    const hash = to.split('#')[1]
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    }
  }, [])

  return (
    <RouterContext.Provider value={{ params, navigate }}>
      {children}
    </RouterContext.Provider>
  )
}

export function useNavigate() {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useNavigate must be used within Router')
  return ctx.navigate
}

export function useLocation() {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useLocation must be used within Router')
  return ctx.params
}

export function Link({ to, className, children, onClick, ...rest }: {
  to: string
  className?: string
  children: ReactNode
  onClick?: (e: React.MouseEvent) => void
  [key: string]: any
}) {
  const navigate = useNavigate()
  return (
    <a
      href={to}
      onClick={(e) => {
        if (onClick) onClick(e)
        if (!e.defaultPrevented) {
          e.preventDefault()
          navigate(to)
        }
      }}
      className={className}
      {...rest}
    >
      {children}
    </a>
  )
}
