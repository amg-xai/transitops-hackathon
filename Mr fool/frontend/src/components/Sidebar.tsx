import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import LogoImage from '../assets/logo.png';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  isCollapsed, 
  setIsCollapsed 
}: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'inspector', label: 'Vehicle Inspector', icon: Truck },
    { id: 'drivers', label: 'Driver Safety', icon: Users },
    { id: 'roi', label: 'Executive ROI', icon: TrendingUp },
  ];

  return (
    <motion.div
      animate={{ width: isCollapsed ? 72 : 260 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="h-screen glass flex flex-col justify-between p-4 relative z-30 select-none"
    >
      <div>
        {/* Logo Section */}
        <div className="flex items-center justify-center py-4 border-b border-white/5 overflow-hidden">
          {isCollapsed ? (
            <img src={LogoImage} className="w-8 h-8 object-contain" alt="TransitOps" />
          ) : (
            <img src={LogoImage} className="h-9 w-auto object-contain" alt="TransitOps" />
          )}
        </div>

        {/* Menu Navigation */}
        <div className="mt-8 flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all relative overflow-hidden ${
                  isActive 
                    ? 'text-text-primary' 
                    : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute inset-0 bg-accent/20 border-l-2 border-accent"
                    transition={{ type: 'spring', stiffness: 250, damping: 25 }}
                  />
                )}
                <Icon className={`w-5 h-5 flex-shrink-0 z-10 ${isActive ? 'text-accent' : ''}`} />
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium text-sm z-10"
                  >
                    {item.label}
                  </motion.span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Collapse Toggle Footer */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-4 p-3 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/5 transition-all w-full text-left"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!isCollapsed && <span className="text-sm font-medium">Collapse Menu</span>}
        </button>
      </div>
    </motion.div>
  );
};
