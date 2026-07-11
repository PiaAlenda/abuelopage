import type { HeroImage } from '../types'

export const heroImages: HeroImage[] = [
  {
    id: 1,
    src: '/categories/bazar.webp',
    alt: 'Variedad de artículos de bazar organizados en una mesa moderna.',
    className: 'col-span-8 row-span-8',
    badge: 'Bazar',
    title: 'Bazar',
  },
  {
    id: 2,
    src: '/categories/hogar.webp',
    alt: 'Ambiente acogedor de hogar con decoración moderna y cálida.',
    className: 'col-span-4 row-span-5',
    badge: 'Hogar',
    title: 'Hogar',
  },
  {
    id: 3,
    src: '/categories/electronica.webp',
    alt: 'Dispositivos electrónicos modernos sobre una superficie minimalista.',
    className: 'col-span-4 row-span-7',
    badge: 'Electrónica',
    title: 'Electrónica',
  },
  {
    id: 4,
    src: '/categories/otros.webp',
    alt: 'Colección variada de artículos diversos y originales.',
    className: 'col-span-8 row-span-4',
    badge: 'Otro',
    title: 'Otro',
  },
]
