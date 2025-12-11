
import React, { useState, useMemo, useEffect } from 'react';
import { ImpulseState, InterventionLevel, ExcitementDataPoint } from '../types';
import { Clock, AlertCircle, ShoppingCart, Zap, History, X } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface Props {
  state: ImpulseState;
  onNavigateToMall: () => void;
  excitementHistory?: ExcitementDataPoint[]; // New prop for real-time history
}

interface EventDetail {
  level: InterventionLevel;
  productName: string;
  reason: string;
  timestampLabel: string;
}

// Custom Dot Component for Impulse Markers
const CustomizedDot = (props: any) => {
  const { cx, cy, payload, onDotClick } = props;

  if (!payload.triggerInfo) return null;

  const level = payload.triggerInfo.level;
  let fill = '#9CA3AF'; // Default gray
  let radius = 4;
  let hasPulse = false;

  // L1: Yellow (#FACC15), L2: Orange (#F97316), L3: Red (#EF4444), L4: Dark Red (#7F1D1D)
  switch (level) {
    case InterventionLevel.L1_REFLECTION:
      fill = '#FACC15'; 
      radius = 4;
      break;
    case InterventionLevel.L2_GRAYSCALE:
      fill = '#F97316';
      radius = 5;
      break;
    case InterventionLevel.L3_BREATHING:
      fill = '#EF4444';
      radius = 6;
      break;
    case InterventionLevel.L4_MICRO_LOCK:
    case InterventionLevel.L5_SAFE_MODE:
      fill = '#7F1D1D';
      radius = 6;
      hasPulse = true;
      break;
  }

  return (
    <g 
      onClick={(e) => {
        e.stopPropagation();
        onDotClick(payload.triggerInfo);
      }}
      style={{ cursor: 'pointer' }}
    >
      {/* Invisible larger hit area for easier clicking */}
      <circle cx={cx} cy={cy} r={20} fill="transparent" />
      
      {hasPulse && (
        <circle cx={cx} cy={cy} r={radius * 2} fill={fill} opacity="0.3">
           <animate attributeName="r" from={radius} to={radius * 2.5} dur="1s" repeatCount="indefinite" />
           <animate attributeName="opacity" from="0.6" to="0" dur="1s" repeatCount="indefinite" />
        </circle>
      )}
      <circle cx={cx} cy={cy} r={radius + 2} fill="white" />
      <circle cx={cx} cy={cy} r={radius} fill={fill} stroke="none" />
    </g>
  );
};

