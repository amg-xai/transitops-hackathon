import { useState, useEffect } from 'react'

/* ─── Inline SVG Icon helper ─────────────────────────────────────────────── */
const Icon = ({ d, size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...p}>
    {Array.isArray(d) ? d.map((path, i) => <path key={i} d={path} />) : <path d={d} />}
  </svg>
)

const I = {
  truck:  ["M1 3h15v13H1z", "M16 8h4l3 5v5h-7V8z", "M5 21a2 2 0 100-4 2 2 0 000 4z", "M19 21a2 2 0 100-4 2 2 0 000 4z"],
  driver: ["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2", "M12 3a4 4 0 100 8 4 4 0 000-8z"],
  trip:   ["M3 12a9 9 0 1018 0 9 9 0 00-18 0", "M12 8v4l3 3"],
  chart:  ["M18 20V10", "M12 20V4", "M6 20v-6"],
  shield: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  zap:    "M13 2L3 14h9l-1 8 10-12h-9l1-8",
  arrow:  "M5 12h14M12 5l7 7-7 7",
  check:  "M20 6L9 17l-5-5",
  fuel:   ["M3 22V8a2 2 0 012-2h10a2 2 0 012 2v14", "M17 8h2a2 2 0 012 2v6"],
  wrench: "M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z",
  bell:   ["M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9", "M13.73 21a2 2 0 01-3.46 0"],
}

/* Shared inner container — keeps all content centered at max 1140px */
const Inner = ({ children, style }) => (
  <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 40px', ...style }}>
    {children}
  </div>
)

