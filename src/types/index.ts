export interface Product {
  id: number
  name: string
  price?: number | null
  image: string
  alt: string
  category: string
  sold?: boolean
  description?: string
  images?: string[]
}

export interface Category {
  id: number
  name: string
  description: string
  image: string
  alt: string
}

export interface NavLink {
  label: string
  href: string
  isActive?: boolean
}

export interface FooterColumn {
  title: string
  links: NavLink[]
}

export interface HeroImage {
  id: number
  src: string
  alt: string
  className: string
  badge?: string
  title?: string
}
