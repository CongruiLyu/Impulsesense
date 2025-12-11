import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { ExcitementDataPoint, ImpulseState, InterventionLevel, Product } from '../types';
import { calculateImpulseDelta, getLevelFromScore } from '../services/impulseEngine';

const CYCLE_MS = 1000;
const ImpulseCtx = createContext<any>(null);

export function ImpulseProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ImpulseState>({
    score: 0.1,
    level: InterventionLevel.L0_NORMAL,
    isShopping: false,
    dailyBrowseTimeMinutes: 45,
    sessionHighRisk: false,
  });
  const [excitementHistory, setExcitementHistory] = useState<ExcitementDataPoint[]>([]);
  const prevLevelRef = useRef(InterventionLevel.L0_NORMAL);
  const currentProductRef = useRef<Product | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    const highRisk = hour >= 22 || hour <= 4;
    setState((prev) => ({ ...prev, sessionHighRisk: highRisk }));
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => {
        let newScore = prev.score;
        let level = prev.level;

        if (prev.level < InterventionLevel.L3_BREATHING) {
          const delta = calculateImpulseDelta(prev.score, false, false, prev.level > 0);
          newScore = Math.min(1, Math.max(0, prev.score + delta));
          level = getLevelFromScore(newScore);
        }

        setExcitementHistory((hist) => {
          const prevLevel = prevLevelRef.current;
          let triggerInfo;
          if (level > prevLevel && level > InterventionLevel.L0_NORMAL) {
            const now = new Date();
            triggerInfo = {
              level,
              productName: currentProductRef.current ? currentProductRef.current.title : 'Browsing',
              reason: level >= 4 ? 'Rapid browsing + repeated visits'
                    : level >= 3 ? 'High intensity interaction'
                    : 'Extended viewing',
              timestampLabel: `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`
            };
          }
          prevLevelRef.current = level;

          const next = [...hist, { timestamp: Date.now(), score: newScore * 10, triggerInfo }];
          if (next.length > 300) next.shift();
          return next;
        });

        return { ...prev, score: newScore, level };
      });
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  const setCurrentProduct = (p: Product | null) => { currentProductRef.current = p; };

  return (
    <ImpulseCtx.Provider value={{ state, setState, excitementHistory, setCurrentProduct }}>
      {children}
    </ImpulseCtx.Provider>
  );
}

export const useImpulse = () => useContext(ImpulseCtx);

