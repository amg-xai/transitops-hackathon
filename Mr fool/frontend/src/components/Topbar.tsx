import React from 'react';
import { Search, Bell, Sparkles, User } from 'lucide-react';

interface TopbarProps {
  onSearchChange?: (val: string) => void;
  openAIAssistant: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onSearchChange, openAIAssistant }) => {
  return (
    <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between z-20">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Command search..."
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/5 focus:border-accent/40 focus:bg-white/10 outline-none text-sm text-text-primary placeholder:text-text-muted transition-all"
        />
      </div>

      {/* Action Utilities */}
      <div className="flex items-center gap-4">
        {/* AI Assistant Glow Button */}
        <button 
          onClick={openAIAssistant}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-all font-medium text-xs shadow-lg shadow-accent/10 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Fleet AI</span>
        </button>

        {/* Notifications Button */}
        <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-text-primary hover:bg-white/10 transition-all relative">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-danger shadow-md shadow-danger/50" />
        </button>

        <div className="w-px h-6 bg-white/10" />

        {/* Profile Card */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-elevated border border-white/10 flex items-center justify-center">
            <User className="w-5 h-5 text-text-primary" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-text-primary leading-tight">Fiona Fleet</span>
            <span className="text-[10px] text-text-muted leading-tight">Fleet Manager</span>
          </div>
        </div>
      </div>
    </div>
  );
};
