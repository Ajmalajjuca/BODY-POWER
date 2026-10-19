import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Check, ChevronDown } from 'lucide-react'
import { useVersions, type PageKey, type Version } from '../state/versions'
import { versionThemes } from '../design/versions'
export interface VersionTarget {
  label: string
  to: string
  page: PageKey
}
type Props = (VersionTarget | { label: string; group: readonly VersionTarget[] }) & {
  onNavigate?: () => void
}
const versions: Version[] = [1, 2, 3]
// A nav item whose dropdown lists V1–V3 of its page (or of each page in a group). Opens on mouse
// hover, click or tap, and from the keyboard; choosing a version remembers it and opens the page.
export function VersionMenu(props: Props) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null),
    trigger = useRef<HTMLButtonElement>(null),
    hoveredAt = useRef(0),
    focusFirst = useRef(false)
  const chosen = useVersions((s) => s.versions),
    choose = useVersions((s) => s.choose),
    navigate = useNavigate(),
    { pathname } = useLocation()
  const targets = 'group' in props ? props.group : [props]
  const name = `${props.label} versions`
  useEffect(() => {
    if (!open) return
    const outside = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open])
  useEffect(() => {
    if (open && focusFirst.current) {
      root.current?.querySelector<HTMLElement>('[role="menuitemradio"]')?.focus()
      focusFirst.current = false
    }
  }, [open])
  const close = (returnFocus = false) => {
    setOpen(false)
    if (returnFocus) trigger.current?.focus()
  }
  const select = (target: VersionTarget, version: Version) => {
    choose(target.page, version)
    close()
    props.onNavigate?.()
    navigate(target.to)
  }
  const onTriggerKey = (e: KeyboardEvent) => {
    if (['Enter', ' ', 'ArrowDown'].includes(e.key)) {
      e.preventDefault()
      focusFirst.current = true
      setOpen(true)
    }
  }
  const onMenuKey = (e: KeyboardEvent) => {
    const items = [...(root.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? [])]
    const at = items.indexOf(document.activeElement as HTMLElement)
    const move = { ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: items.length - 1 }[e.key]
    if (move !== undefined) {
      e.preventDefault()
      items[(move + items.length) % items.length]?.focus()
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      if (e.key === 'Escape') e.preventDefault()
      close(e.key === 'Escape')
    }
  }
  return (
    <div
      ref={root}
      className={`version-menu ${open ? 'is-open' : ''}`}
      onPointerEnter={(e) => {
        if (e.pointerType !== 'mouse') return
        hoveredAt.current = Date.now()
        setOpen(true)
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') setOpen(false)
      }}
    >
      {'group' in props ? (
        <span className="version-label">{props.label}</span>
      ) : (
        <Link
          className="version-label"
          to={props.to}
          aria-current={pathname === props.to ? 'page' : undefined}
          onClick={() => {
            close()
            props.onNavigate?.()
          }}
        >
          {props.label}
        </Link>
      )}
      <button
        ref={trigger}
        type="button"
        className="version-trigger"
        aria-label={name}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          // A mouse click right after hover-open keeps the menu open instead of toggling it shut.
          if (open && Date.now() - hoveredAt.current < 500) return
          setOpen(!open)
        }}
        onKeyDown={onTriggerKey}
      >
        <ChevronDown size={13} />
      </button>
      {open && (
        <div className="version-dropdown" role="menu" aria-label={name} onKeyDown={onMenuKey}>
          {targets.length === 1 ? (
            <VersionItems target={targets[0]} chosen={chosen[targets[0].page]} onSelect={select} />
          ) : (
            targets.map((t) => (
              <div role="group" aria-label={t.label} key={t.page} className="version-group">
                <span className="version-group-label">{t.label}</span>
                <VersionItems target={t} chosen={chosen[t.page]} onSelect={select} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
function VersionItems({
  target,
  chosen,
  onSelect,
}: {
  target: VersionTarget
  chosen: Version
  onSelect: (target: VersionTarget, version: Version) => void
}) {
  return versions.map((v) => {
    const theme = versionThemes[v]
    return (
      <button
        key={v}
        type="button"
        role="menuitemradio"
        aria-checked={chosen === v}
        tabIndex={-1}
        onClick={() => onSelect(target, v)}
      >
        <span>
          V{v} · {theme.name}
        </span>
        <span className="version-swatches" aria-hidden="true">
          <i style={{ background: theme.swatches[0] }} />
          <i style={{ background: theme.swatches[1] }} />
          {chosen === v && <Check size={14} />}
        </span>
      </button>
    )
  })
}
