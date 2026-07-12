import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Activity } from 'lucide-react';

// Specialized R3F Truck Component built from primitive meshes
const FuturisticTruck3D = ({
  selectedPart,
  onPartClick,
}: {
  selectedPart: string | null;
  onPartClick: (partName: string) => void;
}) => {
  return (
    <group position={[0, -0.5, 0]}>
      {/* 1. Main Chassis Frame */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.15, 1.4]} />
        <meshStandardMaterial color="#1F2937" roughness={0.5} metalness={0.8} />
      </mesh>

      {/* 2. Front Cabin (Apple-Tesla Minimalist Style) */}
      <group position={[1.5, 0.8, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.0, 1.0, 1.35]} />
          <meshStandardMaterial color="#111827" roughness={0.1} metalness={0.9} />
        </mesh>
        {/* Windshield Gloss Glow */}
        <mesh position={[0.26, 0.2, 0]} rotation={[0, 0, -0.25]}>
          <boxGeometry args={[0.02, 0.45, 1.15]} />
          <meshStandardMaterial color="#3b82f6" transparent opacity={0.6} roughness={0} metalness={1} />
        </mesh>
      </group>

      {/* 3. Cargo Container Box (Palantir Matte Style) */}
      <mesh position={[-0.7, 0.95, 0]} castShadow>
        <boxGeometry args={[3.1, 1.4, 1.38]} />
        <meshStandardMaterial color="#0e1726" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* 4. Tyres & Wheels */}
      {[
        [1.2, 0, 0.7], [1.2, 0, -0.7],   // Front pair
        [-0.8, 0, 0.7], [-0.8, 0, -0.7], // Back pair 1
        [-1.6, 0, 0.7], [-1.6, 0, -0.7]  // Back pair 2
      ].map(([x, y, z], idx) => {
        const isBrakeSelected = selectedPart === 'Brakes';
        const isTyreSelected = selectedPart === 'Tyres';
        return (
          <group key={idx} position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}>
            {/* Tyre Cylinder */}
            <mesh 
              castShadow 
              onClick={(e) => {
                e.stopPropagation();
                onPartClick('Tyres');
              }}
            >
              <cylinderGeometry args={[0.4, 0.4, 0.28, 16]} />
              <meshStandardMaterial 
                color={isTyreSelected ? '#2563EB' : '#030712'} 
                roughness={0.9} 
                metalness={0.1} 
              />
            </mesh>
            {/* Brakes inside the wheel hub */}
            <mesh 
              position={[0, 0.05, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onPartClick('Brakes');
              }}
            >
              <cylinderGeometry args={[0.22, 0.22, 0.3, 16]} />
              <meshStandardMaterial 
                color={isBrakeSelected ? '#EF4444' : '#4B5563'} 
                emissive={isBrakeSelected ? '#EF4444' : '#000000'}
                emissiveIntensity={1.5}
                roughness={0.4} 
              />
            </mesh>
          </group>
        );
      })}

      {/* 5. Diagnostic Hotspots (Interactive Glowing Spheres) */}
      
      {/* Engine Hotspot */}
      <mesh 
        position={[1.8, 0.45, 0]} 
        onClick={(e) => {
          e.stopPropagation();
          onPartClick('Engine');
        }}
      >
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial 
          color={selectedPart === 'Engine' ? '#EF4444' : '#22C55E'} 
          emissive={selectedPart === 'Engine' ? '#EF4444' : '#22C55E'} 
          emissiveIntensity={selectedPart === 'Engine' ? 2 : 0.8} 
        />
      </mesh>

      {/* Fuel Tank Hotspot */}
      <mesh 
        position={[0.2, 0.15, -0.6]} 
        onClick={(e) => {
          e.stopPropagation();
          onPartClick('Fuel Tank');
        }}
      >
        <boxGeometry args={[0.9, 0.35, 0.25]} />
        <meshStandardMaterial 
          color={selectedPart === 'Fuel Tank' ? '#2563EB' : '#F59E0B'} 
          emissive={selectedPart === 'Fuel Tank' ? '#2563EB' : '#F59E0B'}
          emissiveIntensity={selectedPart === 'Fuel Tank' ? 1.5 : 0.4}
        />
      </mesh>

      {/* Battery Cell Hotspot */}
      <mesh 
        position={[0.2, 0.15, 0.6]} 
        onClick={(e) => {
          e.stopPropagation();
          onPartClick('Battery');
        }}
      >
        <boxGeometry args={[0.6, 0.32, 0.2]} />
        <meshStandardMaterial 
          color={selectedPart === 'Battery' ? '#22C55E' : '#2563EB'} 
          emissive={selectedPart === 'Battery' ? '#22C55E' : '#2563EB'}
          emissiveIntensity={selectedPart === 'Battery' ? 2 : 0.6}
        />
      </mesh>
    </group>
  );
};

