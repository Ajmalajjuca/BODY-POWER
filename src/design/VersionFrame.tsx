import type { CSSProperties, ReactNode } from 'react'
import type { Version } from '../state/versions'
import { versionThemes } from './versions'
export function VersionFrame({
  version,
  children,
  className = '',
}: {
  version: Version
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`theme-frame version-${version} ${className}`}
      style={versionThemes[version].vars as CSSProperties}
    >
      {children}
    </div>
  )
}
