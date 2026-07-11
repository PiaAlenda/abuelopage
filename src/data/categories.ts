import type { Category } from '../types'

export const categories: Category[] = [
  {
    id: 1,
    name: 'Bazar',
    description: 'Todo lo que necesitas para tu día a día.',
    image: '/categories/bazar.webp',
    alt: 'Variedad de artículos de bazar organizados en una mesa moderna.',
  },
  {
    id: 2,
    name: 'Hogar',
    description: 'Transforma tu espacio con estilo y confort.',
    image: '/categories/hogar.webp',
    alt: 'Ambiente acogedor de hogar con decoración moderna y cálida.',
  },
  {
    id: 3,
    name: 'Electrónica',
    description: 'Tecnología innovadora para tu vida digital.',
    image: '/categories/electronica.webp',
    alt: 'Dispositivos electrónicos modernos sobre una superficie minimalista.',
  },
  {
    id: 4,
    name: 'Otro',
    description: 'Productos únicos que no encajan en ninguna otra categoría.',
    image: '/categories/otros.webp',
    alt: 'Colección variada de artículos diversos y originales.',
  },
]
