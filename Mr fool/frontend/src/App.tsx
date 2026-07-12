import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { FleetCommandCenter } from './components/FleetCommandCenter';
import { VehicleInspector3D } from './components/VehicleInspector3D';
import { DriverSafety } from './components/DriverSafety';
import { ExecutiveROI } from './components/ExecutiveROI';
import { LandingPage } from './components/LandingPage';
import { Sparkles, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Message = { sender: 'user' | 'ai'; text: string };

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isAIOpen, setIsAIOpen] = useState<boolean>(false);
  const [aiMessage, setAiMessage] = useState<string>('');
  const [chatLog, setChatLog] = useState<Message[]>([
    { sender: 'ai', text: "Hello! I am your Fleet Command Assistant. Ask me about vehicle health predictions, route rerouting, or driver scores." }
  ]);

  const handleSendAIMessage = () => {
    if (!aiMessage.trim()) return;
    const nextLog: Message[] = [...chatLog, { sender: 'user', text: aiMessage }];
    setChatLog(nextLog);
    setAiMessage('');

    // Mock intelligent logistics response
    setTimeout(() => {
      let reply = "I am processing your fleet query.";
      if (aiMessage.toLowerCase().includes('truck') || aiMessage.toLowerCase().includes('health')) {
        reply = "Brake diagnostics on Truck MH-04-CD-5678 indicate 78% wear. A replacement ticket is recommended before dispatch.";
      } else if (aiMessage.toLowerCase().includes('driver') || aiMessage.toLowerCase().includes('score')) {
        reply = "Rohan Deshmukh leads the safety ratings with 9.6/10. Ravi Sharma's license has expired, triggering a temporary suspension.";
      } else if (aiMessage.toLowerCase().includes('route') || aiMessage.toLowerCase().includes('fuel')) {
        reply = "Optimizing route Pune-to-Mumbai. Rerouting via Expressway bypass will save approximately 12L of fuel and 40 minutes of delay.";
      }
      setChatLog(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 800);
  };

  if (!isLoggedIn) {
    return <LandingPage onEnter={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="flex bg-background min-h-screen text-text-primary overflow-hidden relative font-sans">
      {/* Dynamic Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Topbar 
          onSearchChange={(val) => console.log('Searching:', val)}
          openAIAssistant={() => setIsAIOpen(true)}
        />
        
        {/* Workspace Display Grid */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="h-full"
              >
                <FleetCommandCenter />
              </motion.div>
            )}

            {activeTab === 'inspector' && (
              <motion.div
                key="inspector"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="h-full"
              >
                <VehicleInspector3D />
              </motion.div>
            )}

            {activeTab === 'drivers' && (
              <motion.div
                key="drivers"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="h-full"
              >
                <DriverSafety />
              </motion.div>
            )}

            {activeTab === 'roi' && (
              <motion.div
                key="roi"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="h-full"
              >
                <ExecutiveROI />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Slide-out AI Assistant Drawer (Apple-style UX) */}
      <AnimatePresence>
        {isAIOpen && (
          <>
            {/* Backdrop Blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAIOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            {/* AI Drawer Body */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 220, damping: 25 }}
              className="absolute right-0 top-0 bottom-0 w-96 glass border-l border-white/5 shadow-2xl flex flex-col justify-between z-50 p-5"
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                    <span className="font-bold text-sm tracking-wide uppercase text-text-primary">Fleet AI Command</span>
                  </div>
                  <button 
                    onClick={() => setIsAIOpen(false)}
                    className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-text-muted hover:text-text-primary transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Chat Log History */}
                <div className="flex flex-col gap-3 h-[450px] overflow-y-auto pr-1">
                  {chatLog.map((chat, idx) => (
                    <div 
                      key={idx} 
                      className={`flex flex-col p-3 rounded-xl max-w-[85%] text-xs leading-relaxed text-left ${
                        chat.sender === 'user'
                          ? 'bg-accent/20 border border-accent/30 text-text-primary self-end'
                          : 'bg-white/5 border border-white/5 text-text-muted self-start'
                      }`}
                    >
                      <span>{chat.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Input Area */}
              <div className="relative mt-4">
                <input
                  type="text"
                  placeholder="Ask Fleet AI..."
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendAIMessage()}
                  className="w-full pl-4 pr-12 py-3 rounded-xl bg-white/5 border border-white/5 focus:border-accent/40 focus:bg-white/10 outline-none text-xs text-text-primary placeholder:text-text-muted transition-all"
                />
                <button 
                  onClick={handleSendAIMessage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-text-primary hover:bg-accent/80 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
