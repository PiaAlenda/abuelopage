import { useState, useEffect } from 'react'
import { useNavigate, Link } from '../lib/Router'
import { useAuth } from '../context/AuthContext'
import Header from '../components/global/Header'
import BottomNavBar from '../components/global/BottomNavBar'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('./')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (isAuthenticated) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const err = await login(email, password)
    setLoading(false)
    if (err) {
      setError(err)
    } else {
      navigate('./')
    }
  }

  return (
    <>
      <Header />
      <main className="h-dvh bg-[#FBF9F6] pt-[var(--header-height)] pb-14 flex items-center justify-center animate-fade-in">
        <div className="md:bg-white md:rounded-2xl md:shadow-sm md:border md:border-neutral-200/50 w-full md:max-w-sm mx-auto p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-serif text-amber-950 font-medium mb-2">Acceso Administrador</h2>

          <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
            Si no eres administrador, no hace falta que entres. Puedes seguir viendo nuestro catálogo.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-500 font-semibold mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                required
                className="w-full bg-white md:bg-[#FBF9F6] border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 outline-none text-neutral-800 placeholder-neutral-400"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-500 font-semibold mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white md:bg-[#FBF9F6] border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 outline-none text-neutral-800 placeholder-neutral-400"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-full bg-amber-900 text-white font-medium text-sm uppercase tracking-wider hover:bg-amber-950 transition-colors disabled:opacity-50"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link to="./" className="text-sm text-neutral-400 hover:text-amber-800 transition-colors">
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
      <BottomNavBar />
    </>
  )
}
