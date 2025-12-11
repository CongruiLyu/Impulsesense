
import React, { useState, useMemo } from 'react';
import { ComposedChart, Line, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList, ReferenceLine, AreaChart, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Order, InterventionEvent, InterventionLevel, ProductAnalytics, PurchaseRecord, ImpulseLevel, ImpulseEventDetail } from '../types';
import { TrendingUp, AlertTriangle, PieChart as PieIcon, ShoppingBag, Zap, Flame, Award, ArrowUpRight, Activity } from 'lucide-react';

interface Props {
  orders: Order[];
  interventionEvents: InterventionEvent[];
  userAnalytics?: {
    interactions: Record<number, ProductAnalytics>;
    purchaseHistory: PurchaseRecord[];
  };
}

const InsightsView: React.FC<Props> = ({ orders, interventionEvents, userAnalytics }) => {
  // Default to 30 days view, adjustable via scroll
  const [timeRangeDays, setTimeRangeDays] = useState(30);

  // --- 1. Trend Data (Spending & Interventions) ---
  const trendData = useMemo(() => {
    const data = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate 90 days of history
    for (let i = 89; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const isoDate = d.toISOString().split('T')[0];
        const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        // Mock historical data (Background noise)
        let spending = 0;
        let interventionCount = 0;
        
        // Add random noise for "past" history to look realistic
        if (i > 0) {
             // Random spending events
             if (Math.random() > 0.85) spending = Math.floor(Math.random() * 120) + 20;
             
             // Correlate high spending with potential interventions
             if (spending > 80 && Math.random() > 0.5) interventionCount = 1;
             else if (Math.random() > 0.95) interventionCount = 1;
        }

        data.push({
            date: dateLabel,
            isoDate: isoDate,
            spending,
            interventions: interventionCount,
            fullDate: d
        });
    }

    // Merge Real-Time Data (Current Session)
    orders.forEach(o => {
        const dStr = new Date(o.date).toISOString().split('T')[0];
        const entry = data.find(item => item.isoDate === dStr);
        if (entry) {
            entry.spending += o.total;
        }
    });

    interventionEvents.forEach(e => {
        const dStr = new Date(e.timestamp).toISOString().split('T')[0];
        const entry = data.find(item => item.isoDate === dStr);
        if (entry) {
            entry.interventions += 1;
        }
    });

    // Slice based on zoom level (timeRangeDays)
    return data.slice(data.length - timeRangeDays);
  }, [orders, interventionEvents, timeRangeDays]);

  // --- 2. Granular Intervention Data for Last 7 Days (Pie & Bar Charts) ---
  const lastWeekInterventions = useMemo(() => {
      const allEvents: InterventionEvent[] = [];
      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);

      // 1. Generate realistic mock history for the last 7 days to populate the chart
      for (let i = 0; i < 35; i++) {
          const d = new Date(now);
          d.setDate(d.getDate() - Math.floor(Math.random() * 7)); // Random day in last 7
          d.setHours(Math.floor(Math.random() * 24)); // Random hour
          d.setMinutes(Math.floor(Math.random() * 60));

          // Weighted random level (More low levels, fewer high levels)
          const r = Math.random();
          let lvl = InterventionLevel.L1_REFLECTION;
          if (r > 0.4) lvl = InterventionLevel.L2_GRAYSCALE;
          if (r > 0.7) lvl = InterventionLevel.L3_BREATHING;
          if (r > 0.9) lvl = InterventionLevel.L4_MICRO_LOCK;

          allEvents.push({
              id: `mock-history-${i}`,
              timestamp: d.toISOString(),
              level: lvl
          });
      }

      // 2. Merge with real-time events that occurred in the last 7 days
      const recentRealEvents = interventionEvents.filter(e => new Date(e.timestamp) >= sevenDaysAgo);
      
      return [...allEvents, ...recentRealEvents];
  }, [interventionEvents]);

  // Pie Chart Data: Level Distribution
  const levelDistributionData = useMemo(() => {
      const counts = {
          [InterventionLevel.L1_REFLECTION]: 0,
          [InterventionLevel.L2_GRAYSCALE]: 0,
          [InterventionLevel.L3_BREATHING]: 0,
          [InterventionLevel.L4_MICRO_LOCK]: 0,
          [InterventionLevel.L5_SAFE_MODE]: 0,
      };

      lastWeekInterventions.forEach(e => {
          if (counts[e.level] !== undefined) counts[e.level]++;
      });

      const labels = {
          [InterventionLevel.L1_REFLECTION]: 'L1 Reflection',
          [InterventionLevel.L2_GRAYSCALE]: 'L2 Grayscale',
          [InterventionLevel.L3_BREATHING]: 'L3 Breathing',
          [InterventionLevel.L4_MICRO_LOCK]: 'L4 Lock',
          [InterventionLevel.L5_SAFE_MODE]: 'L5 Safe Mode',
      };

      return Object.entries(counts)
          .filter(([_, value]) => value > 0)
          .map(([key, value]) => ({
              name: labels[Number(key) as InterventionLevel],
              value: value,
              level: Number(key)
          }));
  }, [lastWeekInterventions]);

  // --- 3. Brand Preference Algorithm Calculation ---
  const brandPreferenceData = useMemo(() => {
    // A. Define Data Structures
    interface BrandRawStats {
        viewCount: number;
        viewTime: number; // seconds
        cartCount: number;
        favCount: number;
        buyCount: number;
        lastInteraction: Date;
    }

    const brands: Record<string, BrandRawStats> = {};

    // Helper to init brand
    const getBrand = (name: string) => {
        if (!brands[name]) {
            brands[name] = { 
                viewCount: 0, viewTime: 0, cartCount: 0, favCount: 0, buyCount: 0, lastInteraction: new Date(0) 
            };
        }
        return brands[name];
    };

    // B. Inject Mock Data (Background History for new users)
    // This ensures the chart isn't empty on first load
    const MOCK_BRANDS = [
        { name: 'Apple', views: 45, time: 2300, carts: 3, favs: 5, buys: 1, last: new Date(Date.now() - 86400000 * 2) },
        { name: 'Nike', views: 62, time: 1800, carts: 6, favs: 8, buys: 2, last: new Date() },
        { name: 'Samsung', views: 30, time: 1200, carts: 1, favs: 2, buys: 0, last: new Date(Date.now() - 86400000 * 5) },
        { name: 'Sony', views: 25, time: 900, carts: 2, favs: 1, buys: 0, last: new Date(Date.now() - 86400000 * 10) },
        { name: 'Adidas', views: 40, time: 1500, carts: 4, favs: 3, buys: 1, last: new Date(Date.now() - 86400000 * 1) },
    ];

    MOCK_BRANDS.forEach(m => {
        const b = getBrand(m.name);
        b.viewCount += m.views;
        b.viewTime += m.time;
        b.cartCount += m.carts;
        b.favCount += m.favs;
        b.buyCount += m.buys;
        if (m.last > b.lastInteraction) b.lastInteraction = m.last;
    });

    // C. Process Real Analytics Data from Props
    if (userAnalytics) {
        // 1. Interactions
        Object.values(userAnalytics.interactions).forEach((record: ProductAnalytics) => {
            const b = getBrand(record.brand || 'Generic');
            b.viewCount += record.viewCount;
            b.viewTime += record.totalViewTimeSeconds;
            // Counts: if added to cart, count as 1 event per product interaction record
            if (record.isAddedToCart) b.cartCount += 1; 
            if (record.isFavorited) b.favCount += 1;
            
            const recordDate = new Date(record.lastInteraction);
            if (recordDate > b.lastInteraction) b.lastInteraction = recordDate;
        });

        // 2. Purchases
        userAnalytics.purchaseHistory.forEach(record => {
            const b = getBrand(record.brand || 'Generic');
            b.buyCount += 1;
            const buyDate = new Date(record.purchaseTime);
            if (buyDate > b.lastInteraction) b.lastInteraction = buyDate;
        });
    }

    // D. Normalization - Find Max Values
    let maxView = 1, maxTime = 1, maxCart = 1, maxFav = 1, maxBuy = 1;
    Object.values(brands).forEach(b => {
        if (b.viewCount > maxView) maxView = b.viewCount;
        if (b.viewTime > maxTime) maxTime = b.viewTime;
        if (b.cartCount > maxCart) maxCart = b.cartCount;
        if (b.favCount > maxFav) maxFav = b.favCount;
        if (b.buyCount > maxBuy) maxBuy = b.buyCount;
    });

    // E. Score Calculation Formula
    // Score = 0.25·View + 0.20·ViewTime + 0.20·Cart + 0.20·Favorite + 0.15·Buy
    const scoredBrands = Object.entries(brands).map(([name, stats]) => {
        const viewScore = stats.viewCount / maxView;
        const timeScore = stats.viewTime / maxTime;
        const cartScore = stats.cartCount / maxCart;
        const favScore = stats.favCount / maxFav;
        const buyScore = stats.buyCount / maxBuy;

        let rawPreference = 
            (0.25 * viewScore) +
            (0.20 * timeScore) +
            (0.20 * cartScore) +
            (0.20 * favScore) +
            (0.15 * buyScore);

        // F. Recency Adjustment
        // Recency = exp(-days_since_last_visit / 30)
        // Preference = Preference * (0.5 + 0.5 * Recency)
        const daysSince = (Date.now() - stats.lastInteraction.getTime()) / (1000 * 3600 * 24);
        const recency = Math.exp(-daysSince / 30);
        const finalScore = rawPreference * (0.5 + (0.5 * recency));

        return {
            name,
            score: finalScore, // 0 to 1
            displayScore: Math.round(finalScore * 100),
            stats,
            recencyLabel: daysSince < 1 ? 'Today' : `${Math.floor(daysSince)}d ago`
        };
    });

    // G. Sort & Top N
    return scoredBrands.sort((a, b) => b.score - a.score).slice(0, 5);

  }, [userAnalytics]);

  // --- 4. Impulse Purchase Index (IPI) Calculation ---
  const impulseIndexData = useMemo(() => {
      // 3.1 Gather all records (Real + Mock) for past 90 days
      interface AnalysisRecord {
          category: string;
          impulseScore: number;
          dwellTime: number; // seconds
          delayTime: number; // seconds (add-to-cart to buy)
      }

      const records: AnalysisRecord[] = [];
      const categories = ['Electronics', 'Fashion', 'Beauty', 'Home', 'Groceries', 'Automotive'];

      // Generate Mock History (Last 90 days)
      for (let i = 0; i < 60; i++) {
          const cat = categories[Math.floor(Math.random() * categories.length)];
          const impulseBase = Math.random();
          
          // Correlate metrics to simulate realistic impulse behavior
          const dwellTime = 20 + (Math.random() * 200 * (1 + impulseBase)); 
          const delayTime = Math.max(10, 600 - (impulseBase * 500) + (Math.random() * 60)); // Higher impulse = lower delay

          records.push({
              category: cat,
              impulseScore: impulseBase,
              dwellTime,
              delayTime
          });
      }

      // Add Real Orders
      orders.forEach(o => {
          o.items.forEach(item => {
              records.push({
                  category: item.product.category,
                  impulseScore: item.purchaseMetadata?.impulseScore || 0.5,
                  dwellTime: item.purchaseMetadata?.dwellTime || 60,
                  delayTime: item.purchaseMetadata?.timeToBuySeconds || 30
              });
          });
      });

      // 3.2 Calculate Global Dwell Stats (for Z-Score)
      const totalDwell = records.reduce((acc, r) => acc + r.dwellTime, 0);
      const globalMeanDwell = totalDwell / (records.length || 1);
      const globalStdDwell = Math.sqrt(
          records.reduce((acc, r) => acc + Math.pow(r.dwellTime - globalMeanDwell, 2), 0) / (records.length || 1)
      );

      // 3.3 Calculate Metrics per Category
      const catStats: Record<string, { total: number, highImpulseCount: number, dwellSum: number, quickBuyCount: number }> = {};
      
      records.forEach(r => {
          if (!catStats[r.category]) catStats[r.category] = { total: 0, highImpulseCount: 0, dwellSum: 0, quickBuyCount: 0 };
          
          catStats[r.category].total++;
          catStats[r.category].dwellSum += r.dwellTime;
          
          // I_freq condition: impulse_score >= 0.6
          if (r.impulseScore >= 0.6) catStats[r.category].highImpulseCount++;
          
          // Delay_score condition: delay < 5min (300s)
          if (r.delayTime < 300) catStats[r.category].quickBuyCount++;
      });

      // 3.4 Final Score Calculation
      const results = Object.keys(catStats).map(cat => {
          const s = catStats[cat];
          const avgDwell = s.dwellSum / s.total;

          // 1. I_freq (Normalized relative to max count for viz, e.g. 10)
          const i_freq = Math.min(s.highImpulseCount / 5, 1); 

          // 2. I_ratio
          const i_ratio = s.highImpulseCount / s.total;

          // 3. D_zscore (Normalized/Clamped -2 to +2 map to 0-1)
          const z_raw = (avgDwell - globalMeanDwell) / (globalStdDwell || 1);
          // Map Z-score: +2SD -> 1.0, -2SD -> 0.0
          const d_zscore = Math.max(0, Math.min(1, (z_raw + 2) / 4)); 

          // 4. Delay_score
          const delay_score = s.quickBuyCount / s.total;

          // WEIGHTED FORMULA
          // IPI = 0.35*Freq + 0.35*Ratio + 0.20*ZScore + 0.10*Delay
          const ipi = (0.35 * i_freq) + (0.35 * i_ratio) + (0.20 * d_zscore) + (0.10 * delay_score);

          return {
              name: cat,
              value: parseFloat(ipi.toFixed(2))
          };
      });

      // Display mapping
      const categoryLabelMap: Record<string, string> = {
          'Electronics': 'Digital',
          'Fashion': 'Fashion',
          'Beauty': 'Cosmetics',
          'Home': 'Home/Med',
          'Groceries': 'Food/Daily',
          'Automotive': 'Outdoor'
      };

      return results
        .map(r => ({ ...r, name: categoryLabelMap[r.name] || r.name }))
        .sort((a, b) => b.value - a.value);

  }, [orders]);

  // --- 5. Impulse Peak Hour Dynamic Curve Calculation ---
  const impulsePeakHourData = useMemo(() => {
      // Initialize 24h buckets
      const hourBuckets = Array(24).fill(0).map((_, i) => ({
          hour: i,
          label: `${i}:00`,
          totalActions: 0,
          impulseEvents: 0,
          avgArousal: 0,
          arousalSum: 0,
          rawRate: 0,
          smoothedRate: 0,
      }));

      // Mock Data Generation
      for (let i = 0; i < 1000; i++) {
         let h;
         const r = Math.random();
         if (r < 0.2) h = Math.floor(Math.random() * 9); // 0-8
         else if (r < 0.5) h = 9 + Math.floor(Math.random() * 9); // 9-17
         else if (r < 0.8) h = 18 + Math.floor(Math.random() * 3); // 18-20
         else h = 21 + Math.floor(Math.random() * 3); // 21-23

         let arousal = 0.2 + (Math.random() * 0.3);
         if (h >= 21) arousal += 0.4;
         else if (h >= 13 && h <= 16) arousal += 0.2;
         
         arousal = Math.min(0.99, arousal);
         const dwellTime = 10 + (arousal * 100) + (Math.random() * 50);
         const delayTime = 600 - (arousal * 400);

         const condA = arousal >= 0.6;
         const condB = delayTime < 300;
         const condC = dwellTime > 90;
         const isImpulse = condA || condB || condC;

         hourBuckets[h].totalActions++;
         hourBuckets[h].arousalSum += arousal;
         if (isImpulse) hourBuckets[h].impulseEvents++;
      }

      hourBuckets.forEach(b => {
          if (b.totalActions > 0) {
              b.rawRate = b.impulseEvents / b.totalActions;
              b.avgArousal = b.arousalSum / b.totalActions;
          }
      });

      const smoothedData = hourBuckets.map((curr, idx, arr) => {
          const prev = arr[idx === 0 ? 23 : idx - 1]; 
          const next = arr[idx === 23 ? 0 : idx + 1]; 
          const smoothedRate = (prev.rawRate + curr.rawRate + next.rawRate) / 3;
          return {
              ...curr,
              smoothedRate: parseFloat(smoothedRate.toFixed(3)),
              displayRate: parseFloat((smoothedRate * 100).toFixed(1)) 
          };
      });

      const maxHour = smoothedData.reduce((prev, curr) => (curr.smoothedRate > prev.smoothedRate ? curr : prev), smoothedData[0]);
      const peakWindowStart = maxHour.hour;
      const peakWindowEnd = (maxHour.hour + 2) % 24; 
      const globalAvgArousal = smoothedData.reduce((acc, c) => acc + c.avgArousal, 0) / 24;
      const arousalIncrease = ((maxHour.avgArousal - globalAvgArousal) / globalAvgArousal) * 100;

      return {
          chartData: smoothedData,
          peakStats: {
              window: `${peakWindowStart}:00 - ${peakWindowEnd}:00`,
              arousalRise: arousalIncrease.toFixed(0),
              topCategory: 'Digital & Beauty' 
          }
      };
  }, []);

  // --- 6. Impulse Event Count & Level Distribution Algorithm ---
  // Steps: Simulate sliding window and apply weights
  const impulseEventData = useMemo(() => {
    // A. Weights Config
    const WEIGHTS = {
        view: 0.5,
        rapid_view: 1.5,
        revisit: 2,
        fav: 5,
        add_to_cart: 3,
        purchase: 8
    };

    // B. Counters for visualization
    const counts = {
        [ImpulseLevel.L1_MILD]: 0,
        [ImpulseLevel.L2_MODERATE]: 0,
        [ImpulseLevel.L3_HIGH]: 0,
        [ImpulseLevel.L4_EXTREME]: 0
    };
    
    // C. Simulation: Generate realistic event logs for the last 30 days
    // Since we don't have granular event logs for 30 days, we simulate the output of the sliding window algorithm.
    const TOTAL_SIMULATED_EVENTS = 60;
    
    for (let i = 0; i < TOTAL_SIMULATED_EVENTS; i++) {
        // Randomly generate a "session score" based on probability distribution
        // L1 (3-6) is most common, L4 (>15) is rare
        const r = Math.random();
        let score = 0;
        
        if (r > 0.96) {
            // L4 Extreme
            score = 15 + Math.random() * 10;
        } else if (r > 0.85) {
            // L3 High
            score = 10 + Math.random() * 4.9;
        } else if (r > 0.55) {
            // L2 Moderate
            score = 6 + Math.random() * 3.9;
        } else {
            // L1 Mild
            score = 3 + Math.random() * 2.9;
        }

        // Classify
        let level = ImpulseLevel.L1_MILD;
        if (score >= 15) level = ImpulseLevel.L4_EXTREME;
        else if (score >= 10) level = ImpulseLevel.L3_HIGH;
        else if (score >= 6) level = ImpulseLevel.L2_MODERATE;

        counts[level]++;
    }

    // D. Prepare Chart Data
    
    // Radar Data (Structure)
    const radarData = [
        { subject: 'L1 Mild', count: counts[ImpulseLevel.L1_MILD], fullMark: Math.max(...Object.values(counts)) * 1.2 },
        { subject: 'L4 Extreme', count: counts[ImpulseLevel.L4_EXTREME], fullMark: Math.max(...Object.values(counts)) * 1.2 },
        { subject: 'L3 High', count: counts[ImpulseLevel.L3_HIGH], fullMark: Math.max(...Object.values(counts)) * 1.2 },
        { subject: 'L2 Moderate', count: counts[ImpulseLevel.L2_MODERATE], fullMark: Math.max(...Object.values(counts)) * 1.2 },
    ];

    // Pie Data (Distribution)
    const pieData = [
        { name: 'L1 Mild', value: counts[ImpulseLevel.L1_MILD], level: ImpulseLevel.L1_MILD },
        { name: 'L2 Moderate', value: counts[ImpulseLevel.L2_MODERATE], level: ImpulseLevel.L2_MODERATE },
        { name: 'L3 High', value: counts[ImpulseLevel.L3_HIGH], level: ImpulseLevel.L3_HIGH },
        { name: 'L4 Extreme', value: counts[ImpulseLevel.L4_EXTREME], level: ImpulseLevel.L4_EXTREME },
    ];

    return { radarData, pieData, total: TOTAL_SIMULATED_EVENTS };
  }, []);

  // --- Colors ---
  const COLORS_BY_LEVEL: Record<number, string> = {
      1: '#3B82F6', // Blue
      2: '#6366F1', // Indigo
      3: '#8B5CF6', // Purple
      4: '#F97316', // Orange
      5: '#EF4444', // Red
  };
  
  const COLORS_IMPULSE_LEVEL: Record<string, string> = {
      [ImpulseLevel.L1_MILD]: '#3B82F6', // Blue
      [ImpulseLevel.L2_MODERATE]: '#F59E0B', // Amber
      [ImpulseLevel.L3_HIGH]: '#EF4444', // Red
      [ImpulseLevel.L4_EXTREME]: '#7F1D1D', // Dark Red
  };

  // --- Interaction: Mouse Wheel Zoom ---
  const handleWheel = (e: React.WheelEvent) => {
    // Only zoom if scrolling over the chart container
    if (e.currentTarget === e.target || (e.currentTarget as HTMLElement).contains(e.target as Node)) {
        const delta = e.deltaY;
        const sensitivity = 2; 
        setTimeRangeDays(prev => {
            let newVal = prev;
            if (delta > 0) newVal += sensitivity; 
            else newVal -= sensitivity;
            return Math.max(7, Math.min(90, newVal));
        });
    }
  };

  const currentSpending = trendData.reduce((acc, curr) => acc + curr.spending, 0);
  const currentInterventions = trendData.reduce((acc, curr) => acc + curr.interventions, 0);

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6 pt-12 pb-24 font-sans">
       {/* Header */}
       <div className="flex justify-between items-end mb-6">
           <div>
               <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Behavior Insights</h1>
               <p className="text-xs text-gray-500 mt-1">Real-time analysis of impulse patterns</p>
           </div>
           <div className="text-right">
               <span className="block text-[10px] text-gray-400 uppercase tracking-wide font-bold">Time Window</span>
               <span className="text-xl font-mono font-bold text-gray-800">{timeRangeDays} Days</span>
           </div>
       </div>

       {/* Key Metrics */}
       <div className="grid grid-cols-2 gap-4 mb-6">
           <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
               <div className="flex items-center text-gray-400 mb-2">
                   <TrendingUp size={14} className="mr-2 text-blue-500" />
                   <span className="text-[10px] uppercase font-bold tracking-wider">Total Consumption</span>
               </div>
               <div className="text-2xl font-bold text-gray-900">${currentSpending.toFixed(0)}</div>
           </div>
           <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-black"></div>
               <div className="flex items-center text-gray-400 mb-2">
                   <AlertTriangle size={14} className="mr-2 text-black" />
                   <span className="text-[10px] uppercase font-bold tracking-wider">Interventions</span>
               </div>
               <div className="text-2xl font-bold text-gray-900">{currentInterventions}</div>
           </div>
       </div>

       {/* Combined Chart: Spending & Interventions */}
       <div 
         className="bg-white p-5 rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 mb-6 relative hover:shadow-xl transition-shadow"
         onWheel={handleWheel}
       >
          <div className="flex justify-between items-start mb-4">
              <h2 className="text-sm font-bold text-gray-700">Spending & Interventions Trend</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-[10px] text-gray-500">
                   <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div> Spending ($)
                </div>
                <div className="flex items-center text-[10px] text-gray-500">
                   <div className="w-2 h-2 rounded-full bg-black mr-1"></div> Interventions
                </div>
              </div>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 9, fill: '#9CA3AF' }} 
                        minTickGap={30}
                    />
                    <YAxis 
                        yAxisId="left"
                        orientation="left" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 9, fill: '#3B82F6' }}
                    />
                    <YAxis 
                        yAxisId="right"
                        orientation="right" 
                        axisLine={false} 
                        tickLine={false} 
                        allowDecimals={false}
                        tick={{ fontSize: 9, fill: '#000000' }}
                    />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        labelStyle={{ fontSize: '10px', color: '#6B7280', marginBottom: '4px' }}
                    />
                    <Area 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="spending" 
                        stroke="#3B82F6" 
                        fill="url(#colorSpending)" 
                        fillOpacity={0.1}
                        strokeWidth={2}
                        name="Spending"
                        unit="$"
                    />
                    <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="interventions" 
                        stroke="#000000" 
                        strokeWidth={2}
                        dot={false}
                        name="Interventions"
                    />
                </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[9px] text-gray-300 text-center mt-1 italic">Scroll to zoom</p>
       </div>

       {/* NEW CHART: Hot Brand Preference */}
       <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Award size={14} className="text-purple-500"/>
                    <h2 className="text-sm font-bold text-gray-700">Brand Preference & Loyalty</h2>
                </div>
            </div>
            
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                        layout="vertical"
                        data={brandPreferenceData} 
                        margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                        <XAxis 
                            type="number"
                            domain={[0, 1]}
                            tickLine={false} 
                            axisLine={false} 
                            tick={{ fontSize: 9, fill: '#9CA3AF' }} 
                            hide
                        />
                        <YAxis 
                            dataKey="name" 
                            type="category"
                            tickLine={false} 
                            axisLine={false} 
                            width={70}
                            tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 600 }} 
                        />
                        <Tooltip 
                            cursor={{ fill: '#f3f4f6', opacity: 0.5 }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                            labelStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}
                            formatter={(value: number, name: string, props: any) => {
                                const stats = props.payload.stats;
                                if (name === 'Score') {
                                    return [
                                        <div key="stats" className="space-y-1 mt-1 text-[10px] text-gray-500 font-normal">
                                            <div className="flex justify-between w-32"><span>Score:</span> <span className="font-bold text-purple-600">{(value * 100).toFixed(0)}</span></div>
                                            <div className="flex justify-between w-32"><span>Views:</span> <span>{stats.viewCount}</span></div>
                                            <div className="flex justify-between w-32"><span>Cart Adds:</span> <span>{stats.cartCount}</span></div>
                                            <div className="flex justify-between w-32"><span>Purchases:</span> <span>{stats.buyCount}</span></div>
                                            <div className="flex justify-between w-32 border-t border-gray-100 pt-1 mt-1"><span>Recency:</span> <span>{props.payload.recencyLabel}</span></div>
                                        </div>,
                                        ''
                                    ];
                                }
                                return [value, name];
                            }}
                        />
                        <Bar 
                            dataKey="score" 
                            fill="#8B5CF6" // Purple
                            radius={[0, 4, 4, 0]} 
                            barSize={20}
                            background={{ fill: '#F3F4F6' }}
                        >
                            <LabelList 
                                dataKey="displayScore" 
                                position="right" 
                                fontSize={9} 
                                fill="#8B5CF6" 
                                fontWeight="bold"
                                formatter={(val: number) => `${val}`}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
       </div>

       {/* NEW CHART: Impulse Peak Hour Curve */}
       <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center space-x-2">
                   <Zap size={14} className="text-orange-500 fill-current"/>
                   <h2 className="text-sm font-bold text-gray-700">Impulse Peak Hour (30d)</h2>
               </div>
               <span className="text-[9px] bg-orange-50 text-orange-600 px-2 py-1 rounded-full font-bold">
                   Dynamic Curve
               </span>
            </div>
            
            <div className="h-[200px] w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={impulsePeakHourData.chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                         <defs>
                            <linearGradient id="colorImpulse" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F97316" stopOpacity={0.6}/>
                                <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                            dataKey="hour" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 9, fill: '#9CA3AF' }} 
                            interval={3}
                            tickFormatter={(h) => `${h}:00`}
                        />
                        <YAxis 
                            hide={false}
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 9, fill: '#9CA3AF' }}
                            unit="%"
                        />
                        <Tooltip 
                             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                             labelStyle={{ fontSize: '10px', color: '#6B7280', marginBottom: '4px' }}
                             formatter={(value: number) => [`${value}%`, 'Impulse Rate']}
                             labelFormatter={(label) => `Hour: ${label}:00`}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="displayRate" 
                            stroke="#F97316" 
                            strokeWidth={3}
                            fill="url(#colorImpulse)" 
                            name="Impulse Rate"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
       </div>

       {/* Pie Chart (Level Distribution - Intervention) */}
       <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center space-x-2 mb-4">
                <PieIcon size={14} className="text-gray-400"/>
                <h2 className="text-sm font-bold text-gray-700">Level Distribution (7d)</h2>
            </div>
            <div className="h-[200px] w-full flex justify-center">
                <ResponsiveContainer width="100%" height="100%" maxWidth={400}>
                    <PieChart>
                        <Pie
                            data={levelDistributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {levelDistributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS_BY_LEVEL[entry.level]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                        <Legend 
                            layout="vertical" 
                            verticalAlign="middle" 
                            align="right"
                            iconSize={8}
                            wrapperStyle={{ fontSize: '10px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
       </div>

       {/* NEW SECTION: Impulse Event Count & Level Distribution */}
       <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Activity size={14} className="text-red-500"/>
                    <h2 className="text-sm font-bold text-gray-700">Impulse Event Analysis (30d)</h2>
                </div>
                <div className="text-[9px] bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100">
                    Sliding Window (10m)
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* 1. Radar Chart: Structure */}
                 <div className="h-[220px] w-full relative">
                      <h3 className="text-[10px] font-bold text-gray-400 text-center mb-1">Impulse Structure</h3>
                      <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={impulseEventData.radarData}>
                              <PolarGrid stroke="#f3f4f6" />
                              <PolarAngleAxis 
                                  dataKey="subject" 
                                  tick={{ fontSize: 9, fill: '#6B7280', fontWeight: 'bold' }} 
                              />
                              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                              <Radar
                                  name="Events"
                                  dataKey="count"
                                  stroke="#EF4444"
                                  strokeWidth={2}
                                  fill="#EF4444"
                                  fillOpacity={0.2}
                              />
                              <Tooltip 
                                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                  itemStyle={{ fontSize: '10px', color: '#EF4444' }}
                              />
                          </RadarChart>
                      </ResponsiveContainer>
                 </div>

                 {/* 2. Pie Chart: Distribution & Stats */}
                 <div className="flex flex-col h-full">
                      <h3 className="text-[10px] font-bold text-gray-400 text-center mb-2">Severity Breakdown</h3>
                      <div className="flex-1 min-h-[160px]">
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie
                                      data={impulseEventData.pieData}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={30}
                                      outerRadius={50}
                                      paddingAngle={4}
                                      dataKey="value"
                                  >
                                      {impulseEventData.pieData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={COLORS_IMPULSE_LEVEL[entry.level]} />
                                      ))}
                                  </Pie>
                                  <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                                  <Legend 
                                      iconSize={8}
                                      layout="vertical"
                                      verticalAlign="middle"
                                      wrapperStyle={{ fontSize: '9px', right: 0 }}
                                  />
                              </PieChart>
                          </ResponsiveContainer>
                      </div>
                      
                      {/* Explainer Box */}
                      <div className="mt-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                          <div className="flex justify-between items-center text-[9px] text-gray-500 mb-1">
                              <span>L1 (Mild)</span>
                              <span className="font-mono">Score 3-6</span>
                          </div>
                          <div className="flex justify-between items-center text-[9px] text-gray-500 mb-1">
                              <span>L4 (Extreme)</span>
                              <span className="font-mono text-red-600 font-bold">Score {'>'} 15</span>
                          </div>
                          <p className="text-[8px] text-gray-400 mt-1 italic leading-tight">
                              Triggered by ultra-fast checkout ({'<'}20s) or high excitement spikes.
                          </p>
                      </div>
                 </div>
            </div>
       </div>

        {/* Chart 4: Horizontal Bar Chart (Category Impulse Index) */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <ShoppingBag size={14} className="text-gray-400"/>
                    <h2 className="text-sm font-bold text-gray-700">Typical Impulse Categories (3M)</h2>
                </div>
                <span className="text-[9px] text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    Normalized Index (0-1)
                </span>
            </div>
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                        layout="vertical"
                        data={impulseIndexData} 
                        margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                        <XAxis 
                            type="number"
                            domain={[0, 1]}
                            tickLine={false} 
                            axisLine={false} 
                            tick={{ fontSize: 9, fill: '#9CA3AF' }} 
                        />
                        <YAxis 
                            dataKey="name" 
                            type="category"
                            tickLine={false} 
                            axisLine={false} 
                            width={70}
                            tick={{ fontSize: 10, fill: '#4B5563', fontWeight: 500 }} 
                        />
                        <Tooltip 
                            cursor={{ fill: '#f3f4f6', opacity: 0.5 }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            labelStyle={{ fontSize: '10px', color: '#6B7280', marginBottom: '4px' }}
                            formatter={(value: number) => [value, 'Impulse Index']}
                        />
                        <Bar 
                            dataKey="value" 
                            fill="#22d3ee" // Cyan/Light Blue from sketch
                            radius={[0, 4, 4, 0]} 
                            barSize={18}
                        >
                            <LabelList dataKey="value" position="right" fontSize={9} fill="#9CA3AF" />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="text-[9px] text-gray-300 text-center mt-2 italic">
               IPI = 35% Freq + 35% Ratio + 20% Dwell + 10% Delay
            </p>
        </div>
    </div>
  );
};

export default InsightsView;