interface FloatingActionButtonProps {
  onClick: () => void
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-40 w-14 h-14 flex items-center justify-center rounded-full bg-amber-800 text-white shadow-lg hover:bg-amber-900 hover:scale-105 active:scale-95 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-amber-800 focus-visible:ring-offset-2"
      aria-label="Añadir producto"
    >
      <span className="material-symbols-outlined text-[28px]">add</span>
    </button>
  )
}
