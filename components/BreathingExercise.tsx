import React, { useEffect, useState, useRef } from 'react';

interface Props {
  onComplete: () => void;
}

const BreathingExercise: React.FC<Props> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'Inhale' | 'Exhale' | 'Hold'>('Inhale');
  const [timeLeft, setTimeLeft] = useState(25); // Set duration to 25s
  
  // Use 'any' to bypass strict TS check for NodeJS vs Browser timer type in this environment
  const timerRef = useRef<any>(null);

  // --- Haptics Helper ---
  const vibrate = (pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  useEffect(() => {
    // 1. Total Countdown Timer (25s)
    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          onComplete(); // Triggers the score reduction in App.tsx
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 2. Breathing Cycle Logic (4s Inhale - 4s Exhale - 1s Hold = 9s Cycle)
    const runCycle = async () => {
      while (true) {
        // --- PHASE 1: INHALE (4s) ---
        setPhase('Inhale');
        // Vibration: Tick every second for 4 seconds
        for (let i = 0; i < 4; i++) {
            vibrate(50); // Light tick
            await new Promise(r => setTimeout(r, 1000));
        }

        // --- PHASE 2: EXHALE (4s) ---
        setPhase('Exhale');
        // Vibration: None (Relax)
        await new Promise(r => setTimeout(r, 4000));

        // --- PHASE 3: HOLD (1s) ---
        setPhase('Hold');
        // Vibration: Single tick to signal end of cycle
        vibrate(80);
        await new Promise(r => setTimeout(r, 1000));
      }
    };
    
    // Start the async loop
    const loopPromise = runCycle();

    return () => {
      clearInterval(countdown);
    };
  }, [onComplete]);

  // --- Animation Styles ---
  const getCircleStyle = (sizeIndex: number) => {
    let scale = 'scale-100';
    // Base opacity set to 30% as requested, modulated slightly by phase
    let opacity = 'opacity-30'; 

    if (phase === 'Inhale') {
       // Expand smoothly
       scale = sizeIndex === 0 ? 'scale-[2.2]' : sizeIndex === 1 ? 'scale-[1.8]' : 'scale-[1.4]';
       opacity = 'opacity-40'; // Slightly more visible during inhale
    } else if (phase === 'Exhale') {
       // Contract smoothly
       scale = 'scale-[0.8]';
       opacity = 'opacity-20'; // Fade out during exhale
    } else {
       // Hold
       scale = 'scale-[0.8]';
       opacity = 'opacity-20';
    }

    const duration = phase === 'Hold' ? 'duration-1000' : 'duration-[4000ms]';
    return `${scale} ${opacity} ${duration}`;
  };

  const getInstructions = () => {
    if (phase === 'Inhale') return 'Inhale';
    if (phase === 'Exhale') return 'Exhale';
    return 'Hold';
  };

  return (
    // Updated Z-Index to 120 (to cover Shopping Detail z-100)
    // Updated Background Color to Muted Lake Blue (#7fa0bc) with 95% opacity
    <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-[#7fa0bc]/95 text-white backdrop-blur-md animate-fade-in transition-all duration-1000">
      
      {/* Timer top right */}
      <div className="absolute top-8 right-8 text-xl font-light opacity-80 font-mono tracking-widest">
        00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
      </div>
      
      {/* Background ambient glow (Subtle) */}
      <div className="absolute inset-0 bg-white/5 pointer-events-none" />

      {/* Breathing Container */}
      <div className="relative flex items-center justify-center w-64 h-64 mb-16">
        
        {/* Outer Ring - Soft diffusion - 30% Opacity Lake Blue Tone */}
        <div 
            className={`absolute w-32 h-32 rounded-full bg-[#b0d0e8] blur-[40px] transition-all ease-in-out ${getCircleStyle(0)}`} 
        />
        
        {/* Middle Ring - Definition - 30% Opacity Lake Blue Tone */}
        <div 
            className={`absolute w-32 h-32 rounded-full border border-white/20 bg-[#b0d0e8] blur-sm transition-all ease-in-out ${getCircleStyle(1)}`} 
        />
        
        {/* Inner Core - Light source */}
        <div 
            className={`absolute w-24 h-24 rounded-full bg-white/90 shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all ease-in-out ${getCircleStyle(2)}`} 
        />

        {/* Text centered in the breathing ball */}
        <div className="z-10 text-xl font-light tracking-[0.2em] uppercase text-[#5a7a96] mix-blend-multiply transition-opacity duration-500">
          {phase}
        </div>
      </div>

      <div className="text-center max-w-xs px-6 relative z-10 space-y-2">
        <h2 className="text-2xl font-light text-white tracking-widest">{getInstructions()}</h2>
        <p className="text-sm font-light text-white/80">
          Sync with the vibration.
        </p>
      </div>

      <button 
        onClick={onComplete}
        className="absolute bottom-12 px-8 py-3 rounded-full border border-white/30 text-xs text-white/70 hover:bg-white/10 transition-colors tracking-widest uppercase"
      >
        I am calm now
      </button>
    </div>
  );
};

export default BreathingExercise;