export const VehicleInspector3D = () => {
  const [selectedPart, setSelectedPart] = useState<string | null>('Engine');

  const diagnosticsData: Record<string, {
    health: number;
    status: 'optimal' | 'warning' | 'critical';
    details: string;
    specs: Record<string, string>;
  }> = {
    Engine: {
      health: 84,
      status: 'warning',
      details: 'Coolant temperature elevated (98°C). Spark plugs scheduled for renewal in 4,200 km.',
      specs: { Temperature: '98°C', RPM: '1,850', Pressure: '4.2 bar' }
    },
    'Fuel Tank': {
      health: 98,
      status: 'optimal',
      details: 'Fuel levels stable. Consumption optimal at 5.8 km/L. Zero impurities detected.',
      specs: { Volume: '240 L', Status: 'Nominal', Fill: '82%' }
    },
    Tyres: {
      health: 92,
      status: 'optimal',
      details: 'Pressure balanced across all 6 positions. Tread wear normal.',
      specs: { Pressure: '110 PSI', Wear: '12%', Temperature: '38°C' }
    },
    Battery: {
      health: 96,
      status: 'optimal',
      details: 'Charge retention optimal. Alternator output stable. Voltages within limits.',
      specs: { Voltage: '24.2V', Health: '96%', Capacity: '180 Ah' }
    },
    Brakes: {
      health: 42,
      status: 'critical',
      details: 'Front pad thickness at 2.4mm (threshold is 3.0mm). Action required immediately.',
      specs: { 'Pad Wear': '78%', Temp: '120°C', Fluid: 'Optimal' }
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6 h-[calc(100vh-64px)] overflow-y-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">3D Digital Twin Inspector</h1>
        <p className="text-text-muted text-sm mt-1">
          Telemetry inspector. Click glowing hotspots on the 3D model or choose from list.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
        {/* Interactive 3D Canvas */}
        <div className="lg:col-span-2 glass rounded-2xl relative overflow-hidden h-[450px] lg:h-auto border border-white/5 shadow-2xl">
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <span className="px-3 py-1 bg-[#22C55E]/15 border border-[#22C55E]/30 rounded-full text-xs text-[#22C55E] flex items-center gap-1.5 font-medium">
              <Activity className="w-3.5 h-3.5" />
              Live Telemetry Feed
            </span>
          </div>

          <Canvas shadows>
            <PerspectiveCamera makeDefault position={[5, 3.2, 5]} fov={40} />
            <ambientLight intensity={0.5} />
            <directionalLight 
              position={[5, 10, 5]} 
              intensity={1.2} 
              castShadow 
              shadow-mapSize={[1024, 1024]} 
            />
            <pointLight position={[-4, 4, -4]} intensity={0.4} color="#3b82f6" />
            <pointLight position={[2, 0.5, 0]} intensity={1.5} color="#2563eb" />
            <FuturisticTruck3D 
              selectedPart={selectedPart} 
              onPartClick={(part) => setSelectedPart(part)} 
            />
            <OrbitControls 
              enableDamping 
              dampingFactor={0.05} 
              maxPolarAngle={Math.PI / 2 - 0.05}
              minDistance={3}
              maxDistance={10}
            />
          </Canvas>
        </div>

        {/* Diagnostic Panel Card */}
        <div className="flex flex-col gap-4">
          {/* Quick List Selection */}
          <div className="glass p-4 rounded-2xl flex flex-col gap-2">
            <span className="text-xs font-semibold text-text-muted px-1 uppercase tracking-wider mb-2">Systems Status</span>
            {Object.keys(diagnosticsData).map((part) => {
              const info = diagnosticsData[part];
              const isSelected = selectedPart === part;
              return (
                <button
                  key={part}
                  onClick={() => setSelectedPart(part)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isSelected 
                      ? 'bg-accent/15 border-accent text-text-primary' 
                      : 'bg-white/5 border-white/5 text-text-muted hover:border-white/10 hover:text-text-primary'
                  }`}
                >
                  <span className="text-sm font-semibold">{part}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium">{info.health}%</span>
                    <span className={`w-2 h-2 rounded-full ${
                      info.status === 'optimal' ? 'bg-success' : info.status === 'warning' ? 'bg-warning' : 'bg-danger'
                    }`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Details & Specs Card */}
          <AnimatePresence mode="wait">
            {selectedPart && (
              <motion.div
                key={selectedPart}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="glass p-5 rounded-2xl flex-1 flex flex-col justify-between border border-white/5"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-text-primary">{selectedPart} Analytics</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                      diagnosticsData[selectedPart].status === 'optimal' 
                        ? 'bg-success/15 border border-success/30 text-success' 
                        : diagnosticsData[selectedPart].status === 'warning'
                        ? 'bg-warning/15 border border-warning/30 text-warning'
                        : 'bg-danger/15 border border-danger/30 text-danger'
                    }`}>
                      {diagnosticsData[selectedPart].status}
                    </span>
                  </div>

                  <p className="text-sm text-text-muted leading-relaxed">
                    {diagnosticsData[selectedPart].details}
                  </p>

                  <div className="mt-6 flex flex-col gap-3">
                    {Object.entries(diagnosticsData[selectedPart].specs).map(([lbl, val]) => (
                      <div key={lbl} className="flex justify-between border-b border-white/5 pb-2 text-sm">
                        <span className="text-text-muted">{lbl}</span>
                        <span className="font-bold text-text-primary">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {diagnosticsData[selectedPart].status === 'critical' && (
                  <div className="mt-4 p-3 rounded-xl bg-danger/10 border border-danger/20 flex gap-2.5 items-start">
                    <ShieldAlert className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                      <span className="text-xs font-bold text-danger block">Priority Maintenance Alert</span>
                      <span className="text-[11px] text-danger/80 block mt-0.5">Please file a workshop ticket immediately to prevent failure.</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
