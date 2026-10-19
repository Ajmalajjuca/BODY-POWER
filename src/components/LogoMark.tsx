// Body Power Nutrition mark: a lightning bolt breaking through a power ring. Colours follow the
// theme accent; public/favicon.svg is the same drawing in fixed brand colours.
export function LogoMark({ className = 'logo-mark' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <rect width="48" height="48" rx="13" style={{ fill: 'var(--accent)' }} />
      <path
        d="M16 12.5A14.5 14.5 0 1 0 32 12.5"
        fill="none"
        strokeWidth="3.5"
        strokeLinecap="round"
        style={{ stroke: 'var(--on-accent)' }}
      />
      <path
        d="M26.5 9 16.5 26h7l-2.5 13 11-17.5h-7.3L26.5 9z"
        strokeWidth="1.2"
        strokeLinejoin="round"
        style={{ fill: 'var(--on-accent)', stroke: 'var(--on-accent)' }}
      />
    </svg>
  )
}
