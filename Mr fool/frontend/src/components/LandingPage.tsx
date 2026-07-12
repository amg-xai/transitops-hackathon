import { LogisticsCity3D } from './LogisticsCity3D';
import LogoImage from '../assets/logo.png';
import { Shield, MapPin, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="w-screen h-screen bg-background relative overflow-hidden flex flex-col md:flex-row select-none">
      {/* Left Column: Premium Brand Intro */}
      <div className="w-full md:w-[450px] lg:w-[500px] h-full flex flex-col justify-between p-8 md:p-12 z-20 relative glass border-r border-white/5 shadow-2xl flex-shrink-0">
        {/* Top brand logo */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <img src={LogoImage} className="h-10 w-auto object-contain" alt="TransitOps Logo" />
        </motion.div>

        {/* Center Headline */}
        <div className="my-auto flex flex-col gap-6 text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="text-3.5xl lg:text-4.5xl font-extrabold tracking-tight leading-tight text-text-primary">
              Intelligent <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#b4c5ff]">
                Logistics OS
              </span>
            </h1>
            <p className="text-sm text-text-muted mt-3 leading-relaxed">
              Experience the next generation command and control system. High-performance asset telemetry built for Amazon Logistics, SpaceX, and Tesla Fleet.
            </p>
          </motion.div>

          {/* Quick Pillar Cards */}
          <div className="flex flex-col gap-3">
            {[
              { icon: Shield, title: 'Autonomous Compliance', desc: 'Auto-checks license expiry & document validity.' },
              { icon: MapPin, title: 'Tactical Routing', desc: 'Real-time telemetry maps with congestion bypass.' },
              { icon: Zap, title: 'Predictive Diagnostics', desc: 'Brakes & engine failure notifications.' }
            ].map((p, idx) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                  className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0 text-accent">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-text-primary">{p.title}</span>
                    <span className="text-[10px] text-text-muted mt-0.5 leading-snug">{p.desc}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Enter Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onEnter}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-accent text-sm font-bold text-text-primary hover:bg-accent/80 transition-all cursor-pointer shadow-lg shadow-accent/25"
          >
            <span>Enter Command Hub</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Footer Credit */}
        <div className="text-[10px] text-text-muted text-left border-t border-white/5 pt-4">
          <span>TransitOps v1.2 — Designed by Quartz Core Developers</span>
        </div>
      </div>

      {/* Right Column: 3D Logistics City Canvas Background */}
      <div className="flex-1 h-full relative z-10 bg-black/40">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent z-20 pointer-events-none" />
        <LogisticsCity3D />
      </div>
    </div>
  );
};
