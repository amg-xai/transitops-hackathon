import { useState, useMemo, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Polyline, Popup, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import './index.css'
import LandingPage from './LandingPage'
import * as api from './api'

/* Fix for default leaflet icons in React */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/* ─── ICONS (inline SVG helpers) ──────────────────────────────────────── */
const Icon = ({ d, size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...p}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
)

const Icons = {
  dashboard: ["M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z", "M9 22V12h6v10"],
  vehicle:   ["M1 3h15l3 6-3 6H1z", "M1 9h15", "M16 6v6"],
  driver:    ["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2", "M12 3a4 4 0 100 8 4 4 0 000-8z"],
  trip:      ["M3 12a9 9 0 1018 0 9 9 0 00-18 0", "M12 8v4l3 3"],
  fuel:      ["M3 22V8a2 2 0 012-2h10a2 2 0 012 2v14", "M17 8h2a2 2 0 012 2v6", "M7 15h4"],
  wrench:    ["M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"],
  plus:      "M12 5v14M5 12h14",
  search:    ["M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"],
  x:         "M18 6L6 18M6 6l12 12",
  chevron:   "M6 9l6 6 6-6",
  check:     "M20 6L9 17l-5-5",
  dispatch:  "M5 12h14M12 5l7 7-7 7",
  truck:     ["M1 3h15v13H1z", "M16 8h4l3 5v5h-7V8z", "M5 21a2 2 0 100-4 2 2 0 000 4z", "M19 21a2 2 0 100-4 2 2 0 000 4z"],
  logout:    ["M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  alert:     ["M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z", "M12 9v4", "M12 17h.01"],
  complete:  ["M22 11.08V12a10 10 0 11-5.93-9.14", "M22 4L12 14.01l-3-3"],
  cancel:    "M18 6L6 18M6 6l12 12",
  filter:    "M22 3H2l8 9.46V19l4 2v-8.54L22 3",
}

/* ─── HELPERS ──────────────────────────────────────────────────────────── */
const Badge = ({ status }) => (
  <span className={`badge badge-${status}`}>{status.replace('_', ' ')}</span>
)

const ScoreBadge = ({ val }) => {
  const cls = val >= 8.5 ? 'score-high' : val >= 7 ? 'score-mid' : 'score-low'
  return <span className={`score ${cls}`}>{val.toFixed(1)}</span>
}

const initials = name => name ? name.split(' ').map(w => w[0]).join('').slice(0, 2) : '?'

const fmt = n => n >= 1000000
  ? `₹${(n / 1000000).toFixed(1)}M`
  : n >= 1000 ? `₹${(n / 1000).toFixed(0)}K` : `₹${n}`

/* ─── MODAL WRAPPER ────────────────────────────────────────────────────── */
function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>
            <Icon d={Icons.x} size={15} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

/* ─── LOGIN PAGE ────────────────────────────────────────────────────────── */
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await api.auth.login(username, password)
      onLogin(user)
    } catch {
      setError('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="sidebar-brand-icon"><Icon d={Icons.truck} size={16} /></div>
          <div>
            <div className="sidebar-brand-name">TransitOps</div>
            <div className="sidebar-brand-sub">Fleet Management</div>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input className="form-input" value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. fleet1" autoFocus />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="demo1234" />
          </div>
          {error && <div style={{ color: 'var(--s-red)', fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <div style={{ marginTop: 20, fontSize: 11.5, color: 'var(--text-tertiary)', textAlign: 'center', lineHeight: 1.7 }}>
          Demo: <strong>fleet1</strong> / <strong>demo1234</strong>
        </div>
      </div>
    </div>
  )
}

/* ─── SIDEBAR ───────────────────────────────────────────────────────────── */
function Sidebar({ page, setPage, user, onLogout }) {
  const nav = [
    { id: 'dashboard', label: 'Dashboard',  icon: Icons.dashboard },
    { id: 'vehicles',  label: 'Vehicles',   icon: Icons.truck },
    { id: 'drivers',   label: 'Drivers',    icon: Icons.driver },
    { id: 'trips',     label: 'Trips',      icon: Icons.trip },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Icon d={Icons.truck} size={14} />
        </div>
        <div>
          <div className="sidebar-brand-name">TransitOps</div>
          <div className="sidebar-brand-sub">Fleet Management</div>
        </div>
      </div>

      <div className="sidebar-section-label">Main</div>
      <nav className="sidebar-nav">
        {nav.map(n => (
          <button
            key={n.id}
            className={`nav-item${page === n.id ? ' active' : ''}`}
            onClick={() => setPage(n.id)}
          >
            <Icon d={n.icon} size={15} />
            {n.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-section-label">System</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <button className={`nav-item${page === 'fueling' ? ' active' : ''}`} onClick={() => setPage('fueling')}>
          <Icon d={Icons.fuel} size={15} />Fueling
        </button>
        <button className={`nav-item${page === 'maintenance' ? ' active' : ''}`} onClick={() => setPage('maintenance')}>
          <Icon d={Icons.wrench} size={15} />Maintenance
        </button>
      </div>

      <div className="sidebar-footer">
        {user && (
          <div style={{ padding: '8px 12px', fontSize: 12 }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{user.username} <Badge status={user.role.replace('_', ' ').split(' ').pop()} /></div>
            <button className="nav-item" onClick={onLogout} style={{ fontSize: 12, color: 'var(--s-red)', width: '100%' }}>
              <Icon d={Icons.logout} size={14} />Sign Out
            </button>
          </div>
        )}
        <div style={{ padding: '8px 0', fontSize: 11.5, color: 'var(--text-tertiary)', textAlign: 'center' }}>
          TransitOps · v1.0.0
        </div>
      </div>
    </aside>
  )
}

/* ─── DONUT CHART ────────────────────────────────────────────────────────── */
function DonutChart({ segments }) {
  const r = 52, cx = 60, cy = 60, stroke = 14
  const total = segments.reduce((s, x) => s + x.value, 0)
  let offset = 0
  const circumference = 2 * Math.PI * r

  return (
    <svg viewBox="0 0 120 120" width={120} height={120} style={{ overflow: 'visible' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-border)" strokeWidth={stroke} />
      {segments.map((seg, i) => {
        const pct = seg.value / total
        const dash = pct * circumference
        const gap = circumference - dash
        const rotation = (offset / total) * 360 - 90
        offset += seg.value
        return (
          <circle
            key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`}
            strokeLinecap="butt"
            transform={`rotate(${rotation} ${cx} ${cy})`}
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
        )
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="var(--text-primary)"
        fontSize={20} fontWeight={700} fontFamily="var(--font-display)">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--text-tertiary)" fontSize={9}>total</text>
    </svg>
  )
}

/* ─── BAR CHART ─────────────────────────────────────────────────────────── */
function BarChart({ data, color = 'var(--text-primary)' }) {
  const max = Math.max(...data.map(d => d.value))
  return (
    <div className="bar-chart">
      {data.map((d, i) => (
        <div className="bar-col" key={i} title={`${d.label}: ${d.value}`}>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{
                height: `${max ? (d.value / max) * 100 : 0}%`,
                background: color,
                opacity: 0.8 + (i / data.length) * 0.2,
              }}
            />
          </div>
          <div className="bar-lbl">{d.label}</div>
        </div>
      ))}
    </div>
  )
}

/* ─── LIVE TRANSIT MAP ───────────────────────────────────────────────────── */
function LiveTransitMap({ trips }) {
  const center = [19.0, 78.0]
  const activeTrips = trips.filter(t => t.status === 'dispatched')

  return (
    <div className="card live-map-card">
      <div className="card-header">
        <div className="card-title">Live Transits</div>
        <div className="card-subtitle">Active vehicles en route</div>
      </div>
      <div className="card-body" style={{ padding: 0, position: 'relative' }}>
        <MapContainer center={center} zoom={5} style={{ height: 400, width: '100%', borderRadius: '0 0 var(--r-xl) var(--r-xl)' }} zoomControl={false}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {activeTrips.map(trip => (
            <CircleMarker key={trip.id} center={center} radius={6} color="var(--s-blue)" fillOpacity={0.8}>
              <Popup><strong>Trip #{trip.id}</strong><br />{trip.source} → {trip.destination}</Popup>
            </CircleMarker>
          ))}
        </MapContainer>
        <div className="map-overlay" />
      </div>
    </div>
  )
}

/* ─── DASHBOARD PAGE ─────────────────────────────────────────────────────── */
function DashboardPage({ vehicles, drivers, trips, stats }) {
  const kpis = [
    { label: 'Total Vehicles', value: stats.total_vehicles, icon: Icons.truck, footer: `${stats.available_vehicles} available` },
    { label: 'Active Trips', value: stats.active_trips, icon: Icons.trip, footer: `${stats.drivers_on_duty} drivers on duty`, footerClass: stats.active_trips > 0 ? 'up' : '' },
    { label: 'Fleet Utilization', value: `${stats.fleet_utilization}%`, icon: Icons.dispatch, footer: `${stats.on_trip_vehicles} vehicles moving`, footerClass: stats.fleet_utilization > 60 ? 'up' : 'down' },
    { label: 'Revenue (Completed)', value: fmt(stats.revenue || 0), icon: Icons.check, footer: `${stats.completed_trips_count} trips done`, footerClass: 'up' },
    { label: 'In Maintenance', value: stats.in_shop_vehicles, icon: Icons.wrench, footer: `${stats.retired_vehicles} retired` },
    { label: 'Available Drivers', value: stats.available_drivers, icon: Icons.driver, footer: 'Ready to dispatch', footerClass: 'up' },
  ]

  const tripsByDay = [
    { label: 'Mon', value: 3 }, { label: 'Tue', value: 5 },
    { label: 'Wed', value: 2 }, { label: 'Thu', value: 7 },
    { label: 'Fri', value: 4 }, { label: 'Sat', value: 6 },
    { label: 'Sun', value: 1 },
  ]

  const fleetSegments = [
    { label: 'Available', value: stats.available_vehicles, color: 'var(--s-green)' },
    { label: 'On Trip',   value: stats.on_trip_vehicles, color: 'var(--s-blue)' },
    { label: 'In Shop',   value: stats.in_shop_vehicles, color: 'var(--s-amber)' },
    { label: 'Retired',   value: stats.retired_vehicles, color: 'var(--s-gray)' },
  ]

  const recentTrips = [...trips].slice(0, 5)

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Dashboard</h1>
          <p>Fleet overview — {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}</p>
        </div>
      </div>

      <div className="kpi-grid">
        {kpis.map((k, i) => (
          <div className="kpi-card" key={i}>
            <div className="kpi-card-header">
              <span className="kpi-label">{k.label}</span>
              <div className="kpi-icon"><Icon d={k.icon} size={14} /></div>
            </div>
            <div className="kpi-value">{k.value}</div>
            {k.footer && <div className={`kpi-footer ${k.footerClass || ''}`}>{k.footer}</div>}
          </div>
        ))}
      </div>

      <div className="section-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Trips This Week</div>
              <div className="card-subtitle">Daily dispatch count</div>
            </div>
          </div>
          <div className="card-body">
            <BarChart data={tripsByDay} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Fleet Status</div>
          </div>
          <div className="card-body">
            <div className="donut-wrapper">
              <DonutChart segments={fleetSegments.filter(s => s.value > 0)} />
              <div className="donut-legend">
                {fleetSegments.map(s => (
                  <div className="legend-item" key={s.label}>
                    <div className="legend-left">
                      <div className="legend-dot" style={{ background: s.color }} />
                      <span className="legend-label">{s.label}</span>
                    </div>
                    <span className="legend-count">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-section" style={{ marginTop: 24 }}>
        <LiveTransitMap trips={trips} />
      </div>

      <div className="page-section">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Trips</div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Route</th><th>Vehicle</th><th>Driver</th>
                  <th>Weight</th><th>Revenue</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTrips.length === 0 ? (
                  <tr><td colSpan={7}><div className="empty-state"><div className="empty-title">No trips yet</div></div></td></tr>
                ) : recentTrips.map(t => (
                  <tr key={t.id}>
                    <td className="td-muted">#{t.id}</td>
                    <td>
                      <div className="cell-main">{t.source} → {t.destination}</div>
                      <div className="cell-sub">{t.planned_distance} km</div>
                    </td>
                    <td className="td-muted">{t.vehicle_reg}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div className="avatar">{initials(t.driver_name)}</div>
                        {t.driver_name}
                      </div>
                    </td>
                    <td className="td-muted">{t.cargo_weight} kg</td>
                    <td>{fmt(t.revenue)}</td>
                    <td><Badge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

/* ─── VEHICLES PAGE ──────────────────────────────────────────────────────── */
function VehiclesPage({ vehicles, refreshVehicles }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ registration_number:'', name:'', vehicle_type:'van', max_load_capacity:'', acquisition_cost:'', region:'', status:'available', odometer:0 })

  const filtered = useMemo(() =>
    vehicles.filter(v =>
      (!search || v.name.toLowerCase().includes(search.toLowerCase()) || v.registration_number.toLowerCase().includes(search.toLowerCase())) &&
      (!statusFilter || v.status === statusFilter) &&
      (!typeFilter   || v.vehicle_type === typeFilter)
    ), [vehicles, search, statusFilter, typeFilter])

  const addVehicle = async () => {
    if (!form.registration_number || !form.name) return
    setSaving(true)
    try {
      await api.vehicles.create({
        ...form,
        max_load_capacity: Number(form.max_load_capacity) || 0,
        acquisition_cost: Number(form.acquisition_cost) || 0,
        odometer: Number(form.odometer) || 0,
      })
      setShowAdd(false)
      setForm({ registration_number:'', name:'', vehicle_type:'van', max_load_capacity:'', acquisition_cost:'', region:'', status:'available', odometer:0 })
      refreshVehicles()
    } catch (e) {
      alert(e.error || 'Failed to add vehicle')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Vehicles</h1>
          <p>{vehicles.length} vehicles registered in fleet</p>
        </div>
        <button className="btn btn-primary" id="add-vehicle-btn" onClick={() => setShowAdd(true)}>
          <Icon d={Icons.plus} size={14} /> Add Vehicle
        </button>
      </div>

      <div className="page-section">
        <div className="filters-bar" style={{ marginBottom: 16 }}>
          <div className="search-wrap">
            <span className="search-icon"><Icon d={Icons.search} size={13} /></span>
            <input className="search-input" placeholder="Search vehicles…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="available">Available</option>
            <option value="on_trip">On Trip</option>
            <option value="in_shop">In Shop</option>
            <option value="retired">Retired</option>
          </select>
          <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All types</option>
            <option value="van">Van</option>
            <option value="truck">Truck</option>
            <option value="bus">Bus</option>
            <option value="car">Car</option>
            <option value="motorcycle">Motorcycle</option>
          </select>
        </div>

        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Vehicle</th><th>Reg. Number</th><th>Type</th>
                  <th>Capacity</th><th>Odometer</th><th>Region</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-icon"><Icon d={Icons.truck} size={28} /></div>
                      <div className="empty-title">No vehicles found</div>
                      <div className="empty-desc">Try adjusting your filters</div>
                    </div>
                  </td></tr>
                ) : filtered.map(v => (
                  <tr key={v.id}>
                    <td>
                      <div className="cell-main">{v.name}</div>
                      <div className="cell-sub">{fmt(v.acquisition_cost)}</div>
                    </td>
                    <td className="td-muted" style={{ fontFamily: 'monospace', fontSize: 12 }}>{v.registration_number}</td>
                    <td className="td-muted" style={{ textTransform: 'capitalize' }}>{v.vehicle_type}</td>
                    <td className="td-muted">{v.max_load_capacity.toLocaleString()} kg</td>
                    <td className="td-muted">{v.odometer.toLocaleString()} km</td>
                    <td className="td-muted">{v.region || '—'}</td>
                    <td><Badge status={v.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAdd && (
        <Modal title="Add Vehicle" onClose={() => setShowAdd(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn btn-primary" id="submit-vehicle-btn" onClick={addVehicle} disabled={saving}>{saving ? 'Saving…' : 'Add Vehicle'}</button>
          </>}>
          <div className="form-grid">
            <div className="form-group">
              <label>Registration Number</label>
              <input className="form-input" placeholder="KA-01-AB-0000" value={form.registration_number} onChange={e => setForm(f => ({...f, registration_number: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Vehicle Name</label>
              <input className="form-input" placeholder="e.g. Tata Ace" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select className="form-select-full" value={form.vehicle_type} onChange={e => setForm(f => ({...f, vehicle_type: e.target.value}))}>
                <option value="van">Van</option>
                <option value="truck">Truck</option>
                <option value="bus">Bus</option>
                <option value="car">Car</option>
                <option value="motorcycle">Motorcycle</option>
              </select>
            </div>
            <div className="form-group">
              <label>Max Load (kg)</label>
              <input className="form-input" type="number" placeholder="1000" value={form.max_load_capacity} onChange={e => setForm(f => ({...f, max_load_capacity: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Acquisition Cost (₹)</label>
              <input className="form-input" type="number" placeholder="850000" value={form.acquisition_cost} onChange={e => setForm(f => ({...f, acquisition_cost: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Region</label>
              <input className="form-input" placeholder="e.g. Bangalore North" value={form.region} onChange={e => setForm(f => ({...f, region: e.target.value}))} />
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

/* ─── DRIVERS PAGE ───────────────────────────────────────────────────────── */
function DriversPage({ drivers, refreshDrivers }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedDriverId, setSelectedDriverId] = useState(null)
  const [form, setForm] = useState({ name:'', license_number:'', license_category:'LMV', license_expiry:'', contact_number:'', safety_score:'10.0', status:'available' })

  const filtered = useMemo(() =>
    drivers.filter(d =>
      (!search || d.name.toLowerCase().includes(search.toLowerCase()) || d.license_number.toLowerCase().includes(search.toLowerCase())) &&
      (!statusFilter || d.status === statusFilter)
    ), [drivers, search, statusFilter])

  const addDriver = async () => {
    if (!form.name || !form.license_number || !form.license_expiry) return
    setSaving(true)
    try {
      await api.drivers.create(form)
      setShowAdd(false)
      setForm({ name:'', license_number:'', license_category:'LMV', license_expiry:'', contact_number:'', safety_score:'10.0', status:'available' })
      refreshDrivers()
    } catch (e) {
      alert(e.error || 'Failed to add driver')
    } finally {
      setSaving(false)
    }
  }

  const activeDriver = drivers.find(d => d.id === selectedDriverId)

  const getSafetyData = (d) => {
    if (!d) return null
    const s = d.safety_score
    const speed = Math.min(100, Math.round(s * 10))
    const brake = Math.max(30, Math.round((s - 2) * 12))
    const idle = Math.max(2, Math.round(20 - s * 1.5)) + '%'
    let warnings = [], achievements = []
    if (s >= 9.0) achievements = ['Eco-Driver of the Month', '10,000+ Safe Kilometers']
    else if (s >= 7.0) achievements = ['On-Time Champion']
    if (s < 8.0 && s >= 6.0) warnings = ['Frequent hard braking incidents']
    if (s < 6.0) warnings = ['Multiple speeding alerts', 'License validity check required']
    return { speedScore: speed, brakingScore: brake, idleTime: idle, warnings, achievements }
  }

  const heatmapWeeks = useMemo(() => Array.from({ length: 24 }, () =>
    Array.from({ length: 7 }, () => Math.floor(Math.random() * ((activeDriver?.safety_score || 10) > 7 ? 4 : 2)))
  ), [activeDriver?.id])

  const ShieldCheckIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
  const ShieldAlertIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginTop:'2px',flexShrink:0}}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
  const AwardIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>

  const currentStats = getSafetyData(activeDriver)
  const days = ['Mon', 'Wed', 'Fri']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>{selectedDriverId ? 'Driver Profile & Safety Hub' : 'Drivers'}</h1>
          <p>{selectedDriverId ? 'Monitor safety scores, harsh braking logs, and compliance.' : `${drivers.length} drivers in the system`}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {selectedDriverId && (
            <button className="btn btn-ghost" onClick={() => setSelectedDriverId(null)}>← Back to all drivers</button>
          )}
          <button className="btn btn-primary" id="add-driver-btn" onClick={() => setShowAdd(true)}>
            <Icon d={Icons.plus} size={14} /> Add Driver
          </button>
        </div>
      </div>

      {!selectedDriverId ? (
        <div className="page-section">
          <div className="filters-bar" style={{ marginBottom: 16 }}>
            <div className="search-wrap">
              <span className="search-icon"><Icon d={Icons.search} size={13} /></span>
              <input className="search-input" placeholder="Search drivers…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="available">Available</option>
              <option value="on_trip">On Trip</option>
              <option value="off_duty">Off Duty</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Driver</th><th>License No.</th><th>Category</th>
                    <th>Expiry</th><th>Contact</th><th>Safety Score</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7}>
                      <div className="empty-state">
                        <div className="empty-icon"><Icon d={Icons.driver} size={28} /></div>
                        <div className="empty-title">No drivers found</div>
                        <div className="empty-desc">Try adjusting your search</div>
                      </div>
                    </td></tr>
                  ) : filtered.map(d => (
                    <tr key={d.id} onClick={() => setSelectedDriverId(d.id)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div className="avatar">{initials(d.name)}</div>
                          <div className="cell-main">{d.name}</div>
                        </div>
                      </td>
                      <td className="td-muted" style={{ fontFamily:'monospace', fontSize:12 }}>{d.license_number}</td>
                      <td className="td-muted">{d.license_category}</td>
                      <td>
                        <span style={{ color: d.is_license_expired ? 'var(--s-red)' : 'var(--text-secondary)', fontSize:12 }}>
                          {d.license_expiry}
                          {d.is_license_expired && ' ⚠'}
                        </span>
                      </td>
                      <td className="td-muted">{d.contact_number}</td>
                      <td><ScoreBadge val={d.safety_score} /></td>
                      <td><Badge status={d.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeDriver && (
        <div className="page-section section-grid" style={{ gridTemplateColumns: '300px 1fr' }}>
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <div className="sidebar-section-label" style={{ padding: '0 0 16px 0', fontSize: '11px', letterSpacing: '1px' }}>Active Operators</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1, maxHeight: '600px' }}>
              {filtered.map(driver => {
                const tripsCount = Math.round(driver.safety_score * 12)
                const rating = driver.safety_score >= 9.0 ? 'Excellent' : driver.safety_score >= 7.0 ? 'Good' : 'Warning'
                return (
                  <button key={driver.id} onClick={() => setSelectedDriverId(driver.id)}
                    className={`driver-select-btn ${selectedDriverId === driver.id ? 'active' : ''}`}>
                    <div>
                      <div className="cell-main" style={{ fontSize: '14px' }}>{driver.name}</div>
                      <div className="cell-sub" style={{ marginTop: '2px' }}>Trips: {tripsCount}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', color: driver.safety_score >= 8.5 ? 'var(--s-green)' : driver.safety_score >= 7.0 ? 'var(--s-amber)' : 'var(--s-red)', fontWeight: 'bold' }}>
                        {driver.safety_score.toFixed(1)}<span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 'normal' }}>/10</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ padding: '28px', display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div className="avatar-large" style={{ fontSize: '28px' }}>{initials(activeDriver.name)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>{activeDriver.name}</h3>
                  <Badge status={activeDriver.status} />
                </div>
                <div className="stat-row">
                  <div className="stat-box"><div className="stat-box-lbl">Speed Control</div><div className="stat-box-val">{currentStats.speedScore}%</div></div>
                  <div className="stat-box"><div className="stat-box-lbl">Smooth Braking</div><div className="stat-box-val">{currentStats.brakingScore}%</div></div>
                  <div className="stat-box"><div className="stat-box-lbl">Engine Idling</div><div className="stat-box-val">{currentStats.idleTime}</div></div>
                  <div className="stat-box"><div className="stat-box-lbl">License Expiry</div><div className="stat-box-val" style={{ fontSize: '15px', color: activeDriver.is_license_expired ? 'var(--s-red)' : 'var(--text-primary)' }}>{activeDriver.license_expiry}</div></div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <div className="sidebar-section-label" style={{ padding: '0 0 16px 0', fontSize: '11px', letterSpacing: '1px' }}>Weekly Duty Heatmap</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingTop: '16px', paddingBottom: '12px', fontSize: '10px', color: 'var(--text-tertiary)' }}>
                  {days.map((day, i) => <span key={i}>{day}</span>)}
                </div>
                <div style={{ flex: 1, overflowX: 'auto', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '10px', color: 'var(--text-tertiary)' }}>
                    {months.map((month, i) => <span key={i}>{month}</span>)}
                  </div>
                  <div className="heatmap-container">
                    {heatmapWeeks.map((week, wIdx) => (
                      <div key={wIdx} className="heatmap-col">
                        {week.map((cell, cIdx) => (<div key={cIdx} className={`heatmap-cell cell-val-${cell}`} />))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="section-grid" style={{ gridTemplateColumns: '1fr 1fr', padding: 0, gap: '20px' }}>
              <div className="card" style={{ padding: '24px' }}>
                <div className="sidebar-section-label" style={{ padding: '0 0 16px 0', fontSize: '11px', letterSpacing: '1px' }}>Active Anomalies</div>
                {currentStats.warnings.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--s-green)', padding: '12px 0' }}>
                    <ShieldCheckIcon /> <span style={{ fontSize: '13px', fontWeight: '500' }}>No safety violations logged.</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {currentStats.warnings.map((warn, i) => (
                      <div key={i} className="alert-box danger" style={{ padding: '14px', borderRadius: '8px' }}>
                        <ShieldAlertIcon /><span style={{ fontSize: '13px' }}>{warn}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="card" style={{ padding: '24px' }}>
                <div className="sidebar-section-label" style={{ padding: '0 0 16px 0', fontSize: '11px', letterSpacing: '1px' }}>Achievements</div>
                {currentStats.achievements.length === 0 ? (
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '12px 0' }}>No active performance badges.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {currentStats.achievements.map((ach, i) => (
                      <div key={i} className="alert-box success" style={{ padding: '14px', borderRadius: '8px' }}>
                        <AwardIcon /><span style={{ fontSize: '13px', fontWeight: '500' }}>{ach}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <Modal title="Add Driver" onClose={() => setShowAdd(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn btn-primary" id="submit-driver-btn" onClick={addDriver} disabled={saving}>{saving ? 'Saving…' : 'Add Driver'}</button>
          </>}>
          <div className="form-grid">
            <div className="form-group span-2">
              <label>Full Name</label>
              <input className="form-input" placeholder="e.g. Ravi Kumar" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>License Number</label>
              <input className="form-input" placeholder="KA1420190001234" value={form.license_number} onChange={e => setForm(f => ({...f, license_number: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>License Category</label>
              <select className="form-select-full" value={form.license_category} onChange={e => setForm(f => ({...f, license_category: e.target.value}))}>
                <option value="LMV">LMV</option><option value="HMV">HMV</option>
                <option value="HGMV">HGMV</option><option value="MCWG">MCWG</option>
              </select>
            </div>
            <div className="form-group">
              <label>License Expiry</label>
              <input className="form-input" type="date" value={form.license_expiry} onChange={e => setForm(f => ({...f, license_expiry: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Contact Number</label>
              <input className="form-input" placeholder="9876543210" value={form.contact_number} onChange={e => setForm(f => ({...f, contact_number: e.target.value}))} />
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

/* ─── TRIPS PAGE ─────────────────────────────────────────────────────────── */
function TripsPage({ trips, refreshTrips, vehicles, drivers }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showComplete, setShowComplete] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ vehicle_id:'', driver_id:'', source:'', destination:'', cargo_weight:'', planned_distance:'', revenue:'' })
  const [completeForm, setCompleteForm] = useState({ final_odometer:'', fuel_consumed:'', actual_distance:'', revenue:'' })

  const filtered = useMemo(() =>
    trips.filter(t =>
      (!search || t.source.toLowerCase().includes(search.toLowerCase()) || t.destination.toLowerCase().includes(search.toLowerCase()) || t.vehicle_reg?.toLowerCase().includes(search.toLowerCase())) &&
      (!statusFilter || t.status === statusFilter)
    ), [trips, search, statusFilter])

  const createTrip = async () => {
    if (!form.vehicle_id || !form.driver_id || !form.source || !form.destination) return
    setSaving(true)
    try {
      await api.trips.create({
        ...form,
        cargo_weight: Number(form.cargo_weight) || 0,
        planned_distance: Number(form.planned_distance) || 0,
        revenue: Number(form.revenue) || 0,
      })
      setShowAdd(false)
      setForm({ vehicle_id:'', driver_id:'', source:'', destination:'', cargo_weight:'', planned_distance:'', revenue:'' })
      refreshTrips()
    } catch (e) {
      alert(e.error || 'Failed to create trip')
    } finally {
      setSaving(false)
    }
  }

  const dispatchTrip = async (id) => {
    try { await api.trips.dispatch(id); refreshTrips() }
    catch (e) { alert(e.error || 'Dispatch failed') }
  }
  const cancelTrip = async (id) => {
    try { await api.trips.cancel(id); refreshTrips() }
    catch (e) { alert(e.error || 'Cancel failed') }
  }
  const completeTrip = async () => {
    if (!showComplete) return
    setSaving(true)
    try {
      await api.trips.complete(showComplete, {
        final_odometer: Number(completeForm.final_odometer) || 0,
        fuel_consumed: Number(completeForm.fuel_consumed) || 0,
        actual_distance: Number(completeForm.actual_distance) || 0,
        revenue: Number(completeForm.revenue) || 0,
      })
      setShowComplete(null)
      setCompleteForm({ final_odometer:'', fuel_consumed:'', actual_distance:'', revenue:'' })
      refreshTrips()
    } catch (e) {
      alert(e.error || 'Complete failed')
    } finally {
      setSaving(false)
    }
  }

  const availableVehicles = vehicles.filter(v => v.status === 'available')
  const availableDrivers = drivers.filter(d => d.status === 'available' && !d.is_license_expired)

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Trips</h1>
          <p>{trips.length} trips in the system</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Icon d={Icons.plus} size={14} /> Create Trip
        </button>
      </div>

      <div className="page-section">
        <div className="filters-bar" style={{ marginBottom: 16 }}>
          <div className="search-wrap">
            <span className="search-icon"><Icon d={Icons.search} size={13} /></span>
            <input className="search-input" placeholder="Search trips…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="dispatched">Dispatched</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Route</th><th>Vehicle</th><th>Driver</th>
                  <th>Weight</th><th>Distance</th><th>Revenue</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9}>
                    <div className="empty-state">
                      <div className="empty-icon"><Icon d={Icons.trip} size={28} /></div>
                      <div className="empty-title">No trips found</div>
                    </div>
                  </td></tr>
                ) : filtered.map(t => (
                  <tr key={t.id}>
                    <td className="td-muted">#{t.id}</td>
                    <td>
                      <div className="cell-main">{t.source} → {t.destination}</div>
                    </td>
                    <td className="td-muted">{t.vehicle_reg}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div className="avatar">{initials(t.driver_name)}</div>
                        {t.driver_name}
                      </div>
                    </td>
                    <td className="td-muted">{t.cargo_weight} kg</td>
                    <td className="td-muted">{t.planned_distance} km</td>
                    <td>{fmt(t.revenue)}</td>
                    <td><Badge status={t.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {t.status === 'draft' && (
                          <>
                            <button className="btn btn-primary" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => dispatchTrip(t.id)}>
                              <Icon d={Icons.dispatch} size={12} /> Dispatch
                            </button>
                            <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => cancelTrip(t.id)}>Cancel</button>
                          </>
                        )}
                        {t.status === 'dispatched' && (
                          <>
                            <button className="btn btn-primary" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => setShowComplete(t.id)}>
                              <Icon d={Icons.complete} size={12} /> Complete
                            </button>
                            <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => cancelTrip(t.id)}>Cancel</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAdd && (
        <Modal title="Create Trip" onClose={() => setShowAdd(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={createTrip} disabled={saving}>{saving ? 'Creating…' : 'Create Trip'}</button>
          </>}>
          <div className="form-grid">
            <div className="form-group">
              <label>Vehicle</label>
              <select className="form-select-full" value={form.vehicle_id} onChange={e => setForm(f => ({...f, vehicle_id: e.target.value}))}>
                <option value="">Select vehicle…</option>
                {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.registration_number})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Driver</label>
              <select className="form-select-full" value={form.driver_id} onChange={e => setForm(f => ({...f, driver_id: e.target.value}))}>
                <option value="">Select driver…</option>
                {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.license_category})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Source</label>
              <input className="form-input" placeholder="e.g. Bangalore" value={form.source} onChange={e => setForm(f => ({...f, source: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Destination</label>
              <input className="form-input" placeholder="e.g. Mumbai" value={form.destination} onChange={e => setForm(f => ({...f, destination: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Cargo Weight (kg)</label>
              <input className="form-input" type="number" value={form.cargo_weight} onChange={e => setForm(f => ({...f, cargo_weight: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Planned Distance (km)</label>
              <input className="form-input" type="number" value={form.planned_distance} onChange={e => setForm(f => ({...f, planned_distance: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Revenue (₹)</label>
              <input className="form-input" type="number" value={form.revenue} onChange={e => setForm(f => ({...f, revenue: e.target.value}))} />
            </div>
          </div>
        </Modal>
      )}

      {showComplete && (
        <Modal title="Complete Trip" onClose={() => setShowComplete(null)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setShowComplete(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={completeTrip} disabled={saving}>{saving ? 'Completing…' : 'Complete Trip'}</button>
          </>}>
          <div className="form-grid">
            <div className="form-group">
              <label>Final Odometer (km)</label>
              <input className="form-input" type="number" value={completeForm.final_odometer} onChange={e => setCompleteForm(f => ({...f, final_odometer: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Fuel Consumed (L)</label>
              <input className="form-input" type="number" value={completeForm.fuel_consumed} onChange={e => setCompleteForm(f => ({...f, fuel_consumed: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Actual Distance (km)</label>
              <input className="form-input" type="number" value={completeForm.actual_distance} onChange={e => setCompleteForm(f => ({...f, actual_distance: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Revenue (₹)</label>
              <input className="form-input" type="number" value={completeForm.revenue} onChange={e => setCompleteForm(f => ({...f, revenue: e.target.value}))} />
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

/* ─── FUELING PAGE ───────────────────────────────────────────────────────── */
function FuelingPage({ vehicles, refreshAll }) {
  const [logs, setLogs] = useState([])
  const [expenses, setExpenses] = useState([])
  const [showAddFuel, setShowAddFuel] = useState(false)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fuelForm, setFuelForm] = useState({ vehicle_id:'', liters:'', cost:'', date:'' })
  const [expForm, setExpForm] = useState({ vehicle_id:'', category:'fuel', amount:'', description:'', date:'' })

  useEffect(() => {
    api.fueling.list().then(setLogs).catch(() => {})
    api.expenses.list().then(setExpenses).catch(() => {})
  }, [])

  const addFuel = async () => {
    if (!fuelForm.vehicle_id || !fuelForm.liters || !fuelForm.date) return
    setSaving(true)
    try {
      await api.fueling.create(fuelForm)
      setShowAddFuel(false)
      setFuelForm({ vehicle_id:'', liters:'', cost:'', date:'' })
      api.fueling.list().then(setLogs)
      refreshAll()
    } catch (e) { alert(e.error || 'Failed') }
    finally { setSaving(false) }
  }

  const addExpense = async () => {
    if (!expForm.vehicle_id || !expForm.amount || !expForm.date) return
    setSaving(true)
    try {
      await api.expenses.create(expForm)
      setShowAddExpense(false)
      setExpForm({ vehicle_id:'', category:'fuel', amount:'', description:'', date:'' })
      api.expenses.list().then(setExpenses)
      refreshAll()
    } catch (e) { alert(e.error || 'Failed') }
    finally { setSaving(false) }
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Fueling & Expenses</h1>
          <p>Track fuel consumption and operational costs</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={() => setShowAddFuel(true)}><Icon d={Icons.plus} size={14} /> Add Fuel Log</button>
          <button className="btn btn-ghost" onClick={() => setShowAddExpense(true)}><Icon d={Icons.plus} size={14} /> Add Expense</button>
        </div>
      </div>

      <div className="section-grid">
        <div className="card">
          <div className="card-header"><div className="card-title">Fuel Logs</div></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Vehicle</th><th>Liters</th><th>Cost</th><th>Date</th></tr></thead>
              <tbody>
                {logs.length === 0 ? <tr><td colSpan={4}><div className="empty-state"><div className="empty-title">No fuel logs</div></div></td></tr>
                : logs.map(l => (
                  <tr key={l.id}>
                    <td><div className="cell-main">{l.vehicle_name}</div><div className="cell-sub">{l.vehicle_reg}</div></td>
                    <td>{l.liters} L</td>
                    <td>{fmt(l.cost)}</td>
                    <td className="td-muted">{l.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Expenses</div></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Vehicle</th><th>Category</th><th>Amount</th><th>Date</th></tr></thead>
              <tbody>
                {expenses.length === 0 ? <tr><td colSpan={4}><div className="empty-state"><div className="empty-title">No expenses</div></div></td></tr>
                : expenses.map(e => (
                  <tr key={e.id}>
                    <td><div className="cell-main">{e.vehicle_name}</div></td>
                    <td className="td-muted" style={{ textTransform: 'capitalize' }}>{e.category}</td>
                    <td>{fmt(e.amount)}</td>
                    <td className="td-muted">{e.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddFuel && (
        <Modal title="Add Fuel Log" onClose={() => setShowAddFuel(false)} footer={<>
          <button className="btn btn-ghost" onClick={() => setShowAddFuel(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={addFuel} disabled={saving}>{saving ? 'Saving…' : 'Add'}</button>
        </>}>
          <div className="form-grid">
            <div className="form-group"><label>Vehicle</label>
              <select className="form-select-full" value={fuelForm.vehicle_id} onChange={e => setFuelForm(f => ({...f, vehicle_id: e.target.value}))}>
                <option value="">Select…</option>{vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Liters</label><input className="form-input" type="number" value={fuelForm.liters} onChange={e => setFuelForm(f => ({...f, liters: e.target.value}))} /></div>
            <div className="form-group"><label>Cost (₹)</label><input className="form-input" type="number" value={fuelForm.cost} onChange={e => setFuelForm(f => ({...f, cost: e.target.value}))} /></div>
            <div className="form-group"><label>Date</label><input className="form-input" type="date" value={fuelForm.date} onChange={e => setFuelForm(f => ({...f, date: e.target.value}))} /></div>
          </div>
        </Modal>
      )}

      {showAddExpense && (
        <Modal title="Add Expense" onClose={() => setShowAddExpense(false)} footer={<>
          <button className="btn btn-ghost" onClick={() => setShowAddExpense(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={addExpense} disabled={saving}>{saving ? 'Saving…' : 'Add'}</button>
        </>}>
          <div className="form-grid">
            <div className="form-group"><label>Vehicle</label>
              <select className="form-select-full" value={expForm.vehicle_id} onChange={e => setExpForm(f => ({...f, vehicle_id: e.target.value}))}>
                <option value="">Select…</option>{vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Category</label>
              <select className="form-select-full" value={expForm.category} onChange={e => setExpForm(f => ({...f, category: e.target.value}))}>
                <option value="fuel">Fuel</option><option value="toll">Toll</option><option value="maintenance">Maintenance</option><option value="other">Other</option>
              </select>
            </div>
            <div className="form-group"><label>Amount (₹)</label><input className="form-input" type="number" value={expForm.amount} onChange={e => setExpForm(f => ({...f, amount: e.target.value}))} /></div>
            <div className="form-group"><label>Date</label><input className="form-input" type="date" value={expForm.date} onChange={e => setExpForm(f => ({...f, date: e.target.value}))} /></div>
            <div className="form-group span-2"><label>Description</label><input className="form-input" value={expForm.description} onChange={e => setExpForm(f => ({...f, description: e.target.value}))} /></div>
          </div>
        </Modal>
      )}
    </>
  )
}

/* ─── MAINTENANCE PAGE ───────────────────────────────────────────────────── */
function MaintenancePage({ vehicles, refreshAll }) {
  const [logs, setLogs] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ vehicle_id:'', description:'', cost:'', start_date:'' })

  const loadLogs = useCallback(() => api.maintenance.list().then(setLogs).catch(() => {}), [])
  useEffect(() => { loadLogs() }, [loadLogs])

  const addLog = async () => {
    if (!form.vehicle_id || !form.description || !form.start_date) return
    setSaving(true)
    try {
      await api.maintenance.create(form)
      setShowAdd(false)
      setForm({ vehicle_id:'', description:'', cost:'', start_date:'' })
      loadLogs()
      refreshAll()
    } catch (e) { alert(e.error || 'Failed') }
    finally { setSaving(false) }
  }

  const closeLog = async (id) => {
    try { await api.maintenance.close(id); loadLogs(); refreshAll() }
    catch (e) { alert(e.error || 'Failed') }
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Maintenance</h1>
          <p>Scheduled and unscheduled maintenance records</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Icon d={Icons.plus} size={14} /> Add Record
        </button>
      </div>

      <div className="page-section">
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Vehicle</th><th>Description</th><th>Cost</th><th>Start</th><th>End</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {logs.length === 0 ? <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon"><Icon d={Icons.wrench} size={28} /></div><div className="empty-title">No maintenance records</div></div></td></tr>
                : logs.map(m => (
                  <tr key={m.id}>
                    <td><div className="cell-main">{m.vehicle_name}</div><div className="cell-sub">{m.vehicle_reg}</div></td>
                    <td style={{ maxWidth: 300 }}>{m.description}</td>
                    <td>{fmt(m.cost)}</td>
                    <td className="td-muted">{m.start_date}</td>
                    <td className="td-muted">{m.end_date || '—'}</td>
                    <td><Badge status={m.status} /></td>
                    <td>
                      {m.status === 'active' && (
                        <button className="btn btn-primary" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => closeLog(m.id)}>
                          <Icon d={Icons.check} size={12} /> Close
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAdd && (
        <Modal title="Add Maintenance Record" onClose={() => setShowAdd(false)} footer={<>
          <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={addLog} disabled={saving}>{saving ? 'Saving…' : 'Create'}</button>
        </>}>
          <div className="form-grid">
            <div className="form-group"><label>Vehicle</label>
              <select className="form-select-full" value={form.vehicle_id} onChange={e => setForm(f => ({...f, vehicle_id: e.target.value}))}>
                <option value="">Select…</option>{vehicles.filter(v => v.status !== 'retired' && v.status !== 'on_trip').map(v => <option key={v.id} value={v.id}>{v.name} ({v.registration_number})</option>)}
              </select>
            </div>
            <div className="form-group"><label>Cost (₹)</label><input className="form-input" type="number" value={form.cost} onChange={e => setForm(f => ({...f, cost: e.target.value}))} /></div>
            <div className="form-group"><label>Start Date</label><input className="form-input" type="date" value={form.start_date} onChange={e => setForm(f => ({...f, start_date: e.target.value}))} /></div>
            <div className="form-group span-2"><label>Description</label><textarea className="form-input" rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
          </div>
        </Modal>
      )}
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   APP — Main Component
   ═══════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [showLanding, setShowLanding] = useState(true)
  const [page, setPage] = useState('dashboard')

  // Data state
  const [vehicles, setVehicles] = useState([])
  const [driversList, setDriversList] = useState([])
  const [tripsList, setTripsList] = useState([])
  const [stats, setStats] = useState({})

  // Check existing session on mount
  useEffect(() => {
    api.auth.me()
      .then(u => { setUser(u); setShowLanding(false) })
      .catch(() => {})
      .finally(() => setAuthChecked(true))
  }, [])

  // Fetch data when logged in
  const refreshVehicles = useCallback(() => { api.vehicles.list().then(setVehicles).catch(() => {}) }, [])
  const refreshDrivers = useCallback(() => { api.drivers.list().then(setDriversList).catch(() => {}) }, [])
  const refreshTrips = useCallback(() => { api.trips.list().then(setTripsList).catch(() => {}) }, [])
  const refreshStats = useCallback(() => { api.dashboard.stats().then(setStats).catch(() => {}) }, [])
  const refreshAll = useCallback(() => { refreshVehicles(); refreshDrivers(); refreshTrips(); refreshStats() }, [refreshVehicles, refreshDrivers, refreshTrips, refreshStats])

  useEffect(() => {
    if (user) refreshAll()
  }, [user, refreshAll])

  const handleLogin = (u) => {
    setUser(u)
    setShowLanding(false)
  }

  const handleLogout = async () => {
    await api.auth.logout()
    setUser(null)
    setShowLanding(true)
  }

  // Loading screen
  if (!authChecked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-body)', color: 'var(--text-secondary)' }}>
        <div style={{ textAlign: 'center' }}>
          <Icon d={Icons.truck} size={32} />
          <div style={{ marginTop: 12, fontSize: 14 }}>Loading TransitOps…</div>
        </div>
      </div>
    )
  }

  // Landing page
  if (showLanding && !user) {
    return <LandingPage onEnter={() => setShowLanding(false)} />
  }

  // Login page
  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  const renderPage = () => {
    switch(page) {
      case 'dashboard':   return <DashboardPage vehicles={vehicles} drivers={driversList} trips={tripsList} stats={stats} />
      case 'vehicles':    return <VehiclesPage vehicles={vehicles} refreshVehicles={refreshVehicles} />
      case 'drivers':     return <DriversPage drivers={driversList} refreshDrivers={refreshDrivers} />
      case 'trips':       return <TripsPage trips={tripsList} refreshTrips={refreshTrips} vehicles={vehicles} drivers={driversList} />
      case 'fueling':     return <FuelingPage vehicles={vehicles} refreshAll={refreshAll} />
      case 'maintenance': return <MaintenancePage vehicles={vehicles} refreshAll={refreshAll} />
      default:            return <DashboardPage vehicles={vehicles} drivers={driversList} trips={tripsList} stats={stats} />
    }
  }

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} user={user} onLogout={handleLogout} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  )
}
