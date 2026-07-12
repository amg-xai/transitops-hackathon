import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Truck, 
  Users, 
  Activity, 
  DollarSign, 
  Wrench, 
  Fuel,
  Sparkles,
  MapPin
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { MapboxTelemetry } from './MapboxTelemetry';

// Seed mock data for sparkline charts
const sparkData = [
  { val: 65 }, { val: 78 }, { val: 72 }, { val: 89 }, { val: 85 }, { val: 94 }, { val: 92 }
];
const costData = [
  { val: 120 }, { val: 95 }, { val: 110 }, { val: 80 }, { val: 90 }, { val: 65 }, { val: 58 }
];

export const FleetCommandCenter = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [showWeather, setShowWeather] = useState(false);
  const [mapType, setMapType] = useState<'vector' | 'mapbox'>('vector');

  const kpis = [
    { 
      title: 'Fleet Utilization', 
      val: '94.2%', 
      change: '+2.4%', 
      isUp: true, 
      icon: Activity, 
      color: 'text-success', 
      bg: 'bg-success/10',
      data: sparkData
    },
    { 
      title: 'Active Vehicles', 
      val: '42 / 48', 
      change: '+4 active', 
      isUp: true, 
      icon: Truck, 
      color: 'text-accent', 
      bg: 'bg-accent/10',
      data: sparkData
    },
    { 
      title: 'Gross Revenue', 
      val: '₹4.85L', 
      change: '+12.8%', 
      isUp: true, 
      icon: DollarSign, 
      color: 'text-success', 
      bg: 'bg-success/10',
      data: sparkData
    },
    { 
      title: 'Maintenance Alert', 
      val: '3 Due', 
      change: '-2 resolved', 
      isUp: false, 
      icon: Wrench, 
      color: 'text-danger', 
      bg: 'bg-danger/10',
      data: costData
    },
    { 
      title: 'Fuel Efficiency', 
      val: '5.8 km/L', 
      change: '-0.2 km/L', 
      isUp: false, 
      icon: Fuel, 
      color: 'text-warning', 
      bg: 'bg-warning/10',
      data: costData
    },
    { 
      title: 'Active Drivers', 
      val: '38 / 40', 
      change: '95% duty', 
      isUp: true, 
      icon: Users, 
      color: 'text-accent', 
      bg: 'bg-accent/10',
      data: sparkData
    }
  ];

  return (
    <div className="p-6 flex flex-col gap-6 h-[calc(100vh-64px)] overflow-y-auto select-none">
      {/* Page Title Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Fleet Command Center</h1>
          <p className="text-text-muted text-sm mt-1">Real-time logistics control, AI insights feed, and digital twin routing.</p>
        </div>
        <div className="flex gap-2">
          {['all', 'West', 'South', 'North'].map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-4 py-2 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                selectedRegion === reg
                  ? 'bg-accent/15 border-accent text-accent'
                  : 'bg-white/5 border-white/5 text-text-muted hover:border-white/10 hover:text-text-primary'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className="glass p-4 rounded-2xl flex flex-col justify-between h-36 border border-white/5 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted">{kpi.title}</span>
                <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>

              <div className="my-2">
                <span className="text-xl font-bold text-text-primary">{kpi.val}</span>
                <div className="flex items-center gap-1 mt-1 text-[10px]">
                  {kpi.isUp ? (
                    <TrendingUp className="w-3.5 h-3.5 text-success" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-danger" />
                  )}
                  <span className={kpi.isUp ? 'text-success font-medium' : 'text-danger font-medium'}>
                    {kpi.change}
                  </span>
                  <span className="text-text-muted">vs last week</span>
                </div>
              </div>

              {/* Sparkline Graph */}
              <div className="h-10 w-full absolute bottom-0 left-0 right-0 opacity-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={kpi.data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={kpi.isUp ? '#22C55E' : '#EF4444'} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={kpi.isUp ? '#22C55E' : '#EF4444'} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="val" 
                      stroke={kpi.isUp ? '#22C55E' : '#EF4444'} 
                      strokeWidth={1.5}
                      fillOpacity={1} 
                      fill={`url(#grad-${idx})`} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Map & Live Feed Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1 min-h-[450px]">
        {/* Dynamic Telemetry Map (Palantir Aesthetic) */}
        <div className="xl:col-span-3 glass rounded-2xl p-5 border border-white/5 flex flex-col justify-between relative overflow-hidden h-[500px] xl:h-auto">
          <div className="flex items-center justify-between z-10">
            <span className="text-sm font-bold text-text-primary flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent" />
              Live Telemetry Operations Map
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setMapType(mapType === 'vector' ? 'mapbox' : 'vector')}
                className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  mapType === 'mapbox' ? 'bg-accent/15 border-accent text-accent' : 'bg-white/5 border-white/5 text-text-muted hover:border-white/10 hover:text-text-primary'
                }`}
              >
                {mapType === 'mapbox' ? 'Vector Map' : 'Mapbox Sat'}
              </button>
              <button 
                onClick={() => setShowWeather(!showWeather)}
                className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  showWeather ? 'bg-warning/15 border-warning text-warning' : 'bg-white/5 border-white/5 text-text-muted hover:border-white/10 hover:text-text-primary'
                }`}
              >
                Weather Radar
              </button>
            </div>
          </div>

          {/* Map Display Panel */}
          <div className="flex-1 w-full flex items-center justify-center relative my-4 min-h-[300px]">
            {mapType === 'mapbox' ? (
              <MapboxTelemetry />
            ) : (
              <svg viewBox="0 0 800 400" className="w-full h-full opacity-60">
                {/* Background Network Nodes */}
                <circle cx="150" cy="120" r="4" fill="#3b82f6" className="animate-ping" />
                <circle cx="150" cy="120" r="3" fill="#3b82f6" />
                <text x="140" y="105" fill="#94a3b8" fontSize="10" fontWeight="bold">PUNE HUB</text>

                <circle cx="450" cy="180" r="3" fill="#475569" />
                <text x="440" y="200" fill="#64748b" fontSize="10">DELHI HUB</text>

                <circle cx="320" cy="280" r="4" fill="#22c55e" className="animate-ping" />
                <circle cx="320" cy="280" r="3" fill="#22c55e" />
                <text x="310" y="265" fill="#94a3b8" fontSize="10" fontWeight="bold">MUMBAI PORT</text>

                <circle cx="600" cy="100" r="3" fill="#475569" />
                <text x="590" y="85" fill="#64748b" fontSize="10">KOLKATA DEPOT</text>

                <circle cx="500" cy="320" r="4" fill="#3b82f6" className="animate-ping" />
                <circle cx="500" cy="320" r="3" fill="#3b82f6" />
                <text x="490" y="340" fill="#94a3b8" fontSize="10" fontWeight="bold">BANGALORE HQ</text>

                {/* Active Route Path Lines */}
                <path d="M150,120 Q235,200 320,280" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" className="animate-[dash_10s_linear_infinite]" />
                <path d="M320,280 Q410,300 500,320" fill="none" stroke="#22c55e" strokeWidth="2" />
                <path d="M150,120 Q375,110 600,100" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="3,3" />

                {/* Moving Vehicle Icons */}
                <g className="animate-[bounce_2s_infinite]">
                  <circle cx="230" cy="178" r="6" fill="#3b82f6" />
                  <circle cx="230" cy="178" r="10" fill="none" stroke="#3b82f6" strokeWidth="1" className="animate-ping" />
                </g>
                
                <g className="animate-[bounce_3s_infinite]">
                  <circle cx="410" cy="300" r="6" fill="#22c55e" />
                  <circle cx="410" cy="300" r="10" fill="none" stroke="#22c55e" strokeWidth="1" className="animate-ping" />
                </g>

                {/* Weather Overlay Radar Glow */}
                {showWeather && (
                  <path d="M100,50 Q200,80 300,40 Q400,60 500,50" fill="rgba(245, 158, 11, 0.08)" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="8" className="animate-pulse" />
                )}
              </svg>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs text-text-muted">
            <span>Map scale optimized for national highway routers</span>
            <span className="flex items-center gap-1.5 text-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Telemetry Sync: Active
            </span>
          </div>
        </div>

        {/* AI Insight Feed Sidebar */}
        <div className="glass rounded-2xl p-5 border border-white/5 flex flex-col justify-between h-[500px] xl:h-auto">
          <div>
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-accent" />
              Fleet AI Intelligence Feed
            </h3>

            <div className="flex flex-col gap-3 overflow-y-auto max-h-[360px] pr-1">
              <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-danger">Predictive Maintenance</span>
                  <span className="text-[9px] bg-danger/20 text-danger px-1.5 py-0.5 rounded-full font-bold">92% Prob</span>
                </div>
                <p className="text-[11px] text-danger/90 leading-tight">
                  Truck MH-04-CD-5678 has a 92% probability of brake pad failure within 12 days based on vibration metrics.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-warning/10 border border-warning/20 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-warning">Compliance Alert</span>
                  <span className="text-[9px] bg-warning/20 text-warning px-1.5 py-0.5 rounded-full font-bold">Expires</span>
                </div>
                <p className="text-[11px] text-warning/90 leading-tight">
                  Driver license for Ravi Sharma is expired. System has blocked active trip dispatch.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-accent">Route Recommendation</span>
                  <span className="text-[9px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full font-bold">Save 40m</span>
                </div>
                <p className="text-[11px] text-accent/90 leading-tight">
                  NH48 congestion detected near Lonavala. Rerouting Trip #12 to bypass route will save 12L fuel.
                </p>
              </div>
            </div>
          </div>

          <button className="w-full mt-4 py-2.5 rounded-xl bg-accent text-xs font-semibold text-text-primary hover:bg-accent/80 transition-all cursor-pointer">
            Run AI Fleet Optimization
          </button>
        </div>
      </div>
    </div>
  );
};
