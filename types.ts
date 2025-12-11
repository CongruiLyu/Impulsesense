
export interface Product {
  id: number;
  title: string;
  brand: string; // Added brand tracking
  price: number;
  category: string;
  images: string[];
  description: string;
  impulseFactor: number;
  tags: string[];
}

// Analytics Data Structures for background collection
export interface ProductAnalytics {
  productId: number;
  brand: string;
  category: string;
  totalViewTimeSeconds: number;
  viewCount: number;
  isAddedToCart: boolean;
  isFavorited: boolean;
  lastInteraction: string;
}

export interface PurchaseRecord {
  orderId: string;
  productId: number;
  brand: string;
  category: string;
  purchaseTime: string;
  price: number;
}

export interface ExcitementDataPoint {
  timestamp: number;
  score: number; // 0-10 scale
  triggerInfo?: {
    level: InterventionLevel;
    productName: string;
    reason: string; // Specific reason for the trigger
    timestampLabel: string;
  };
}

export enum InterventionLevel {
  L0_NORMAL = 0,
  L1_REFLECTION = 1,
  L2_GRAYSCALE = 2,
  L3_BREATHING = 3,
  L4_MICRO_LOCK = 4,
  L5_SAFE_MODE = 5,
}

// Specific levels for granular Impulse Event Analytics (L1-L4)
export enum ImpulseLevel {
  L1_MILD = 'L1',
  L2_MODERATE = 'L2',
  L3_HIGH = 'L3',
  L4_EXTREME = 'L4'
}

export interface ImpulseEventDetail {
  id: string;
  timestamp: string;
  score: number;
  level: ImpulseLevel;
  trigger: string;
  category: string;
  brand: string;
}

export interface ImpulseState {
  score: number;
  level: InterventionLevel;
  isShopping: boolean;
  dailyBrowseTimeMinutes: number;
  sessionHighRisk: boolean;
}

export interface UserSettings {
  budget: number;
  sensitiveCategories: string[];
  enableCamera: boolean;
  enableVibration: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: number;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  purchaseMetadata: {
    impulseScore: number;
    dwellTime: number;
    timeToBuySeconds: number;
  };
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
}

export interface InterventionEvent {
  id: string;
  timestamp: string;
  level: InterventionLevel;
}

export const MOCK_CATEGORIES = [
  { name: 'Fashion', budget: 500, spent: 300, color: '#FF8042' },
  { name: 'Electronics', budget: 800, spent: 200, color: '#0088FE' },
  { name: 'Beauty', budget: 300, spent: 150, color: '#00C49F' },
  { name: 'Home', budget: 400, spent: 50, color: '#FFBB28' },
];

export const IMPULSE_HISTORY = [
  { day: 'Mon', score: 0.2 },
  { day: 'Tue', score: 0.4 },
  { day: 'Wed', score: 0.8 },
  { day: 'Thu', score: 0.3 },
  { day: 'Fri', score: 0.6 },
  { day: 'Sat', score: 0.9 },
  { day: 'Sun', score: 0.5 },
];
