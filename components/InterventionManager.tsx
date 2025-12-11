import React, { useState, useEffect } from 'react';
import { InterventionLevel } from '../types';
import { TriangleAlert, Lock, XCircle } from 'lucide-react';
import BreathingExercise from './BreathingExercise';

interface Props {
  level: InterventionLevel;
  onReduceScore: (amount: number) => void;
}

const InterventionManager: React.FC<Props> = ({ level, onReduceScore }) => {
  const [showToast, setShowToast] = useState(false);
  const [microLockInput, setMicroLockInput] = useState('');

  // Handle Level 1 Toast
  useEffect(() => {
    if (level === InterventionLevel.L1_REFLECTION) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 5000); // Disappear after 5s
      return () => clearTimeout(timer);
    }
  }, [level]);

  // Render Level 5: Hard Lock
  if (level === InterventionLevel.L5_SAFE_MODE) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-900 text-white flex flex-col items-center justify-center p-8 text-center">
        <Lock className="w-16 h-16 text-red-500 mb-6" />
        <h1 className="text-3xl font-bold mb-4">Safe Mode Activated</h1>
        <p className="text-lg text-gray-300 mb-8">
          Impulse levels are critically high. Shopping is disabled for 30 minutes to protect your budget.
        </p>
        <button 
          onClick={() => onReduceScore(0.5)} 
          className="px-6 py-3 border border-white/20 rounded-full hover:bg-white/10"
        >
          Emergency Unlock (Simulation)
        </button>
      </div>
    );
  }

  // Render Level 4: Micro Lock (Reflection Question)
  if (level === InterventionLevel.L4_MICRO_LOCK) {
    return (
      <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl">
          <TriangleAlert className="w-10 h-10 text-orange-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Pause for a moment</h3>
          <p className="text-gray-600 mb-6 text-sm">
            You are browsing rapidly. Do you really need these items right now?
          </p>
          <input
            type="text"
            placeholder="Type 'I can wait' to unlock"
            className="w-full border border-gray-300 rounded-lg p-3 mb-4 text-center"
            value={microLockInput}
            onChange={(e) => setMicroLockInput(e.target.value)}
          />
          <button
            disabled={microLockInput.toLowerCase() !== 'i can wait'}
            onClick={() => {
                setMicroLockInput('');
                onReduceScore(0.2);
            }}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              microLockInput.toLowerCase() === 'i can wait'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  // Render Level 3: Breathing
  if (level === InterventionLevel.L3_BREATHING) {
    return <BreathingExercise onComplete={() => onReduceScore(0.15)} />;
  }

  // Render Level 1: Toast Notification
  return (
    <>
      {showToast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-white/90 backdrop-blur border-l-4 border-yellow-400 shadow-lg rounded-r px-4 py-3 flex items-center animate-bounce">
          <div className="mr-3">
            <span className="text-yellow-600 font-bold">Impulse Alert</span>
          </div>
          <div className="text-sm text-gray-700">
            Consider checking your budget before adding more.
          </div>
          <button onClick={() => setShowToast(false)} className="ml-4 text-gray-400">
            <XCircle size={16} />
          </button>
        </div>
      )}
    </>
  );
};

export default InterventionManager;