export enum InterventionLevel {
  L0_NORMAL = 0,
  L1_REFLECTION = 1,
  L2_GRAYSCALE = 2,
  L3_BREATHING = 3,
  L4_MICRO_LOCK = 4,
  L5_SAFE_MODE = 5,
}

export interface ImpulseState {
  score: number;
  level: InterventionLevel;
  isShopping: boolean;
  dailyBrowseTimeMinutes: number;
  sessionHighRisk: boolean;
}

export interface ExcitementDataPoint {
  timestamp: number;
  score: number; // 0-10
  triggerInfo?: {
    level: InterventionLevel;
    productName: string;
    reason: string;
    timestampLabel: string;
  };
}

export interface Product {
  id: number;
  title: string;
  brand: string;
  price: number;
  category: string;
  images: string[];
  description: string;
  impulseFactor: number;
  tags: string[];
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

