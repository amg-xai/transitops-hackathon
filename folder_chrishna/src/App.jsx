import { useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import './index.css'
import LandingPage from './LandingPage'

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

/* ─── SEED DATA ────────────────────────────────────────────────────────── */
const VEHICLES_INIT = [
  { id: 1, registration_number: 'KA-01-AB-1234', name: 'Tata Ace', vehicle_type: 'van',   status: 'available',  odometer: 12450, max_load_capacity: 750, region: 'Bangalore North', acquisition_cost: 850000 },
  { id: 2, registration_number: 'KA-02-CD-5678', name: 'Ashok Leyland',vehicle_type:'truck', status: 'on_trip',   odometer: 84200, max_load_capacity: 8000,region: 'Bangalore South', acquisition_cost: 3200000 },
  { id: 3, registration_number: 'KA-03-EF-9012', name: 'Force Traveller',vehicle_type:'bus', status: 'in_shop',  odometer: 56700, max_load_capacity: 2000,region: 'Mysuru', acquisition_cost: 1400000 },
  { id: 4, registration_number: 'MH-12-GH-3456', name: 'Mahindra Bolero',vehicle_type:'car', status: 'available',odometer: 31200, max_load_capacity: 500, region: 'Pune', acquisition_cost: 950000 },
  { id: 5, registration_number: 'DL-04-IJ-7890', name: 'Eicher 10.90',vehicle_type:'truck', status: 'available', odometer: 103400,max_load_capacity: 10000,region:'Delhi', acquisition_cost: 2800000 },
  { id: 6, registration_number: 'TN-09-KL-2345', name: 'Bajaj RE',vehicle_type:'motorcycle',status:'retired',    odometer: 182000, max_load_capacity: 150,region:'Chennai', acquisition_cost: 180000 },
]

const DRIVERS_INIT = [
  { id: 1, name: 'Ravi Kumar',    license_number: 'KA1420190001234', license_category: 'LMV',  license_expiry: '2027-08-15', contact_number: '9876543210', safety_score: 9.4, status: 'available' },
  { id: 2, name: 'Suresh Babu',   license_number: 'KA1420210005678', license_category: 'HMV',  license_expiry: '2026-03-22', contact_number: '9876543211', safety_score: 8.1, status: 'on_trip'   },
  { id: 3, name: 'Priya Sharma',  license_number: 'MH122022009012',  license_category: 'LMV',  license_expiry: '2025-11-10', contact_number: '9876543212', safety_score: 9.8, status: 'available' },
  { id: 4, name: 'Anand Nair',    license_number: 'TN092021003456',  license_category: 'HMV',  license_expiry: '2028-01-05', contact_number: '9876543213', safety_score: 7.5, status: 'off_duty'  },
  { id: 5, name: 'Deepak Singh',  license_number: 'DL042023007890',  license_category: 'HGMV', license_expiry: '2024-06-30', contact_number: '9876543214', safety_score: 6.2, status: 'suspended' },
  { id: 6, name: 'Kavitha Reddy', license_number: 'AP052022001122',  license_category: 'LMV',  license_expiry: '2027-09-18', contact_number: '9876543215', safety_score: 9.1, status: 'available' },
]

const TRIPS_INIT = [
  { id: 1, vehicle_id: 2, driver_id: 2, source: 'Bangalore', destination: 'Mumbai',   cargo_weight: 4500, planned_distance: 984,  revenue: 45000, status: 'dispatched',created_at: '2026-07-10', sourceCoords: [12.9716, 77.5946], destCoords: [19.0760, 72.8777], currentCoords: [15.3173, 75.7139] },
  { id: 2, vehicle_id: 4, driver_id: 1, source: 'Pune',      destination: 'Hyderabad',cargo_weight: 300,  planned_distance: 560,  revenue: 12000, status: 'draft',    created_at: '2026-07-11', sourceCoords: [18.5204, 73.8567], destCoords: [17.3850, 78.4867] },
  { id: 3, vehicle_id: 1, driver_id: 3, source: 'Bangalore', destination: 'Chennai',  cargo_weight: 600,  planned_distance: 346,  revenue: 18000, status: 'completed',created_at: '2026-07-08', sourceCoords: [12.9716, 77.5946], destCoords: [13.0827, 80.2707] },
  { id: 4, vehicle_id: 5, driver_id: 6, source: 'Delhi',     destination: 'Jaipur',   cargo_weight: 9200, planned_distance: 270,  revenue: 38000, status: 'completed',created_at: '2026-07-07', sourceCoords: [28.7041, 77.1025], destCoords: [26.9124, 75.7873] },
  { id: 5, vehicle_id: 1, driver_id: 1, source: 'Bangalore', destination: 'Mysuru',   cargo_weight: 700,  planned_distance: 144,  revenue: 8500,  status: 'cancelled',created_at: '2026-07-09', sourceCoords: [12.9716, 77.5946], destCoords: [12.2958, 76.6394] },
  { id: 6, vehicle_id: 3, driver_id: 4, source: 'Hyderabad', destination: 'Vizag',    cargo_weight: 1500, planned_distance: 620,  revenue: 21000, status: 'dispatched',created_at: '2026-07-12', sourceCoords: [17.3850, 78.4867], destCoords: [17.6868, 83.2185], currentCoords: [17.5000, 80.5000] },
]

/* ─── HELPERS ──────────────────────────────────────────────────────────── */
const Badge = ({ status }) => (
  <span className={`badge badge-${status}`}>{status.replace('_', ' ')}</span>
)

const ScoreBadge = ({ val }) => {
  const cls = val >= 8.5 ? 'score-high' : val >= 7 ? 'score-mid' : 'score-low'
  return <span className={`score ${cls}`}>{val.toFixed(1)}</span>
}

const initials = name => name.split(' ').map(w => w[0]).join('').slice(0, 2)

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

/* ─── SIDEBAR ───────────────────────────────────────────────────────────── */
function Sidebar({ page, setPage }) {
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
        <button className="nav-item" onClick={() => setPage('fueling')}>
          <Icon d={Icons.fuel} size={15} />Fueling
        </button>
        <button className="nav-item" onClick={() => setPage('maintenance')}>
          <Icon d={Icons.wrench} size={15} />Maintenance
        </button>
      </div>

      <div className="sidebar-footer">
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
  // Center roughly on central India
  const center = [19.0, 78.0];
  const activeTrips = trips.filter(t => t.status === 'dispatched' && t.sourceCoords && t.destCoords);

  return (
    <div className="card live-map-card">
      <div className="card-header">
        <div className="card-title">Live Transits</div>
        <div className="card-subtitle">Active vehicles en route</div>
      </div>
      <div className="card-body" style={{ padding: 0, position: 'relative' }}>
        <MapContainer center={center} zoom={5} style={{ height: 400, width: '100%', borderRadius: '0 0 var(--r-xl) var(--r-xl)' }} zoomControl={false}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; CartoDB'
          />
          {activeTrips.map(trip => (
            <div key={trip.id}>
              {/* Remaining Route Line (Dashed) */}
              <Polyline 
                positions={trip.currentCoords ? [trip.currentCoords, trip.destCoords] : [trip.sourceCoords, trip.destCoords]} 
                color="var(--s-blue)" 
                weight={2} 
                opacity={0.4} 
                dashArray="5, 7"
              />
              
              {/* Passed Route Line (Solid) */}
              {trip.currentCoords && (
                <Polyline 
                  positions={[trip.sourceCoords, trip.currentCoords]} 
                  color="var(--s-blue)" 
                  weight={3} 
                  opacity={0.9} 
                />
              )}

              {/* Source Dot (Hollow) */}
              <CircleMarker 
                center={trip.sourceCoords} 
                radius={5} 
                color="var(--s-blue)" 
                weight={2} 
                fillOpacity={0}
              >
                <Popup>{trip.source} (Source)</Popup>
              </CircleMarker>

              {/* Destination Dot (Solid) */}
              <CircleMarker 
                center={trip.destCoords} 
                radius={5} 
                stroke={false} 
                fillColor="var(--s-blue)" 
                fillOpacity={1}
              >
                <Popup>{trip.destination} (Destination)</Popup>
              </CircleMarker>

              {/* Current Position (Solid with white rim for contrast) */}
              {trip.currentCoords && (
                <CircleMarker 
                  center={trip.currentCoords} 
                  radius={6}
                  color="#ffffff"
                  weight={2}
                  fillColor="var(--s-blue)"
                  fillOpacity={1}
                >
                  <Popup>
                    <strong>Trip #{trip.id}</strong><br/>
                    {trip.source} &rarr; {trip.destination}
                  </Popup>
                </CircleMarker>
              )}
            </div>
          ))}
        </MapContainer>
        {/* Map overlay gradient for aesthetic blending */}
        <div className="map-overlay" />
      </div>
    </div>
  )
}

/* ─── DASHBOARD PAGE ─────────────────────────────────────────────────────── */
function DashboardPage({ vehicles, drivers, trips }) {
  const totalVeh   = vehicles.length
  const available  = vehicles.filter(v => v.status === 'available').length
  const onTrip     = vehicles.filter(v => v.status === 'on_trip').length
  const inShop     = vehicles.filter(v => v.status === 'in_shop').length
  const driversOn  = drivers.filter(d => d.status === 'on_trip').length
  const activeTrips = trips.filter(t => t.status === 'dispatched').length
  const revenue    = trips.filter(t => t.status === 'completed').reduce((s, t) => s + t.revenue, 0)
  const utilPct    = totalVeh ? Math.round((onTrip / totalVeh) * 100) : 0

  const kpis = [
    { label: 'Total Vehicles', value: totalVeh,   icon: Icons.truck,   footer: `${available} available` },
    { label: 'Active Trips',   value: activeTrips,icon: Icons.trip,    footer: `${driversOn} drivers on duty`, footerClass: activeTrips > 0 ? 'up' : '' },
    { label: 'Fleet Utilization', value: `${utilPct}%`, icon: Icons.dispatch, footer: `${onTrip} vehicles moving`, footerClass: utilPct > 60 ? 'up' : 'down' },
    { label: 'Revenue (Completed)', value: fmt(revenue), icon: Icons.check, footer: `${trips.filter(t=>t.status==='completed').length} trips done`, footerClass: 'up' },
    { label: 'In Maintenance', value: inShop,    icon: Icons.wrench,  footer: `${vehicles.filter(v=>v.status==='retired').length} retired` },
    { label: 'Available Drivers', value: drivers.filter(d=>d.status==='available').length, icon: Icons.driver, footer: 'Ready to dispatch', footerClass: 'up' },
  ]

  const tripsByDay = [
    { label: 'Mon', value: 3 }, { label: 'Tue', value: 5 },
    { label: 'Wed', value: 2 }, { label: 'Thu', value: 7 },
    { label: 'Fri', value: 4 }, { label: 'Sat', value: 6 },
    { label: 'Sun', value: 1 },
  ]

  const fleetSegments = [
    { label: 'Available', value: available, color: 'var(--s-green)' },
    { label: 'On Trip',   value: onTrip,   color: 'var(--s-blue)' },
    { label: 'In Shop',   value: inShop,   color: 'var(--s-amber)' },
    { label: 'Retired',   value: vehicles.filter(v=>v.status==='retired').length, color: 'var(--s-gray)' },
  ]

  const recentTrips = [...trips].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)

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
        {/* Trips This Week */}
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

        {/* Fleet Status */}
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

      {/* Live Map Section */}
      <div className="page-section" style={{ marginTop: 24 }}>
        <LiveTransitMap trips={trips} />
      </div>

      {/* Recent Trips */}
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
                {recentTrips.map(t => {
                  const v = VEHICLES_INIT.find(x => x.id === t.vehicle_id)
                  const d = DRIVERS_INIT.find(x => x.id === t.driver_id)
                  return (
                    <tr key={t.id}>
                      <td className="td-muted">#{t.id}</td>
                      <td>
                        <div className="cell-main">{t.source} → {t.destination}</div>
                        <div className="cell-sub">{t.planned_distance} km</div>
                      </td>
                      <td className="td-muted">{v?.registration_number}</td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div className="avatar">{initials(d?.name || '?')}</div>
                          {d?.name}
                        </div>
                      </td>
                      <td className="td-muted">{t.cargo_weight} kg</td>
                      <td>{fmt(t.revenue)}</td>
                      <td><Badge status={t.status} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

/* ─── VEHICLES PAGE ──────────────────────────────────────────────────────── */
function VehiclesPage({ vehicles, setVehicles }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ registration_number:'', name:'', vehicle_type:'van', max_load_capacity:'', acquisition_cost:'', region:'', status:'available', odometer:0 })

  const filtered = useMemo(() =>
    vehicles.filter(v =>
      (!search || v.name.toLowerCase().includes(search.toLowerCase()) || v.registration_number.toLowerCase().includes(search.toLowerCase())) &&
      (!statusFilter || v.status === statusFilter) &&
      (!typeFilter   || v.vehicle_type === typeFilter)
    ), [vehicles, search, statusFilter, typeFilter])

  const addVehicle = () => {
    if (!form.registration_number || !form.name) return
    setVehicles(prev => [...prev, { ...form, id: Date.now(), max_load_capacity: Number(form.max_load_capacity), acquisition_cost: Number(form.acquisition_cost), odometer: Number(form.odometer), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
    setShowAdd(false)
    setForm({ registration_number:'', name:'', vehicle_type:'van', max_load_capacity:'', acquisition_cost:'', region:'', status:'available', odometer:0 })
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
            <button className="btn btn-primary" id="submit-vehicle-btn" onClick={addVehicle}>Add Vehicle</button>
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
function DriversPage({ drivers, setDrivers }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name:'', license_number:'', license_category:'LMV', license_expiry:'', contact_number:'', safety_score:'10.0', status:'available' })

  const filtered = useMemo(() =>
    drivers.filter(d =>
      (!search || d.name.toLowerCase().includes(search.toLowerCase()) || d.license_number.toLowerCase().includes(search.toLowerCase())) &&
      (!statusFilter || d.status === statusFilter)
    ), [drivers, search, statusFilter])

  const addDriver = () => {
    if (!form.name || !form.license_number) return
    setDrivers(prev => [...prev, { ...form, id: Date.now(), safety_score: parseFloat(form.safety_score) }])
    setShowAdd(false)
    setForm({ name:'', license_number:'', license_category:'LMV', license_expiry:'', contact_number:'', safety_score:'10.0', status:'available' })
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Drivers</h1>
          <p>{drivers.length} drivers in the system</p>
        </div>
        <button className="btn btn-primary" id="add-driver-btn" onClick={() => setShowAdd(true)}>
          <Icon d={Icons.plus} size={14} /> Add Driver
        </button>
      </div>

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
                ) : filtered.map(d => {
                  const expired = new Date(d.license_expiry) < new Date()
                  return (
                    <tr key={d.id}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div className="avatar">{initials(d.name)}</div>
                          <div className="cell-main">{d.name}</div>
                        </div>
                      </td>
                      <td className="td-muted" style={{ fontFamily:'monospace', fontSize:12 }}>{d.license_number}</td>
                      <td className="td-muted">{d.license_category}</td>
                      <td>
                        <span style={{ color: expired ? 'var(--s-red)' : 'var(--text-secondary)', fontSize:12 }}>
                          {d.license_expiry}
                          {expired && ' ⚠'}
                        </span>
                      </td>
                      <td className="td-muted">{d.contact_number}</td>
                      <td><ScoreBadge val={d.safety_score} /></td>
                      <td><Badge status={d.status} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAdd && (
        <Modal title="Add Driver" onClose={() => setShowAdd(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn btn-primary" id="submit-driver-btn" onClick={addDriver}>Add Driver</button>
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
function TripsPage({ trips, setTrips, vehicles, drivers }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showDispatch, setShowDispatch] = useState(false)
  const [form, setForm] = useState({ vehicle_id:'', driver_id:'', source:'', destination:'', cargo_weight:'', planned_distance:'', revenue:'' })
  const [error, setError] = useState('')

  const filtered = useMemo(() =>
    trips.filter(t =>
      (!search || t.source.toLowerCase().includes(search.toLowerCase()) || t.destination.toLowerCase().includes(search.toLowerCase())) &&
      (!statusFilter || t.status === statusFilter)
    ), [trips, search, statusFilter])

  const availVehicles = vehicles.filter(v => v.status === 'available')
  const availDrivers  = drivers.filter(d => d.status === 'available')

  const dispatchTrip = () => {
    setError('')
    const v = vehicles.find(x => x.id === Number(form.vehicle_id))
    const d = drivers.find(x => x.id === Number(form.driver_id))
    if (!v || !d || !form.source || !form.destination) { setError('Fill all required fields.'); return }
    if (Number(form.cargo_weight) > v.max_load_capacity) { setError(`Cargo weight exceeds vehicle capacity of ${v.max_load_capacity} kg.`); return }

    const newTrip = {
      id: Date.now(), vehicle_id: Number(form.vehicle_id), driver_id: Number(form.driver_id),
      source: form.source, destination: form.destination,
      cargo_weight: Number(form.cargo_weight), planned_distance: Number(form.planned_distance),
      revenue: Number(form.revenue), status: 'dispatched',
      created_at: new Date().toISOString().slice(0, 10)
    }
    setTrips(prev => [newTrip, ...prev])
    // Update vehicle & driver status
    setShowDispatch(false)
    setForm({ vehicle_id:'', driver_id:'', source:'', destination:'', cargo_weight:'', planned_distance:'', revenue:'' })
  }

  const completeTrip = id => setTrips(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' } : t))
  const cancelTrip   = id => setTrips(prev => prev.map(t => t.id === id ? { ...t, status: 'cancelled' } : t))

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Trips</h1>
          <p>{trips.filter(t => t.status === 'dispatched').length} active · {trips.filter(t => t.status === 'draft').length} pending</p>
        </div>
        <button className="btn btn-primary" id="dispatch-trip-btn" onClick={() => setShowDispatch(true)}>
          <Icon d={Icons.dispatch} size={14} /> Dispatch Trip
        </button>
      </div>

      <div className="page-section">
        <div className="filters-bar" style={{ marginBottom: 16 }}>
          <div className="search-wrap">
            <span className="search-icon"><Icon d={Icons.search} size={13} /></span>
            <input className="search-input" placeholder="Search by route…" value={search} onChange={e => setSearch(e.target.value)} />
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
                  <th>Cargo</th><th>Revenue</th><th>Date</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9}>
                    <div className="empty-state">
                      <div className="empty-icon"><Icon d={Icons.trip} size={28} /></div>
                      <div className="empty-title">No trips found</div>
                      <div className="empty-desc">Dispatch a new trip to get started</div>
                    </div>
                  </td></tr>
                ) : filtered.map(t => {
                  const v = vehicles.find(x => x.id === t.vehicle_id)
                  const d = drivers.find(x => x.id === t.driver_id)
                  return (
                    <tr key={t.id}>
                      <td className="td-muted">#{t.id.toString().slice(-4)}</td>
                      <td>
                        <div className="cell-main">{t.source} → {t.destination}</div>
                        <div className="cell-sub">{t.planned_distance} km</div>
                      </td>
                      <td className="td-muted" style={{ fontSize:12 }}>{v?.registration_number || '—'}</td>
                      <td>
                        {d ? (
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div className="avatar">{initials(d.name)}</div>
                            <span style={{ fontSize:13 }}>{d.name}</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="td-muted">{t.cargo_weight} kg</td>
                      <td>{t.revenue ? fmt(t.revenue) : '—'}</td>
                      <td className="td-muted">{t.created_at}</td>
                      <td><Badge status={t.status} /></td>
                      <td>
                        <div className="action-cell">
                          {t.status === 'dispatched' && (
                            <>
                              <button className="btn btn-ghost btn-sm" id={`complete-${t.id}`} onClick={() => completeTrip(t.id)} title="Complete">
                                <Icon d={Icons.complete} size={12} />
                              </button>
                              <button className="btn btn-danger btn-sm" id={`cancel-${t.id}`} onClick={() => cancelTrip(t.id)} title="Cancel">
                                <Icon d={Icons.cancel} size={12} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showDispatch && (
        <Modal title="Dispatch Trip" onClose={() => { setShowDispatch(false); setError('') }}
          footer={<>
            <button className="btn btn-ghost" onClick={() => { setShowDispatch(false); setError('') }}>Cancel</button>
            <button className="btn btn-primary" id="submit-dispatch-btn" onClick={dispatchTrip}>
              <Icon d={Icons.dispatch} size={13} /> Dispatch
            </button>
          </>}>
          {error && (
            <div style={{ background:'var(--s-red-bg)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:'var(--r-md)', padding:'10px 14px', color:'var(--s-red)', fontSize:13, marginBottom:16, display:'flex', gap:8 }}>
              <Icon d={Icons.alert} size={14} />{error}
            </div>
          )}
          <div className="form-grid">
            <div className="form-group span-2">
              <label>Vehicle <span style={{ color:'var(--s-green)', marginLeft:4 }}>({availVehicles.length} available)</span></label>
              <select className="form-select-full" value={form.vehicle_id} onChange={e => setForm(f => ({...f, vehicle_id: e.target.value}))}>
                <option value="">Select vehicle…</option>
                {availVehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} — {v.name} ({v.max_load_capacity}kg cap.)</option>)}
              </select>
            </div>
            <div className="form-group span-2">
              <label>Driver <span style={{ color:'var(--s-green)', marginLeft:4 }}>({availDrivers.length} available)</span></label>
              <select className="form-select-full" value={form.driver_id} onChange={e => setForm(f => ({...f, driver_id: e.target.value}))}>
                <option value="">Select driver…</option>
                {availDrivers.map(d => <option key={d.id} value={d.id}>{d.name} — Score: {d.safety_score}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Source</label>
              <input className="form-input" placeholder="Origin city" value={form.source} onChange={e => setForm(f => ({...f, source: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Destination</label>
              <input className="form-input" placeholder="Destination city" value={form.destination} onChange={e => setForm(f => ({...f, destination: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Cargo Weight (kg)</label>
              <input className="form-input" type="number" placeholder="500" value={form.cargo_weight} onChange={e => setForm(f => ({...f, cargo_weight: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Planned Distance (km)</label>
              <input className="form-input" type="number" placeholder="350" value={form.planned_distance} onChange={e => setForm(f => ({...f, planned_distance: e.target.value}))} />
            </div>
            <div className="form-group span-2">
              <label>Revenue (₹)</label>
              <input className="form-input" type="number" placeholder="15000" value={form.revenue} onChange={e => setForm(f => ({...f, revenue: e.target.value}))} />
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

/* ─── PLACEHOLDER PAGES ──────────────────────────────────────────────────── */
function PlaceholderPage({ title, icon, desc }) {
  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>{title}</h1>
          <p>{desc}</p>
        </div>
      </div>
      <div className="page-section">
        <div className="card">
          <div className="empty-state" style={{ padding: 64 }}>
            <div className="empty-icon"><Icon d={icon} size={40} /></div>
            <div className="empty-title">{title} module</div>
            <div className="empty-desc">This section will be implemented by the backend team and linked here.</div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ─── APP ROOT ───────────────────────────────────────────────────────────── */
export default function App() {
  const [view,     setView]     = useState('landing')
  const [page,     setPage]     = useState('dashboard')
  const [vehicles, setVehicles] = useState(VEHICLES_INIT)
  const [drivers,  setDrivers]  = useState(DRIVERS_INIT)
  const [trips,    setTrips]    = useState(TRIPS_INIT)

  // Show landing page first
  if (view === 'landing') {
    return <LandingPage onEnter={() => setView('app')} />
  }

  const renderPage = () => {
    switch(page) {
      case 'dashboard':   return <DashboardPage vehicles={vehicles} drivers={drivers} trips={trips} />
      case 'vehicles':    return <VehiclesPage vehicles={vehicles} setVehicles={setVehicles} />
      case 'drivers':     return <DriversPage drivers={drivers} setDrivers={setDrivers} />
      case 'trips':       return <TripsPage trips={trips} setTrips={setTrips} vehicles={vehicles} drivers={drivers} />
      case 'fueling':     return <PlaceholderPage title="Fueling" icon={Icons.fuel} desc="Fuel logs and consumption tracking" />
      case 'maintenance': return <PlaceholderPage title="Maintenance" icon={Icons.wrench} desc="Scheduled and unscheduled maintenance records" />
      default:            return <DashboardPage vehicles={vehicles} drivers={drivers} trips={trips} />
    }
  }

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  )
}
