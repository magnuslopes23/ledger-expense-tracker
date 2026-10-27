import type { ReactNode } from 'react'
import { Icon } from './Icon'

export function Modal({ open, title, children, onClose, maxWidth = 'max-w-lg' }: { open: boolean; title: string; children: ReactNode; onClose: () => void; maxWidth?: string }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onMouseDown={onClose}>
      <div className={`max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl ${maxWidth}`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur">
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Close"><Icon name="close" size={19}/></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
