import type { NavLink, FooterColumn } from '../types'

export const navLinks: NavLink[] = [
  { label: 'Inicio', href: './' },
  { label: 'Bazar', href: '?category=Bazar' },
  { label: 'Hogar', href: '?category=Hogar' },
  { label: 'Electrónica', href: '?category=Electrónica' },
  { label: 'Otro', href: '?category=Otro' },
]

export const footerColumns: FooterColumn[] = [
  {
    title: 'Explorar',
    links: [
      { label: 'Política de Privacidad', href: '#' },
      { label: 'Términos del Servicio', href: '#' },
    ],
  },
  {
    title: 'Soporte',
    links: [
      { label: 'Información de Envíos', href: '#' },
      { label: 'Contactar Soporte', href: '#' },
    ],
  },
]

export const bottomNavItems: NavLink[] = [
  { label: 'Inicio', href: './' },
  { label: 'Categorías', href: './#categories' },
  { label: 'Carrito', href: '#' },
]
