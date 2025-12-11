
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Home, ShoppingBag, BarChart2, User, Loader2, Camera, CameraOff } from 'lucide-react';
import HomeDashboard from './components/HomeDashboard';
import ShoppingMall from './components/ShoppingMall';
import InterventionManager from './components/InterventionManager';
import InsightsView from './components/InsightsView';
import SettingsView from './components/SettingsView';
import { ImpulseState, InterventionLevel, UserSettings, CartItem, Order, Product, InterventionEvent, OrderItem, ProductAnalytics, PurchaseRecord, ExcitementDataPoint } from './types';
import { getLevelFromScore, calculateImpulseDelta } from './services/ImpulseEngine';

// --- Draggable Utility Component ---
const DraggableOverlay: React.FC<{ 
  children: React.ReactNode; 
  initialClass: string; 
}> = ({ children, initialClass }) => {
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    // Allow interacting with inputs (slider) without dragging
    if ((e.target as HTMLElement).tagName === 'INPUT') return;

    e.preventDefault(); // Prevent text selection etc
    setIsDragging(true);
    // Calculate offset from current transform
    dragStartRef.current = { 
      x: e.clientX - transform.x, 
      y: e.clientY - transform.y 
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setTransform({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div 
      className={`${initialClass} cursor-move touch-none z-50 transition-shadow ${isDragging ? 'shadow-2xl scale-105' : 'shadow-lg'}`}
      style={{ transform: `translate(${transform.x}px, ${transform.y}px)` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {children}
    </div>
  );
};

const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'mall' | 'insights' | 'settings'>('home');

  // Core Impulse State
  const [impulseState, setImpulseState] = useState<ImpulseState>({
    score: 0.1, // Start calm
    level: InterventionLevel.L0_NORMAL,
    isShopping: false,
    dailyBrowseTimeMinutes: 45,
    sessionHighRisk: false,
  });

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Lifted Shopping State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [history, setHistory] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [interventionHistory, setInterventionHistory] = useState<InterventionEvent[]>([]);
  
  // Excitement Curve Data (Last 300 points for history scroll)
  const [excitementHistory, setExcitementHistory] = useState<ExcitementDataPoint[]>(
    Array(30).fill(0).map((_, i) => ({ timestamp: Date.now() - (29 - i) * 1000, score: 1 + Math.random() }))
  );

  // Analytics / Background Data Collection
  const [userAnalytics, setUserAnalytics] = useState<{
    interactions: Record<number, ProductAnalytics>;
    purchaseHistory: PurchaseRecord[];
  }>({
    interactions: {},
    purchaseHistory: []
  });

  // Track previous level to detect rising edges for history logging
  const prevLevelRef = useRef(InterventionLevel.L0_NORMAL);
  // Track current viewed product for context
  const currentProductRef = useRef<Product | null>(null);

  // Settings
  const [settings] = useState<UserSettings>({
    budget: 800,
    sensitiveCategories: ['Fashion', 'Electronics'],
    enableCamera: true,
    enableVibration: true,
  });

  // Camera State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // --- 1. Fetch Data & Generate Mock Popular Brands ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('https://dummyjson.com/products?limit=100');
        const data = await res.json();
        
        // 1. Organize Image Sets by Granular Category for Consistency
        // We store arrays of images (string[]) so we pick a whole set at once.
        const imageSets: Record<string, string[][]> = {
            smartphones: [],
            laptops: [],
            tablets: [],
            watches: [],
            audio: [],
            accessories: [],
            
            // Granular Fashion Buckets to prevent mismatches
            shoes: [],
            shirts: [],
            dresses: [],
            bags: [],
            jewellery: [],
            glasses: [],
            
            beauty: [],
            home: [],
            automotive: [],
            misc: []
        };

        const mappedProducts: Product[] = data.products.map((p: any) => {
            // Map granular API categories to our App's main tabs
            let mappedCategory = 'Recommended';
            const c = p.category;
            const images = p.images && p.images.length > 0 ? p.images : [p.thumbnail];
            
            // Populate Image Sets
            if (c === 'smartphones') imageSets.smartphones.push(images);
            else if (c === 'laptops') imageSets.laptops.push(images);
            else if (c === 'tablets') imageSets.tablets.push(images);
            else if (['mens-watches', 'womens-watches'].includes(c)) imageSets.watches.push(images);
            else if (['mobile-accessories'].includes(c)) imageSets.accessories.push(images);
            else if (['beauty', 'fragrances', 'skincare-products', 'skin-care'].includes(c)) imageSets.beauty.push(images);
            else if (['home-decoration', 'furniture', 'kitchen-accessories', 'lighting'].includes(c)) imageSets.home.push(images);
            else if (['vehicle', 'motorcycle', 'sports-accessories', 'automotive'].includes(c)) imageSets.automotive.push(images);
            
            // Granular Fashion Mapping
            else if (['mens-shoes', 'womens-shoes'].includes(c)) imageSets.shoes.push(images);
            else if (['mens-shirts', 'tops'].includes(c)) imageSets.shirts.push(images);
            else if (['womens-dresses'].includes(c)) imageSets.dresses.push(images);
            else if (['womens-bags'].includes(c)) imageSets.bags.push(images);
            else if (['womens-jewellery'].includes(c)) imageSets.jewellery.push(images);
            else if (['sunglasses'].includes(c)) imageSets.glasses.push(images);
            
            else imageSets.misc.push(images);

            if (['smartphones', 'laptops', 'mobile-accessories', 'tablets', 'mens-watches', 'womens-watches'].includes(c)) mappedCategory = 'Electronics';
            else if (['mens-shirts', 'mens-shoes', 'womens-dresses', 'womens-shoes', 'womens-bags', 'womens-jewellery', 'sunglasses', 'tops'].includes(c)) mappedCategory = 'Fashion';
            else if (['beauty', 'fragrances', 'skincare-products', 'skin-care'].includes(c)) mappedCategory = 'Beauty';
            else if (['home-decoration', 'furniture', 'kitchen-accessories', 'lighting'].includes(c)) mappedCategory = 'Home';
            else if (['groceries'].includes(c)) mappedCategory = 'Groceries';
            else if (['vehicle', 'motorcycle', 'sports-accessories', 'automotive'].includes(c)) mappedCategory = 'Automotive';
            
            let impulse = (p.rating / 5) * 0.7; 
            if (p.price < 50) impulse += 0.2; 
            impulse += (Math.random() * 0.1); 

            return {
                id: p.id,
                title: p.title,
                brand: p.brand || 'Generic', // Ensure brand exists
                price: p.price,
                category: mappedCategory,
                images: images,
                description: p.description,
                impulseFactor: Math.min(0.95, impulse),
                tags: [p.brand, p.category, ...p.title.split(' ')].filter(Boolean)
            };
        });

        // --- STATIC FALLBACK LIBRARY (Expanded) ---
        // High-quality Unsplash source URLs to ensure matching images even if API fails
        const STATIC_IMAGES: Record<string, string[]> = {
            laptop: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=500&q=80'],
            phone: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80', 'https://images.unsplash.com/photo-1598327105666-5b89351aff23?w=500&q=80'],
            tablet: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80', 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500&q=80'],
            audio: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&q=80'], 
            watch: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&q=80'],
            console: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&q=80'],
            accessory: ['https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500&q=80'],

            shoe: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&q=80'],
            shirt: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80'],
            pants: ['https://images.unsplash.com/photo-1542272617-08f08630329e?w=500&q=80', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&q=80'],
            bag: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&q=80', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&q=80'],
            dress: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80', 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=500&q=80'],
            glasses: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80'],
            jewellery: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&q=80', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80'],

            beauty: ['https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=500&q=80', 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=500&q=80'],
            
            furniture: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80', 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&q=80'],
            appliance: ['https://images.unsplash.com/photo-1584622050111-993a426fbf0a?w=500&q=80', 'https://images.unsplash.com/photo-1544983584-a1318f772e0a?w=500&q=80'],
            
            automotive: ['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=500&q=80', 'https://images.unsplash.com/photo-1552084675-520e17c0b06b?w=500&q=80'],
            
            generic: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80']
        };

        // --- Generate Extra Products for Popular Brands ---
        const POPULAR_BRANDS = [
            { name: 'Apple', category: 'Electronics', items: ['iPhone 15 Pro', 'MacBook Air M3', 'iPad Air 5', 'AirPods Max', 'Watch Series 9'] },
            { name: 'Sony', category: 'Electronics', items: ['WH-1000XM5 Headphones', 'PlayStation 5', 'Alpha 7 Camera', 'LinkBuds S'] },
            { name: 'Samsung', category: 'Electronics', items: ['Galaxy S24 Ultra', 'Galaxy Tab S9', 'Galaxy Watch 6', 'Buds2 Pro'] },
            { name: 'Nike', category: 'Fashion', items: ['Air Force 1', 'Tech Fleece Hoodie', 'Pegasus 40', 'Dunk Low Retro'] },
            { name: 'Adidas', category: 'Fashion', items: ['Ultraboost Light', 'Samba OG', 'Adicolor Tracksuit', 'Gazelle Indoor'] },
            { name: 'Zara', category: 'Fashion', items: ['Oversized Blazer', 'Wide Leg Trousers', 'Leather Jacket', 'Knit Sweater'] },
            { name: 'H&M', category: 'Fashion', items: ['Regular Fit Hoodie', 'Cargo Trousers', 'Cotton T-Shirt', 'Relaxed Fit Jeans'] },
            { name: 'Dyson', category: 'Home', items: ['V15 Detect Absolute', 'Supersonic Hair Dryer'] },
        ];

        // Helper: Select a consistent image set based on keyword matching
        const getImageSet = (name: string, category: string): string[] => {
            const n = name.toLowerCase();
            let targetPool: string[][] = [];
            let staticFallback: string[] = [];

            if (category === 'Electronics') {
                if (n.includes('laptop') || n.includes('macbook') || n.includes('book')) {
                    targetPool = imageSets.laptops;
                    staticFallback = STATIC_IMAGES.laptop;
                } else if (n.includes('tab') || n.includes('ipad')) {
                    targetPool = imageSets.tablets;
                    staticFallback = STATIC_IMAGES.tablet;
                } else if (n.includes('phone') || n.includes('iphone') || n.includes('galaxy')) {
                    targetPool = imageSets.smartphones;
                    staticFallback = STATIC_IMAGES.phone;
                } else if (n.includes('watch')) {
                    targetPool = imageSets.watches;
                    staticFallback = STATIC_IMAGES.watch;
                } else if (n.includes('headphone') || n.includes('bud') || n.includes('pods') || n.includes('audio') || n.includes('sony wh')) {
                    targetPool = imageSets.audio;
                    staticFallback = STATIC_IMAGES.audio;
                } else if (n.includes('playstation') || n.includes('console')) {
                    staticFallback = STATIC_IMAGES.console;
                } else {
                    targetPool = imageSets.accessories;
                    staticFallback = STATIC_IMAGES.accessory; 
                }
            } else if (category === 'Fashion') {
                if (n.includes('shoe') || n.includes('sneaker') || n.includes('boot') || n.includes('runner') || n.includes('air force') || n.includes('jordan') || n.includes('dunk') || n.includes('samba') || n.includes('gazelle')) {
                    targetPool = imageSets.shoes;
                    staticFallback = STATIC_IMAGES.shoe;
                } else if (n.includes('shirt') || n.includes('hoodie') || n.includes('top') || n.includes('jacket') || n.includes('coat') || n.includes('blazer') || n.includes('sweater') || n.includes('tracksuit')) {
                    targetPool = imageSets.shirts;
                    staticFallback = STATIC_IMAGES.shirt;
                } else if (n.includes('bag') || n.includes('purse') || n.includes('handbag')) {
                    targetPool = imageSets.bags;
                    staticFallback = STATIC_IMAGES.bag;
                } else if (n.includes('dress') || n.includes('skirt') || n.includes('gown')) {
                    targetPool = imageSets.dresses;
                    staticFallback = STATIC_IMAGES.dress;
                } else if (n.includes('trouser') || n.includes('jean') || n.includes('pant') || n.includes('cargo') || n.includes('legging')) {
                    // API often lacks pants, use strict static fallback
                    staticFallback = STATIC_IMAGES.pants;
                } else if (n.includes('glass')) {
                    targetPool = imageSets.glasses;
                    staticFallback = STATIC_IMAGES.glasses;
                } else if (n.includes('jewel') || n.includes('ring') || n.includes('necklace')) {
                    targetPool = imageSets.jewellery;
                    staticFallback = STATIC_IMAGES.jewellery;
                }
            } else if (category === 'Beauty') {
                targetPool = imageSets.beauty;
                staticFallback = STATIC_IMAGES.beauty;
            } else if (category === 'Home') {
                if (n.includes('dyson') || n.includes('vacuum') || n.includes('dryer')) {
                    staticFallback = STATIC_IMAGES.appliance;
                } else {
                    targetPool = imageSets.home;
                    staticFallback = STATIC_IMAGES.furniture;
                }
            } else if (category === 'Automotive') {
                targetPool = imageSets.automotive;
                staticFallback = STATIC_IMAGES.automotive;
            }

            // 1. Try to pick from API pool if available
            if (targetPool && targetPool.length > 0) {
                 return targetPool[Math.floor(Math.random() * targetPool.length)];
            }

            // 2. Use Static Fallback (High Quality Unsplash) if API missed
            if (staticFallback && staticFallback.length > 0) {
                return staticFallback;
            }

            // 3. Absolute Last Resort: Generic Product Image
            return STATIC_IMAGES.generic;
        };

        const extraProducts: Product[] = [];
        const TOTAL_NEW_ITEMS = 250;

        for (let i = 0; i < TOTAL_NEW_ITEMS; i++) {
            const brand = POPULAR_BRANDS[Math.floor(Math.random() * POPULAR_BRANDS.length)];
            const itemBase = brand.items[Math.floor(Math.random() * brand.items.length)];
            const newId = 1000 + i; 
            const basePrice = brand.category === 'Electronics' ? 350 : 60;
            const priceVariance = Math.random() * 2;
            const finalPrice = Math.floor(basePrice * (0.5 + priceVariance));
            
            // Get a Consistent Image Set
            const productTitle = `${brand.name} ${itemBase}`;
            const productImages = getImageSet(productTitle, brand.category);

            let impulse = 0.5 + (Math.random() * 0.45);
            if (['Apple', 'Nike', 'Sony', 'Adidas'].includes(brand.name)) impulse += 0.05;

            extraProducts.push({
                id: newId,
                title: productTitle,
                brand: brand.name, // Explicit brand set
                price: finalPrice,
                category: brand.category,
                images: productImages,
                description: `Experience the premium quality of ${brand.name}. This ${itemBase} features state-of-the-art design and performance.`,
                impulseFactor: Math.min(0.99, impulse),
                tags: [brand.name, brand.category, itemBase.split(' ')[0], 'Trending']
            });
        }

        const allProducts = [...mappedProducts, ...extraProducts].sort(() => Math.random() - 0.5);
        setProducts(allProducts);

      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // --- 2. Robust Camera Stream Handling ---
  useEffect(() => {
    let localStream: MediaStream | null = null;
    let isActive = true;

    const startCamera = async () => {
      setCameraError(null);
      if (!settings.enableCamera) return;

      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera not supported");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 320 }, 
                height: { ideal: 240 },
                facingMode: "user" 
            } 
        });

        // Prevent race condition: if component unmounted while awaiting
        if (!isActive) {
           stream.getTracks().forEach(t => t.stop());
           return;
        }

        localStream = stream;
        
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Explicitly play to prevent frozen frames or black screen
            videoRef.current.play().catch(e => {
                console.error("Video play failed:", e);
                setCameraError("Playback Error");
            });
        }
      } catch (err: any) {
        console.error("Camera access denied:", err);
        setCameraError("Permission Denied");
      }
    };

    startCamera();
    
    return () => {
        isActive = false;
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };
  }, [settings.enableCamera]);

  // --- 3. Impulse Engine Loop & Excitement History ---
  useEffect(() => {
    const hour = new Date().getHours();
    const isHighRisk = hour >= 22 || hour <= 4;
    setImpulseState(prev => ({ ...prev, sessionHighRisk: isHighRisk }));

    const interval = setInterval(() => {
        setImpulseState((prev) => {
            // Update Excitement History
            
            // Calculate new score first
            let newScore = prev.score;
            let level = prev.level;
            
            if (prev.level < InterventionLevel.L3_BREATHING) {
               if (activeTab === 'mall' || prev.score > 0.05) {
                  const delta = calculateImpulseDelta(prev.score, false, false, prev.level > 0);
                  newScore = Math.max(0, Math.min(1, prev.score + delta));
                  level = getLevelFromScore(newScore);
               }
            }

            // Update Excitement History
            // Scale 0-1 score to 0-10 Excitement Index for visualization
            const excitementValue = newScore * 10;
            
            setExcitementHistory(prevHistory => {
               // Detect specific trigger events for marking (Rising Edge of Impulse Level)
               const prevLevel = prevLevelRef.current;
               let triggerInfo = undefined;
               
               // Logic: If level increases (e.g. L0->L1, L1->L2), mark it.
               if (level > prevLevel && level > InterventionLevel.L0_NORMAL) {
                    const now = new Date();
                    // Format timestamp HH:mm
                    const timestampLabel = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                    const productName = currentProductRef.current ? currentProductRef.current.title : 'Browsing';
                    
                    let reason = `Extended viewing of ${productName}`;
                    if (level >= 3) reason = `High intensity interaction with ${productName}`;
                    if (level >= 4) reason = `Rapid browsing + Repeated visits to ${currentProductRef.current?.brand || 'Brand'}`;

                    triggerInfo = {
                        level,
                        productName,
                        reason,
                        timestampLabel
                    };
               }
               // Update ref
               prevLevelRef.current = level;

               const newPoint: ExcitementDataPoint = { 
                   timestamp: Date.now(), 
                   score: excitementValue,
                   triggerInfo // Attach optional trigger info
               };
               const newHist = [...prevHistory, newPoint];
               // Increased from 30 to 300 to allow historical scrolling/playback
               if (newHist.length > 300) newHist.shift(); 
               return newHist;
            });

            return { 
                ...prev, 
                score: newScore, 
                level,
                isShopping: activeTab === 'mall' 
            };
        });
    }, 1000); // 1-second interval
    return () => clearInterval(interval);
  }, [activeTab]);

  // --- 4. Analytics Tracking Helpers ---
  const handleTrackView = useCallback((productId: number, durationSeconds: number) => {
      // Find product to get metadata
      const product = products.find(p => p.id === productId);
      if (!product) return;

      setUserAnalytics(prev => {
          const currentRecord = prev.interactions[productId] || {
              productId: product.id,
              brand: product.brand,
              category: product.category,
              totalViewTimeSeconds: 0,
              viewCount: 0,
              isAddedToCart: false,
              isFavorited: false,
              lastInteraction: new Date().toISOString()
          };

          return {
              ...prev,
              interactions: {
                  ...prev.interactions,
                  [productId]: {
                      ...currentRecord,
                      viewCount: currentRecord.viewCount + 1,
                      totalViewTimeSeconds: currentRecord.totalViewTimeSeconds + durationSeconds,
                      lastInteraction: new Date().toISOString()
                  }
              }
          };
      });
      console.log(`[Analytics] Viewed ${product.brand} - ${product.title} for ${durationSeconds.toFixed(1)}s`);
  }, [products]);

  // --- Interaction Handlers ---
  const handleScroll = () => {
    setImpulseState(prev => {
        if (prev.level >= InterventionLevel.L3_BREATHING) return prev;
        const newScore = Math.min(1, prev.score + 0.002);
        return { ...prev, score: newScore, level: getLevelFromScore(newScore) };
    });
  };

  const handleClick = () => {
     setImpulseState(prev => {
        if (prev.level >= InterventionLevel.L3_BREATHING) return prev;
        const newScore = Math.min(1, prev.score + 0.05);
        return { ...prev, score: newScore, level: getLevelFromScore(newScore) };
    });
  };

  const handleReduceScore = (amount: number) => {
    setImpulseState(prev => {
        const newScore = Math.max(0, prev.score - amount);
        return { ...prev, score: newScore, level: getLevelFromScore(newScore) };
    });
  };

  // --- Data Handlers ---
  const handleAddToCart = (product: Product) => {
    setCart(prev => {
        const existing = prev.find(item => item.product.id === product.id);
        if (existing) return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
        return [...prev, { product, quantity: 1, addedAt: Date.now() }];
    });
    
    // Trigger Impulse Spike on Add to Cart
    setImpulseState(prev => {
         const newScore = Math.min(1, prev.score + 0.25); // Big jump
         const newLevel = getLevelFromScore(newScore);
         
         // Explicitly log this event with a REASON
         setExcitementHistory(hist => {
             const now = new Date();
             const timestampLabel = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
             
             return [...hist, {
                 timestamp: Date.now(),
                 score: newScore * 10,
                 triggerInfo: {
                     level: newLevel > 0 ? newLevel : InterventionLevel.L2_GRAYSCALE, // Force at least L2 for cart events
                     productName: product.title,
                     reason: "Rapid Add to Cart + High Interest",
                     timestampLabel
                 }
             }];
         });

         return { ...prev, score: newScore, level: newLevel };
    });
  };

  const handleUpdateCart = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
        if (item.product.id === productId) {
            return { ...item, quantity: Math.max(0, item.quantity + delta) };
        }
        return item;
    }).filter(item => item.quantity > 0));
  };

  const handleCheckout = () => {
    const newOrder: Order = {
        id: `ORD-${Math.floor(Math.random() * 10000)}`,
        date: new Date().toISOString(),
        items: cart.map(item => ({
            product: item.product,
            quantity: item.quantity,
            purchaseMetadata: {
                impulseScore: impulseState.score,
                dwellTime: Math.random() * 120 + 30, // Mock
                timeToBuySeconds: (Date.now() - item.addedAt) / 1000
            }
        })),
        total: cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    };
    
    // Update Purchase History Analytics
    setUserAnalytics(prev => {
        const newRecords = newOrder.items.map(item => ({
            orderId: newOrder.id,
            productId: item.product.id,
            brand: item.product.brand,
            category: item.product.category,
            purchaseTime: newOrder.date,
            price: item.product.price
        }));
        return {
            ...prev,
            purchaseHistory: [...prev.purchaseHistory, ...newRecords]
        };
    });

    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
  };

  const handleViewProduct = (product: Product) => {
    currentProductRef.current = product; // Track context for triggers
    setHistory(prev => {
        const filtered = prev.filter(p => p.id !== product.id);
        return [product, ...filtered].slice(0, 20);
    });
    // Viewing product increases impulse slightly
    setImpulseState(prev => {
        if (prev.level >= InterventionLevel.L3_BREATHING) return prev;
        const newScore = Math.min(1, prev.score + 0.05);
        return { ...prev, score: newScore, level: getLevelFromScore(newScore) };
    });
  };

  const handleNavigateHome = () => {
    currentProductRef.current = null; // Clear context
  };

  const toggleFavorite = (productId: number) => {
    setFavorites(prev => {
        if (prev.includes(productId)) return prev.filter(id => id !== productId);
        return [...prev, productId];
    });
    
    // Track analytic event
    setUserAnalytics(prev => {
        const p = products.find(prod => prod.id === productId);
        if (!p) return prev;
        const currentRecord = prev.interactions[productId] || {
            productId: p.id, brand: p.brand, category: p.category,
            totalViewTimeSeconds: 0, viewCount: 0, isAddedToCart: false, isFavorited: false, lastInteraction: new Date().toISOString()
        };
        return {
            ...prev,
            interactions: {
                ...prev.interactions,
                [productId]: { ...currentRecord, isFavorited: true, lastInteraction: new Date().toISOString() }
            }
        };
    });
  };

  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2 text-orange-500" />
                <p className="text-xs">Loading Store Environment...</p>
            </div>
        );
    }

    switch (activeTab) {
      case 'home':
        return <HomeDashboard state={impulseState} onNavigateToMall={() => setActiveTab('mall')} excitementHistory={excitementHistory} />;
      case 'mall':
        return (
          <ShoppingMall 
            products={products}
            onScrollAction={handleScroll}
            onClickAction={handleClick}
            cart={cart}
            orders={orders}
            history={history}
            favorites={favorites}
            onAddToCart={handleAddToCart}
            onUpdateCart={handleUpdateCart}
            onCheckout={handleCheckout}
            onViewProduct={handleViewProduct}
            onNavigateHome={handleNavigateHome}
            onToggleFavorite={toggleFavorite}
            onTrackView={handleTrackView}
          />
        );
      case 'insights':
        return <InsightsView orders={orders} interventionEvents={interventionHistory} userAnalytics={userAnalytics} />;
      case 'settings':
        return <SettingsView settings={settings} />;
      default:
        return <HomeDashboard state={impulseState} onNavigateToMall={() => setActiveTab('mall')} excitementHistory={excitementHistory} />;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-gray-100 font-sans relative">
      {/* --- Overlay: Intervention Layer --- */}
      <InterventionManager level={impulseState.level} onReduceScore={handleReduceScore} />

      {/* --- Overlay: Front Camera Monitor (Draggable) --- */}
      {settings.enableCamera && (
          <DraggableOverlay initialClass="fixed top-4 right-4 w-28 h-36 bg-black rounded-xl overflow-hidden shadow-lg border border-gray-800/50">
             <div className="relative w-full h-full">
                 <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover opacity-80"
                 />
                 
                 {/* Monitor Overlay UI */}
                 <div className="absolute inset-0 flex flex-col justify-between p-2">
                     <div className="flex justify-between items-start">
                         <div className="flex items-center space-x-1">
                             <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                             <span className="text-[8px] text-white/70 font-mono">REC</span>
                         </div>
                     </div>
                     
                     {/* Face Mesh Simulation */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-16 border border-white/20 rounded-full"></div>
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-green-400/50 rounded-full"></div>

                     <div className="space-y-0.5">
                         <div className="flex justify-between text-[7px] text-white/60 font-mono">
                             <span>ARO</span>
                             <span className={impulseState.score > 0.6 ? 'text-red-400' : 'text-green-400'}>
                                 {(impulseState.score * 100).toFixed(0)}%
                             </span>
                         </div>
                         <div className="flex justify-between text-[7px] text-white/60 font-mono">
                             <span>GAZE</span>
                             <span className="text-blue-400">CTR</span>
                         </div>
                     </div>
                     
                     {cameraError && (
                         <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                             <span className="text-[8px] text-red-400 text-center px-2">{cameraError}</span>
                         </div>
                     )}
                 </div>
             </div>
          </DraggableOverlay>
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <nav className="flex-none bg-white border-t border-gray-200 pb-safe">
        <div className="flex justify-around items-center h-16">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'home' ? 'text-orange-600' : 'text-gray-400'}`}
          >
            <Home size={22} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-1">Home</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('mall')}
            className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'mall' ? 'text-orange-600' : 'text-gray-400'}`}
          >
            <ShoppingBag size={22} strokeWidth={activeTab === 'mall' ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-1">Mall</span>
          </button>

          <button 
            onClick={() => setActiveTab('insights')}
            className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'insights' ? 'text-orange-600' : 'text-gray-400'}`}
          >
            <BarChart2 size={22} strokeWidth={activeTab === 'insights' ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-1">Insights</span>
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'settings' ? 'text-orange-600' : 'text-gray-400'}`}
          >
            <User size={22} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-1">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
