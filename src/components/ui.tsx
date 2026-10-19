import { useEffect, useRef, useId, type ReactNode } from 'react'
import { X, Minus, Plus, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
export function IconButton({
  label,
  children,
  onClick,
  disabled = false,
}: {
  label: string
  children: ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      className="icon-button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
export function Quantity({
  value,
  change,
  max = 20,
}: {
  value: number
  change: (n: number) => void
  max?: number
}) {
  return (
    <div className="quantity">
      <IconButton label="Decrease quantity" onClick={() => change(value - 1)} disabled={value <= 1}>
        <Minus size={14} />
      </IconButton>
      <span aria-live="polite">{value}</span>
      <IconButton
        label="Increase quantity"
        onClick={() => change(value + 1)}
        disabled={value >= max}
      >
        <Plus size={14} />
      </IconButton>
    </div>
  )
}
export function Modal({
  title,
  close,
  children,
  wide = false,
}: {
  title: string
  close: () => void
  children: ReactNode
  wide?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null),
    headingId = useId()
  useEffect(() => {
    const el = ref.current!
    const previous = document.activeElement as HTMLElement
    el.showModal()
    const prior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      el.close()
      document.body.style.overflow = prior
      previous?.focus()
    }
  }, [])
  return (
    <dialog
      aria-labelledby={headingId}
      ref={ref}
      className={`modal ${wide ? 'wide' : ''}`}
      onCancel={(e) => {
        e.preventDefault()
        close()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className="modal-header">
        <h2 id={headingId}>{title}</h2>
        <IconButton label={`Close ${title}`} onClick={close}>
          <X />
        </IconButton>
      </div>
      {children}
    </dialog>
  )
}
export function Empty({ title, message }: { title: string; message: string }) {
  return (
    <div className="empty">
      <span className="eyebrow">A fresh start</span>
      <h2>{title}</h2>
      <p>{message}</p>
      <Link className="button" to="/shop">
        Explore the collection <ArrowUpRight size={16} />
      </Link>
    </div>
  )
}