/* ─── LANDING PAGE ───────────────────────────────────────────────────────── */
export default function LandingPage({ onEnter }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const features = [
    { icon: I.truck,  title: 'Fleet Management',      desc: 'Register every vehicle with capacity, region and status. View and update the entire fleet from one unified list.',          tag: 'Vehicles'    },
    { icon: I.driver, title: 'Driver Profiles',        desc: 'Track license categories and expiry dates. Safety scores surface at-risk drivers before they create incidents.',          tag: 'Drivers'     },
    { icon: I.trip,   title: 'Trip Dispatch',           desc: 'Dispatch trips in seconds. Business rules block overweight loads, expired licenses, and unavailable resources.',           tag: 'Trips'       },
    { icon: I.chart,  title: 'Live Analytics',          desc: 'Fleet utilization, revenue per trip, and weekly dispatch trends — clear numbers, no noise.',                              tag: 'Dashboard'   },
    { icon: I.fuel,   title: 'Fueling Logs',            desc: 'Track fuel consumption per vehicle and per trip. Spot inefficiencies before they become operating costs.',                tag: 'Fueling'     },
    { icon: I.wrench, title: 'Maintenance Records',     desc: 'Log scheduled and reactive maintenance. Know which vehicles need workshop attention before they miss a dispatch.',        tag: 'Maintenance' },
  ]

  const stats = [
    { val: '99.9%', lbl: 'Uptime SLA'             },
    { val: '<2s',   lbl: 'Avg. Response Time'      },
    { val: '∞',     lbl: 'Vehicles Supported'      },
    { val: '24/7',  lbl: 'Operational Coverage'    },
  ]

  const steps = [
    { num: '01', title: 'Register your fleet',   desc: 'Add vehicles with registration numbers, load capacity limits, and regional assignments. Import in bulk or one at a time.' },
    { num: '02', title: 'Onboard your drivers',  desc: 'Create driver profiles with license categories. The system flags expiring licenses automatically so nothing slips through.' },
    { num: '03', title: 'Dispatch and track',    desc: 'Select a vehicle and driver, set the route — TransitOps validates all business rules before confirming dispatch.' },
  ]

  const safeguards = [
    { icon: I.shield, text: 'Cargo weight validated against vehicle max capacity before every dispatch' },
    { icon: I.check,  text: 'Driver license expiry checked on every trip creation — expired = blocked' },
    { icon: I.zap,    text: 'Vehicle and driver status locked during active trips, released on completion' },
    { icon: I.bell,   text: 'Visual alerts for suspended, off-duty, or unavailable drivers' },
  ]

  return (
    <div className="lp-root">
      {/* ambient light */}
      <div className="lp-orb lp-orb-1" aria-hidden="true" />
      <div className="lp-orb lp-orb-2" aria-hidden="true" />
      <div className="lp-orb lp-orb-3" aria-hidden="true" />

      {/* ══ NAV ══════════════════════════════════════════════════════════ */}
      <header className={`lp-nav${scrolled ? ' scrolled' : ''}`}>
        <Inner style={{ padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '100%' }}>
          <a className="lp-nav-brand" href="#" onClick={e => e.preventDefault()}>
            <div className="lp-nav-brand-icon"><Icon d={I.truck} size={15} /></div>
            <span className="lp-nav-brand-name">TransitOps</span>
          </a>

          <nav className="lp-nav-links">
            <a className="lp-nav-link" href="#features">Features</a>
            <a className="lp-nav-link" href="#how-it-works">How it works</a>
            <span className="lp-nav-link" onClick={onEnter} style={{ cursor: 'pointer' }}>Dashboard</span>
          </nav>

          <div className="lp-nav-actions">
            <button className="btn-lp-ghost" onClick={onEnter}>Open Dashboard</button>
            <button className="btn-lp-primary" id="lp-get-started" onClick={onEnter}>
              Get Started <Icon d={I.arrow} size={13} />
            </button>
          </div>
        </Inner>
      </header>

      {/* ══ HERO ═════════════════════════════════════════════════════════ */}
      <section className="lp-hero" id="hero">
        <div className="lp-hero-eyebrow">
          <span className="lp-hero-eyebrow-dot" aria-hidden="true" />
          Fleet operations, simplified
        </div>

        <h1 className="lp-hero-title">
          Run your fleet.<br />
          <em>Not your spreadsheets.</em>
        </h1>

        <p className="lp-hero-sub">
          TransitOps is a single command centre for vehicles, drivers,
          trips, fueling, and maintenance — with business rules baked in.
        </p>

        <div className="lp-hero-actions">
          <button className="btn-lp-primary" id="lp-hero-cta" onClick={onEnter}>
            Open Dashboard <Icon d={I.arrow} size={14} />
          </button>
          <a className="btn-lp-ghost" href="#features">Explore Features</a>
        </div>

        {/* Dashboard Mockup */}
        <div className="lp-hero-mockup">
          <div className="lp-mockup-chrome">
            <div className="lp-mockup-dot" style={{ background: '#ef4444' }} />
            <div className="lp-mockup-dot" style={{ background: '#f59e0b' }} />
            <div className="lp-mockup-dot" style={{ background: '#10b981' }} />
            <div className="lp-mockup-url">transitops.app/dashboard</div>
          </div>
          <div className="lp-mockup-screen">
            <div className="lp-mockup-sidebar">
              <div className="lp-mockup-nav-item active" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="lp-mockup-nav-item" style={{ marginTop: i === 2 ? 10 : 0 }} />
              ))}
            </div>
            <div className="lp-mockup-main">
              <div className="lp-mockup-kpi-row">
                {[
                  { v: '24', l: 'Vehicles' }, { v: '18', l: 'Available' },
                  { v: '6',  l: 'On Trip'  }, { v: '89%', l: 'Util.' },
                ].map(k => (
                  <div className="lp-mockup-kpi" key={k.l}>
                    <div className="lp-mockup-kpi-val">{k.v}</div>
                    <div className="lp-mockup-kpi-lbl">{k.l}</div>
                  </div>
                ))}
              </div>
              <div className="lp-mockup-chart">
                {[35, 60, 40, 80, 55, 90, 45].map((h, i) => (
                  <div key={i} className={`lp-mockup-bar ${h > 70 ? 'hi' : h > 50 ? 'md' : ''}`}
                    style={{ height: `${h}%` }} />
                ))}
              </div>
              {/* mock table rows */}
              <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--bg-border)', borderRadius: 7, overflow: 'hidden' }}>
                {[
                  { route: 'Bangalore → Mumbai', status: 'dispatched', color: 'var(--s-blue)' },
                  { route: 'Pune → Hyderabad',   status: 'draft',      color: 'var(--s-gray)' },
                  { route: 'Delhi → Jaipur',      status: 'completed',  color: 'var(--s-green)' },
                ].map(r => (
                  <div key={r.route} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 12px', borderBottom: '1px solid var(--bg-border)' }}>
                    <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{r.route}</span>
                    <span style={{ fontSize: 9, fontWeight: 600, color: r.color, background: `${r.color}18`, padding: '2px 7px', borderRadius: 999 }}>{r.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lp-mockup-glow" aria-hidden="true" />
        </div>
      </section>

      {/* ══ STATS STRIP ══════════════════════════════════════════════════ */}
      <div className="lp-stats">
        {stats.map(s => (
          <div className="lp-stat" key={s.lbl}>
            <div className="lp-stat-val">{s.val}</div>
            <div className="lp-stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* ══ FEATURES ═════════════════════════════════════════════════════ */}
      <section id="features" style={{ padding: '100px 0' }}>
        <Inner>
          <div className="lp-section-eyebrow">Capabilities</div>
          <h2 className="lp-section-title">
            Everything your fleet needs.<br />Nothing it doesn't.
          </h2>
          <p className="lp-section-sub">
            Purpose-built for transport operations. Every module is designed around
            real fleet workflows — not generic CRUD.
          </p>
          {/* Uniform 3-col grid — no asymmetric spans */}
          <div className="lp-feature-grid">
            {features.map(f => (
              <div key={f.title} className="lp-feature-card">
                <div className="lp-feature-icon"><Icon d={f.icon} size={18} /></div>
                <div className="lp-feature-title">{f.title}</div>
                <div className="lp-feature-desc">{f.desc}</div>
                <span className="lp-feature-tag">{f.tag}</span>
              </div>
            ))}
          </div>
        </Inner>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: '0 0 100px' }}>
        <Inner>
          <div className="lp-section-eyebrow">Process</div>
          <h2 className="lp-section-title">Up and running in minutes.</h2>
          <p className="lp-section-sub">
            Three steps from zero to a fully operational fleet management system.
          </p>
          <div className="lp-steps">
            {steps.map(s => (
              <div className="lp-step" key={s.num}>
                <div className="lp-step-num">{s.num}</div>
                <div className="lp-step-title">{s.title}</div>
                <div className="lp-step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </Inner>
      </section>

      {/* ══ SAFEGUARDS ═══════════════════════════════════════════════════ */}
      <section style={{ padding: '0 0 100px' }}>
        <Inner>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 56,
            alignItems: 'center',
            background: 'var(--bg-raised)',
            border: '1px solid var(--bg-border)',
            borderRadius: 'var(--r-xl)',
            padding: '52px 48px',
          }}>
            <div>
              <div className="lp-section-eyebrow">Built-in safeguards</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,38px)', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.15, color: 'var(--text-primary)', marginBottom: 14 }}>
                Dispatch with confidence.<br />Rules enforce themselves.
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                TransitOps validates every trip before it's confirmed. Overweight loads,
                unavailable vehicles, expired licenses — all caught automatically.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {safeguards.map(r => (
                <div key={r.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 32, height: 32, flexShrink: 0,
                    background: 'var(--s-green-bg)',
                    border: '1px solid rgba(74,222,128,0.15)',
                    borderRadius: 'var(--r-sm)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--s-green)', marginTop: 2,
                  }}>
                    <Icon d={r.icon} size={14} />
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{r.text}</span>
                </div>
              ))}
            </div>
          </div>
        </Inner>
      </section>

      {/* ══ CTA ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: '0 40px 80px' }}>
        <div className="lp-cta" style={{ maxWidth: 1140, margin: '0 auto' }}>
          <h2 className="lp-cta-title">Ready to take control of your fleet?</h2>
          <p className="lp-cta-sub">
            Open the dashboard and start managing vehicles, drivers, and trips right now.
          </p>
          <div className="lp-cta-actions">
            <button className="btn-lp-primary" id="lp-cta-final" onClick={onEnter}>
              Open Dashboard <Icon d={I.arrow} size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════════════ */}
      <footer className="lp-footer">
        <Inner style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, width: '100%', maxWidth: '100%' }}>
          <div className="lp-footer-brand">TransitOps</div>
          <div className="lp-footer-copy">© {new Date().getFullYear()} TransitOps · Fleet Management Platform</div>
        </Inner>
      </footer>
    </div>
  )
}
