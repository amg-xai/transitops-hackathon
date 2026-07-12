import { useState } from 'react';
import { ShieldCheck, ShieldAlert, Award } from 'lucide-react';

export const DriverSafety = () => {
  const [selectedDriver, setSelectedDriver] = useState<number>(1);

  const driversList = [
    { id: 1, name: 'Rohan Deshmukh', score: 9.6, status: 'Active', trips: 142, rating: 'Excellent' },
    { id: 2, name: 'Amit Singh', score: 8.8, status: 'Active', trips: 110, rating: 'Good' },
    { id: 3, name: 'Sanjay Dutt', score: 7.2, status: 'Active', trips: 96, rating: 'Warning' },
    { id: 4, name: 'Ravi Sharma', score: 5.4, status: 'Suspended', trips: 80, rating: 'Critical' },
  ];

  const driverStats: Record<number, {
    avatar: string;
    speedScore: number;
    brakingScore: number;
    idleTime: string;
    licenseExpiry: string;
    warnings: string[];
    achievements: string[];
  }> = {
    1: {
      avatar: 'RD',
      speedScore: 98,
      brakingScore: 95,
      idleTime: '4%',
      licenseExpiry: '14 Dec 2028',
      warnings: [],
      achievements: ['Eco-Driver of the Month', '10,000+ Safe Kilometers']
    },
    2: {
      avatar: 'AS',
      speedScore: 90,
      brakingScore: 86,
      idleTime: '8%',
      licenseExpiry: '20 Oct 2027',
      warnings: ['Harsh acceleration on highway NH8'],
      achievements: ['On-Time Champion']
    },
    3: {
      avatar: 'SD',
      speedScore: 78,
      brakingScore: 68,
      idleTime: '12%',
      licenseExpiry: '04 Mar 2027',
      warnings: ['Frequent hard braking incidents', 'Idling exceeds 10% limit'],
      achievements: []
    },
    4: {
      avatar: 'RS',
      speedScore: 50,
      brakingScore: 42,
      idleTime: '18%',
      licenseExpiry: 'Expired (10 Jun 2026)',
      warnings: ['License validity expired', 'Multiple speeding alerts'],
      achievements: []
    }
  };

  const currentStats = driverStats[selectedDriver];
  const activeDriverInfo = driversList.find(d => d.id === selectedDriver)!;

  // Mock GitHub-style weekly activity matrix (Heatmap)
  const heatmapWeeks = Array.from({ length: 24 }, () => 
    Array.from({ length: 7 }, () => Math.floor(Math.random() * 4))
  );

  return (
    <div className="p-6 flex flex-col gap-6 h-[calc(100vh-64px)] overflow-y-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Driver Performance & Safety Hub</h1>
        <p className="text-text-muted text-sm mt-1">Monitor safety scores, harsh braking logs, and license compliance statuses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
        {/* Drivers List Table Column */}
        <div className="lg:col-span-1 glass p-5 rounded-2xl border border-white/5 flex flex-col gap-4">
          <span className="text-xs font-semibold text-text-muted px-1 uppercase tracking-wider">Active Operators</span>
          <div className="flex flex-col gap-2">
            {driversList.map((driver) => (
              <button
                key={driver.id}
                onClick={() => setSelectedDriver(driver.id)}
                className={`p-4 rounded-xl border flex items-center justify-between transition-all text-left ${
                  selectedDriver === driver.id
                    ? 'bg-accent/15 border-accent text-text-primary'
                    : 'bg-white/5 border-white/5 text-text-muted hover:border-white/10 hover:text-text-primary'
                }`}
              >
                <div>
                  <h4 className="font-semibold text-sm">{driver.name}</h4>
                  <span className="text-[10px] text-text-muted block mt-0.5">Trips: {driver.trips}</span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold block ${
                    driver.score >= 9.0 ? 'text-success' : driver.score >= 7.0 ? 'text-warning' : 'text-danger'
                  }`}>
                    {driver.score}/10
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-text-muted block mt-0.5">{driver.rating}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Driver Details & Metrics Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-6 items-center">
            {/* Initial Circle */}
            <div className="w-20 h-20 rounded-full bg-accent/25 border border-accent flex items-center justify-center text-accent text-2xl font-bold">
              {currentStats.avatar}
            </div>

            {/* Profile Overview */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <h3 className="font-bold text-xl text-text-primary">{activeDriverInfo.name}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                  activeDriverInfo.score >= 9.0 
                    ? 'bg-success/15 border border-success/30 text-success' 
                    : activeDriverInfo.score >= 7.0
                    ? 'bg-warning/15 border border-warning/30 text-warning'
                    : 'bg-danger/15 border border-danger/30 text-danger'
                }`}>
                  {activeDriverInfo.rating} Rating
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="border-r border-white/5 pr-4 text-center md:text-left">
                  <span className="text-[10px] text-text-muted block uppercase">Speed Control</span>
                  <span className="text-lg font-bold text-text-primary">{currentStats.speedScore}%</span>
                </div>
                <div className="border-r border-white/5 pr-4 text-center md:text-left">
                  <span className="text-[10px] text-text-muted block uppercase">Smooth Braking</span>
                  <span className="text-lg font-bold text-text-primary">{currentStats.brakingScore}%</span>
                </div>
                <div className="border-r border-white/5 pr-4 text-center md:text-left">
                  <span className="text-[10px] text-text-muted block uppercase">Engine Idling</span>
                  <span className="text-lg font-bold text-text-primary">{currentStats.idleTime}</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="text-[10px] text-text-muted block uppercase">License Expiration</span>
                  <span className={`text-xs font-semibold ${
                    activeDriverInfo.status === 'Suspended' ? 'text-danger' : 'text-text-primary'
                  }`}>
                    {currentStats.licenseExpiry}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Heatmap Grid */}
          <div className="glass p-5 rounded-2xl border border-white/5 text-left">
            <span className="text-xs font-semibold text-text-muted block mb-3 uppercase tracking-wider">Weekly Duty Heatmap</span>
            <div className="flex gap-1 overflow-x-auto pb-2">
              {heatmapWeeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((cell, cIdx) => (
                    <div
                      key={cIdx}
                      className={`w-3.5 h-3.5 rounded-sm transition-all ${
                        cell === 0 
                          ? 'bg-white/5' 
                          : cell === 1 
                          ? 'bg-accent/20' 
                          : cell === 2 
                          ? 'bg-accent/50' 
                          : 'bg-accent shadow-md shadow-accent/20'
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-2 text-[10px] text-text-muted">
              <span>Less</span>
              <div className="w-2.5 h-2.5 rounded-sm bg-white/5" />
              <div className="w-2.5 h-2.5 rounded-sm bg-accent/20" />
              <div className="w-2.5 h-2.5 rounded-sm bg-accent/50" />
              <div className="w-2.5 h-2.5 rounded-sm bg-accent" />
              <span>More</span>
            </div>
          </div>

          {/* Warnings & Accomplishments List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Warnings Alert Box */}
            <div className="glass p-5 rounded-2xl border border-white/5 text-left">
              <span className="text-xs font-semibold text-text-muted block mb-3 uppercase tracking-wider">Active Anomalies</span>
              {currentStats.warnings.length === 0 ? (
                <div className="flex items-center gap-2 text-success text-sm py-2">
                  <ShieldCheck className="w-5 h-5 text-success" />
                  <span>No safety violations logged.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {currentStats.warnings.map((warn, i) => (
                    <div key={i} className="flex gap-2.5 items-start p-2.5 rounded-lg bg-danger/10 border border-danger/20 text-xs text-danger leading-tight">
                      <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Achievements Box */}
            <div className="glass p-5 rounded-2xl border border-white/5 text-left">
              <span className="text-xs font-semibold text-text-muted block mb-3 uppercase tracking-wider">Achievements</span>
              {currentStats.achievements.length === 0 ? (
                <span className="text-xs text-text-muted py-2 block">No active performance badges.</span>
              ) : (
                <div className="flex flex-col gap-2">
                  {currentStats.achievements.map((ach, i) => (
                    <div key={i} className="flex gap-2.5 items-center p-2 rounded-lg bg-success/15 border border-success/30 text-xs text-success font-semibold">
                      <Award className="w-4 h-4 text-success flex-shrink-0" />
                      <span>{ach}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