const HomeDashboard: React.FC<Props> = ({ state, onNavigateToMall, excitementHistory = [] }) => {
  // --- History Slider State ---
  // Default window size to show (30 seconds)
  const VIEW_WINDOW = 30;
  // Controls how far back we are looking. 0 = Live (End of array). Positive numbers = offset from end.
  const [historyOffset, setHistoryOffset] = useState(0);
  const [activeEvent, setActiveEvent] = useState<EventDetail | null>(null);

  // Auto-scroll logic: If offset is 0, we are "Live".
  // If user drags slider, we pause auto-scroll (handled inherently by offset not being 0).
  const isLive = historyOffset === 0;

  // Calculate the slice of data to show
  const visibleData = useMemo(() => {
     const totalPoints = excitementHistory.length;
     if (totalPoints === 0) return [];

     // Start Index
     // If Live (offset 0): Show last VIEW_WINDOW points
     // If History (offset > 0): Show window starting from (total - window - offset)
     const endIndex = totalPoints - historyOffset;
     const startIndex = Math.max(0, endIndex - VIEW_WINDOW);
     
     return excitementHistory.slice(startIndex, endIndex);
  }, [excitementHistory, historyOffset]);

  const maxHistoryOffset = Math.max(0, excitementHistory.length - VIEW_WINDOW);

  const getLevelColor = (level: InterventionLevel) => {
    switch(level) {
        case InterventionLevel.L0_NORMAL: return 'text-green-600';
        case InterventionLevel.L1_REFLECTION: return 'text-yellow-500';
        case InterventionLevel.L2_GRAYSCALE: return 'text-orange-500';
        case InterventionLevel.L3_BREATHING: return 'text-red-500';
        case InterventionLevel.L4_MICRO_LOCK: 
        case InterventionLevel.L5_SAFE_MODE: return 'text-red-800';
        default: return 'text-gray-600';
    }
  };

  const getLevelBg = (level: InterventionLevel) => {
    switch(level) {
        case InterventionLevel.L0_NORMAL: return 'bg-green-100';
        case InterventionLevel.L5_SAFE_MODE: return 'bg-red-100';
        default: return 'bg-gray-100';
    }
  };

  const getLevelName = (level: InterventionLevel) => {
    switch(level) {
        case InterventionLevel.L0_NORMAL: return 'Calm';
        case InterventionLevel.L1_REFLECTION: return 'Alert';
        case InterventionLevel.L2_GRAYSCALE: return 'Distracted';
        case InterventionLevel.L3_BREATHING: return 'Impulsive';
        case InterventionLevel.L4_MICRO_LOCK: return 'High Risk';
        case InterventionLevel.L5_SAFE_MODE: return 'Locked';
        default: return 'Unknown';
    }
  };

  const getEventLevelLabel = (level: InterventionLevel) => {
      switch(level) {
          case InterventionLevel.L1_REFLECTION: return 'L1 (Mild)';
          case InterventionLevel.L2_GRAYSCALE: return 'L2 (Moderate)';
          case InterventionLevel.L3_BREATHING: return 'L3 (High Risk)';
          case InterventionLevel.L4_MICRO_LOCK: 
          case InterventionLevel.L5_SAFE_MODE: return 'L4 (Extreme)';
          default: return 'L0';
      }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value);
      const invertedOffset = maxHistoryOffset - val;
      setHistoryOffset(invertedOffset);
  };

  const handleDotClick = (info: EventDetail) => {
      setActiveEvent(info);
      
      // Vibration for Level 4+
      if (info.level >= InterventionLevel.L4_MICRO_LOCK) {
         if (typeof navigator !== 'undefined' && navigator.vibrate) {
             navigator.vibrate(500); // 500ms vibration
         }
      }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6 pt-12 pb-24 relative">
      <header className="mb-8 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-light text-gray-800">ImpulseSense</h1>
            <p className="text-gray-500 text-xs tracking-wide uppercase mt-1">Behavioral Intervention System</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-white shadow-sm">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
        </div>
      </header>

      {/* Main Status Card */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 p-8 mb-6 flex flex-col items-center justify-center relative overflow-hidden ring-1 ring-gray-100">
        <div className={`absolute top-0 left-0 w-full h-1.5 ${state.level >= 3 ? 'bg-red-500' : 'bg-green-500'}`}></div>
        
        <span className="text-gray-400 uppercase tracking-widest text-[10px] font-bold mb-3">Current State</span>
        <h2 className={`text-5xl font-bold mb-3 ${getLevelColor(state.level)}`}>
            {getLevelName(state.level)}
        </h2>
        <div className={`px-4 py-1.5 rounded-full text-xs font-mono flex items-center space-x-2 ${getLevelBg(state.level)}`}>
            <div className={`w-2 h-2 rounded-full ${state.level >= 3 ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
            <span className="text-gray-600">Level {state.level} • {state.score.toFixed(2)}</span>
        </div>
      </div>

      {/* --- Shopping Excitement Curve Section --- */}
      <div className="mb-8 relative z-20">
        <div className="flex justify-between items-center mb-4">
             <h3 className="text-sm font-bold text-gray-800 flex items-center">
                 <Zap size={16} className="mr-2 text-orange-500 fill-current" />
                 Shopping Excitement Curve
             </h3>
             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isLive ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-500'}`}>
                 {isLive ? 'LIVE' : 'HISTORY VIEW'}
             </span>
        </div>
        
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 relative">
            <div className="h-40 w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={visibleData}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <XAxis hide />
                        <YAxis hide domain={[0, 10]} />
                        <Area 
                            type="monotone" 
                            dataKey="score" 
                            stroke="none" 
                            fill="url(#colorScore)" 
                            isAnimationActive={false} // Disable animation for smooth slider seeking
                            dot={(props) => <CustomizedDot {...props} onDotClick={handleDotClick} />}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            
            {/* History Slider Control */}
            <div className="flex items-center space-x-3 px-2">
                <History size={14} className="text-gray-400" />
                <input 
                    type="range"
                    min="0"
                    max={maxHistoryOffset} 
                    step="1"
                    // Value logic: If slider is at max, we want historyOffset to be 0 (Live).
                    // If slider is at 0, we want historyOffset to be max (Oldest).
                    value={maxHistoryOffset - historyOffset} 
                    onChange={handleSliderChange}
                    className="flex-1 h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-orange-500 hover:accent-orange-600 transition-all"
                />
                <span className="text-[10px] font-mono text-gray-400 w-8 text-right">
                    {isLive ? 'NOW' : `-${(historyOffset / 1).toFixed(0)}s`}
                </span>
            </div>
        </div>
      </div>
      
      {/* Event Details Dialog (Modal Overlay) */}
      {activeEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
              <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-bounce-in">
                  <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                           <div className="flex items-center space-x-2">
                               <Clock size={16} className="text-gray-400" />
                               <span className="text-lg font-mono font-bold text-gray-800">{activeEvent.timestampLabel}</span>
                           </div>
                           <button onClick={() => setActiveEvent(null)} className="text-gray-400 hover:text-gray-600">
                               <X size={20} />
                           </button>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Impulse Event Details</h3>
                      <p className="text-sm text-gray-500 mb-4">
                          Your impulse level reached <span className={`font-bold ${getLevelColor(activeEvent.level)}`}>{getEventLevelLabel(activeEvent.level)}</span>
                      </p>
                      
                      <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                          <span className="block text-[10px] text-orange-400 font-bold uppercase mb-1">Trigger Reason</span>
                          <span className="block text-sm text-orange-900 font-medium leading-relaxed">
                              {activeEvent.reason}
                          </span>
                      </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-4 flex justify-end">
                      <button 
                          onClick={() => setActiveEvent(null)}
                          className="px-6 py-2 bg-gray-900 text-white text-sm font-bold rounded-full hover:bg-black transition-colors"
                      >
                          Dismiss
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 text-gray-400 mb-3">
                <Clock size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Browse Time</span>
            </div>
            <div className="text-2xl font-semibold text-gray-800">
                {state.dailyBrowseTimeMinutes} <span className="text-sm font-normal text-gray-400">min</span>
            </div>
            <div className="w-full bg-gray-100 h-1 mt-3 rounded-full overflow-hidden">
                <div className="bg-blue-500 w-3/4 h-full rounded-full"></div>
            </div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 text-gray-400 mb-3">
                <AlertCircle size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Risk Status</span>
            </div>
            <div className={`text-xl font-semibold ${state.sessionHighRisk ? 'text-red-500' : 'text-green-600'}`}>
                {state.sessionHighRisk ? 'High Risk' : 'Normal'}
            </div>
            <div className="text-[10px] text-gray-400 mt-2">
                Based on time of day
            </div>
        </div>
      </div>

      {/* Quick Action */}
      <button 
        onClick={onNavigateToMall}
        className="group w-full bg-gray-900 text-white py-5 rounded-2xl shadow-lg shadow-gray-300 font-medium text-lg hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
      >
        <ShoppingCart className="w-5 h-5 opacity-80 group-hover:opacity-100" />
        <span>Enter Mall</span>
      </button>

      {/* Tip */}
      <div className="mt-10 px-6 text-center">
        <p className="text-xs text-gray-400 italic leading-relaxed">
          "Impulse buying is often a response to immediate emotional needs. Take a breath before checking out."
        </p>
      </div>
    </div>
  );
};

export default HomeDashboard;
