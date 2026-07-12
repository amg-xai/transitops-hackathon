import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ChevronUp, Download } from 'lucide-react';

const financialData = [
  { month: 'Jan', revenue: 42000, cost: 28000, profit: 14000 },
  { month: 'Feb', revenue: 54000, cost: 31000, profit: 23000 },
  { month: 'Mar', revenue: 68000, cost: 36000, profit: 32000 },
  { month: 'Apr', revenue: 61000, cost: 34000, profit: 27000 },
  { month: 'May', revenue: 78000, cost: 39000, profit: 39000 },
  { month: 'Jun', revenue: 95000, cost: 42000, profit: 53000 },
];

const expenseBreakdown = [
  { name: 'Fuel', value: 45000, color: '#2563EB' },
  { name: 'Maintenance', value: 24000, color: '#EF4444' },
  { name: 'Tolls & Fees', value: 12000, color: '#F59E0B' },
  { name: 'Others', value: 6000, color: '#1F2937' },
];

export const ExecutiveROI = () => {
  return (
    <div className="p-6 flex flex-col gap-6 h-[calc(100vh-64px)] overflow-y-auto select-none">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Executive ROI & Financial Analytics</h1>
          <p className="text-text-muted text-sm mt-1">Operational cost breakdowns, margin growth indicators, and capital ROI trends.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 hover:border-white/10 text-xs font-semibold rounded-xl text-text-primary transition-all cursor-pointer">
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-2xl border border-white/5 text-left">
          <span className="text-xs font-semibold text-text-muted uppercase">Operational Return</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-text-primary">₹3.98L</span>
            <span className="text-xs font-semibold text-success flex items-center gap-0.5">
              <ChevronUp className="w-3.5 h-3.5" /> +14.2%
            </span>
          </div>
          <span className="text-[10px] text-text-muted mt-1 block">Net operating margin for this quarter</span>
        </div>

        <div className="glass p-5 rounded-2xl border border-white/5 text-left">
          <span className="text-xs font-semibold text-text-muted uppercase">Capital ROI Rate</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-text-primary">28.4%</span>
            <span className="text-xs font-semibold text-success flex items-center gap-0.5">
              <ChevronUp className="w-3.5 h-3.5" /> +4.1%
            </span>
          </div>
          <span className="text-[10px] text-text-muted mt-1 block">Average annualized return across assets</span>
        </div>

        <div className="glass p-5 rounded-2xl border border-white/5 text-left">
          <span className="text-xs font-semibold text-text-muted uppercase">Operating Ratio</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-text-primary">44.2%</span>
            <span className="text-xs font-semibold text-success flex items-center gap-0.5">
              <ChevronUp className="w-3.5 h-3.5" /> -2.8%
            </span>
          </div>
          <span className="text-[10px] text-text-muted mt-1 block">Lower operating cost percentage ratio</span>
        </div>
      </div>

      {/* Main Financial Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Margin Trend Chart */}
        <div className="lg:col-span-2 glass p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
          <span className="text-xs font-semibold text-text-muted block text-left uppercase mb-4">Profitability & Cost Trends</span>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                  labelStyle={{ color: '#F9FAFB', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="profit" stroke="#22C55E" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" name="Net Profit" />
                <Area type="monotone" dataKey="cost" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" name="Operational Cost" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses Cost Pie Chart */}
        <div className="glass p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
          <span className="text-xs font-semibold text-text-muted block text-left uppercase mb-4">Expense Allocations</span>
          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute flex flex-col items-center">
              <span className="text-[10px] text-text-muted uppercase font-semibold">Total Bills</span>
              <span className="text-xl font-bold text-text-primary">₹87K</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            {expenseBreakdown.map((entry, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-text-muted font-medium">{entry.name}</span>
                </div>
                <span className="font-bold text-text-primary">₹{entry.value / 1000}K</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
