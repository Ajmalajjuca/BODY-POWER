import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { foreground, presets } from '../design/config'
import { usePageVersion } from '../state/versions'
import { registry } from './registry'
// Home V1 is the marketplace layout, V2 the editorial minimal layout, V3 the bold performance layout.
const homeVersions = { 1: presets.marketplace, 2: presets.minimal, 3: presets.performance }
export function Home() {
  const version = usePageVersion('home'),
    config = homeVersions[version]
  return (
    <div className={`home layout-${config.layout}`} data-layout={`home-v${version}`}>
      {config.sections
        .filter((s) => s.enabled)
        .map((s) => {
          const Renderer = registry[s.type].renderer
          const heading = ![
            'hero',
            'trust',
            'combo-promo',
            'newsletter',
            'banner',
            'announcement',
            'spotlight',
          ].includes(s.type)
          return (
            <section
              key={s.id}
              className={`home-section section-${s.type} scheme-${s.scheme} space-${s.spacing} width-${s.width} mobile-${s.mobile} align-${s.align}`}
              style={
                s.scheme === 'custom'
                  ? ({
                      background: s.background,
                      color: foreground(s.background),
                      '--text': foreground(s.background),
                      '--muted': foreground(s.background),
                    } as React.CSSProperties)
                  : undefined
              }
            >
              <div className="container">
                {heading && (
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">
                        {s.type === 'bestsellers'
                          ? 'THE EVERYDAY LINEUP'
                          : s.type === 'categories'
                            ? 'A PLACE FOR EVERY GOAL'
                            : s.type === 'brands'
                              ? 'ONLY THE GOOD STUFF'
                              : 'CURATED FOR YOUR ROUTINE'}
                      </span>
                      <h2>{s.heading}</h2>
                      {s.subheading && <p>{s.subheading}</p>}
                    </div>
                    <Link
                      className="text-link"
                      to={
                        s.type === 'brands' ? '/brands' : s.type === 'combos' ? '/combos' : '/shop'
                      }
                    >
                      Explore all <ArrowUpRight size={16} />
                    </Link>
                  </div>
                )}
                <Renderer section={s} config={config} />
              </div>
            </section>
          )
        })}
    </div>
  )
}
