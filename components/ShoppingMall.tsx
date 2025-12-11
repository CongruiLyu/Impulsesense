
import React, { useState, useEffect } from 'react';
import { Product, CartItem, Order } from '../types';
import { Search, ShoppingCart, Star, ChevronLeft, ChevronRight, Package, CreditCard, History, ArrowLeft, Loader2, Heart } from 'lucide-react';

interface Props {
  products: Product[];
  onScrollAction: () => void;
  onClickAction: () => void;
  cart: CartItem[];
  orders: Order[];
  history: Product[];
  favorites: number[];
  onAddToCart: (product: Product) => void;
  onUpdateCart: (productId: number, delta: number) => void;
  onCheckout: () => void;
  onViewProduct: (product: Product) => void;
  onNavigateHome: () => void;
  onToggleFavorite: (productId: number) => void;
  onTrackView: (productId: number, durationSeconds: number) => void;
}

type SubTab = 'home' | 'cart' | 'orders' | 'history' | 'favorites';
const CATEGORIES = ['Recommended', 'Electronics', 'Fashion', 'Home', 'Beauty', 'Groceries'];

// Standalone ProductCard component
const ProductCard: React.FC<{ product: Product; onClick: () => void }> = ({ product, onClick }) => (
  <div 
      className="break-inside-avoid bg-white rounded-lg shadow-sm overflow-hidden active:scale-[0.98] transition-transform duration-200 mb-3"
      onClick={onClick}
  >
      <div className="relative aspect-square bg-gray-100">
          <img 
              src={product.images[0]} 
              alt={product.title} 
              className="w-full h-full object-contain p-2"
              loading="lazy"
          />
          {product.impulseFactor > 0.7 && (
              <div className="absolute top-2 left-2 bg-red-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                  HOT
              </div>
          )}
      </div>
      <div className="p-3">
          <div className="flex justify-between items-start">
             <div className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider">{product.brand}</div>
          </div>
          <h3 className="text-xs font-medium text-gray-800 leading-snug line-clamp-2 mb-2 h-8">{product.title}</h3>
          
          <div className="flex items-center space-x-1 mb-2">
              {[1,2,3,4,5].map(s => <Star key={s} className="w-2.5 h-2.5 text-yellow-400 fill-current" />)}
              <span className="text-[10px] text-gray-400 ml-1">({product.id * 12})</span>
          </div>

          <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-red-600">
                  <span className="text-[10px] mr-0.5">$</span>{product.price}
              </span>
          </div>
      </div>
  </div>
);

const ShoppingMall: React.FC<Props> = ({ 
  products, 
  onScrollAction, 
  onClickAction, 
  cart, 
  orders,
  history,
  favorites,
  onAddToCart,
  onUpdateCart,
  onCheckout,
  onViewProduct,
  onNavigateHome,
  onToggleFavorite,
  onTrackView
}) => {
  const [activeTab, setActiveTab] = useState<SubTab>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Recommended');
  
  // Carousel State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Filter Logic
  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategory === 'Recommended' || p.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchSearch = !query || 
        p.title.toLowerCase().includes(query) || 
        p.tags.some(tag => tag.toLowerCase().includes(query));
    
    return matchCategory && matchSearch;
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  // --- Analytics: Track View Duration ---
  useEffect(() => {
    let startTime: number | null = null;
    let currentId: number | null = null;

    if (selectedProduct) {
        startTime = Date.now();
        currentId = selectedProduct.id;
    }

    return () => {
        if (startTime && currentId !== null) {
            const duration = (Date.now() - startTime) / 1000;
            onTrackView(currentId, duration);
        }
    };
  }, [selectedProduct, onTrackView]);

  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    const isFavorite = favorites.includes(selectedProduct.id);

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-fade-in">
            <div className="absolute top-4 left-4 z-10">
                <button onClick={() => setSelectedProduct(null)} className="w-8 h-8 bg-black/50 backdrop-blur text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
                    <ChevronLeft size={20} />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pb-24">
                {/* Main Image Carousel */}
                <div className="w-full h-96 bg-white relative shrink-0 group flex items-center justify-center p-8 bg-gray-50/50">
                    <img 
                      src={selectedProduct.images[currentImageIndex]} 
                      className="max-w-full max-h-full object-contain transition-opacity duration-300 drop-shadow-sm" 
                      alt="" 
                    />
                    
                    {selectedProduct.images.length > 1 && (
                        <>
                          <button 
                              onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentImageIndex(prev => prev === 0 ? selectedProduct.images.length - 1 : prev - 1);
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-100/80 hover:bg-gray-200 backdrop-blur rounded-full flex items-center justify-center text-gray-600 shadow-sm"
                          >
                              <ChevronLeft size={16} />
                          </button>
                          <button 
                              onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentImageIndex(prev => (prev + 1) % selectedProduct.images.length);
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-100/80 hover:bg-gray-200 backdrop-blur rounded-full flex items-center justify-center text-gray-600 shadow-sm"
                          >
                              <ChevronRight size={16} />
                          </button>
                          
                          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-3 py-1.5 rounded-full shadow-sm z-10 pointer-events-none">
                              {currentImageIndex + 1} / {selectedProduct.images.length}
                          </div>
                        </>
                    )}
                </div>

                <div className="flex px-4 py-3 space-x-2 overflow-x-auto no-scrollbar bg-white border-b border-gray-100">
                    {selectedProduct.images.map((img, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 bg-gray-50 transition-all ${idx === currentImageIndex ? 'border-orange-500 opacity-100 scale-105' : 'border-transparent opacity-60'}`}
                        >
                            <img src={img} className="w-full h-full object-contain" alt="" />
                        </button>
                    ))}
                </div>

                <div className="p-5 pt-4">
                    <div className="flex justify-between items-start gap-4 mb-2">
                        <div>
                             <span className="text-xs font-bold text-orange-500 uppercase tracking-wide block mb-1">{selectedProduct.brand}</span>
                             <h1 className="text-xl font-bold text-gray-900 leading-snug">{selectedProduct.title}</h1>
                        </div>
                        <button 
                            onClick={() => onToggleFavorite(selectedProduct.id)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors active:scale-90"
                        >
                            <Heart 
                                className={`w-7 h-7 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                                strokeWidth={isFavorite ? 0 : 1.5}
                            />
                        </button>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-4">
                        <span className="text-2xl font-bold text-red-600">${selectedProduct.price}</span>
                        <div className="flex items-center pl-2 border-l border-gray-200 ml-2">
                             <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                             <span className="text-sm font-medium text-gray-600">4.8</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-6">
                        {selectedProduct.tags.map((tag, i) => (
                            <span key={i} className="text-[10px] bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full uppercase tracking-wide font-medium">#{tag}</span>
                        ))}
                    </div>

                    <div className="bg-gray-50 p-5 rounded-2xl mb-6 border border-gray-100">
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Description</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{selectedProduct.description}</p>
                    </div>

                    <div className="space-y-0 divide-y divide-gray-100 mb-6">
                        <div className="flex justify-between text-sm py-4">
                            <span className="text-gray-500">Delivery</span>
                            <span className="text-gray-800 font-medium">Free Express Shipping</span>
                        </div>
                        <div className="flex justify-between text-sm py-4">
                            <span className="text-gray-500">Return Policy</span>
                            <span className="text-gray-800 font-medium">30-Day Money Back</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex items-center space-x-3 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <button className="flex flex-col items-center justify-center text-gray-400 w-12" onClick={() => { setSelectedProduct(null); setActiveTab('cart'); }}>
                    <ShoppingCart size={20} />
                    <span className="text-[10px] mt-1">Cart</span>
                </button>
                <button 
                  onClick={() => {
                      onAddToCart(selectedProduct);
                      setSelectedProduct(null); 
                      setActiveTab('cart'); 
                  }}
                  className="flex-1 bg-yellow-400 text-yellow-900 font-bold py-3 rounded-full text-sm hover:brightness-95 active:scale-[0.98] transition-all"
                >
                    Add to Cart
                </button>
                <button 
                  onClick={() => {
                      onAddToCart(selectedProduct);
                      setSelectedProduct(null);
                      setActiveTab('cart');
                  }}
                  className="flex-1 bg-red-600 text-white font-bold py-3 rounded-full text-sm shadow-lg shadow-red-200 hover:brightness-95 active:scale-[0.98] transition-all"
                >
                    Buy Now
                </button>
            </div>
        </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {selectedProduct && renderProductDetail()}

      <div 
        className="flex-1 overflow-y-auto no-scrollbar"
        onScroll={onScrollAction}
      >
        {activeTab === 'home' && (
            <>
                <div className="sticky top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-30 px-4 py-2 shadow-sm border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={onNavigateHome} 
                            className="p-1.5 -ml-1.5 text-gray-500 hover:text-gray-900 active:scale-95 transition-transform"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input 
                                type="text" 
                                placeholder="Search products, brands..." 
                                className="w-full bg-gray-100 rounded-full py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-orange-400 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={onClickAction}
                            />
                        </div>
                        <button className="relative p-1.5" onClick={() => setActiveTab('cart')}>
                            <ShoppingCart className="w-5 h-5 text-gray-700" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                    <div className="flex space-x-5 mt-2 overflow-x-auto no-scrollbar pb-1">
                        {CATEGORIES.map((cat, i) => (
                            <span 
                                key={i} 
                                className={`whitespace-nowrap text-xs font-medium px-1 pb-1 transition-colors cursor-pointer border-b-2 ${selectedCategory === cat ? 'text-orange-600 border-orange-600' : 'text-gray-500 border-transparent'}`} 
                                onClick={() => {
                                    onClickAction();
                                    setSelectedCategory(cat);
                                }}
                            >
                                {cat}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="p-3 pb-20">
                    {products.length === 0 ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <Search className="w-12 h-12 mb-2 opacity-20" />
                            <p className="text-xs">No products found for "{searchQuery}"</p>
                        </div>
                    ) : (
                        <div className="columns-2 gap-3">
                            {filteredProducts.map((p) => (
                                <ProductCard 
                                    key={p.id} 
                                    product={p} 
                                    onClick={() => {
                                        onClickAction();
                                        setSelectedProduct(p);
                                        setCurrentImageIndex(0);
                                        onViewProduct(p);
                                    }} 
                                />
                            ))}
                        </div>
                    )}
                </div>
            </>
        )}

        {activeTab === 'cart' && (
            <div className="p-4 pb-32">
                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4">
                        <ShoppingCart className="w-16 h-16 opacity-20" />
                        <p className="text-sm">Your cart is empty</p>
                        <button onClick={() => setActiveTab('home')} className="px-6 py-2 bg-orange-500 text-white text-xs rounded-full shadow-lg shadow-orange-200">Go Shopping</button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Shopping Cart ({cartCount})</h2>
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={item.product.id} className="flex bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                    <img src={item.product.images[0]} className="w-20 h-20 object-contain p-1 rounded-lg bg-gray-50" alt="" />
                                    <div className="ml-3 flex-1 flex flex-col justify-between">
                                        <div className="mb-1">
                                            <div className="text-[10px] text-gray-400 uppercase">{item.product.brand}</div>
                                            <h3 className="text-xs font-medium text-gray-800 line-clamp-2">{item.product.title}</h3>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm font-bold text-red-600">${item.product.price}</span>
                                            <div className="flex items-center bg-gray-100 rounded-lg">
                                                <button onClick={() => onUpdateCart(item.product.id, -1)} className="px-2 py-1 text-gray-500">-</button>
                                                <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => onUpdateCart(item.product.id, 1)} className="px-2 py-1 text-gray-500">+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="fixed bottom-[120px] left-4 right-4 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex justify-between items-center z-20">
                            <div>
                                <span className="text-xs text-gray-400 block">Total</span>
                                <span className="text-xl font-bold text-gray-900">${cartTotal.toFixed(2)}</span>
                            </div>
                            <button 
                                onClick={() => {
                                    setIsCheckingOut(true);
                                    setTimeout(() => {
                                        onCheckout();
                                        setIsCheckingOut(false);
                                        setActiveTab('orders');
                                    }, 2000);
                                }}
                                disabled={isCheckingOut}
                                className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-orange-200 flex items-center"
                            >
                                {isCheckingOut ? 'Processing...' : 'Checkout'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        )}

        {activeTab === 'favorites' && (
            <div className="p-4 pb-20">
                <div className="flex items-center space-x-2 mb-4">
                    <h2 className="text-lg font-bold text-gray-800">My Favorites</h2>
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                        {favoriteProducts.length}
                    </span>
                </div>
                {favoriteProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Heart className="w-12 h-12 mb-2 opacity-20" />
                        <p className="text-xs">No favorites yet</p>
                    </div>
                ) : (
                    <div className="columns-2 gap-3">
                        {favoriteProducts.map((p) => (
                            <ProductCard 
                                key={p.id} 
                                product={p} 
                                onClick={() => {
                                    onClickAction();
                                    setSelectedProduct(p);
                                    setCurrentImageIndex(0);
                                    onViewProduct(p);
                                }} 
                            />
                        ))}
                    </div>
                )}
            </div>
        )}

        {activeTab === 'orders' && (
            <div className="p-4 pb-20">
                <h2 className="text-lg font-bold text-gray-800 mb-4">My Orders</h2>
                {orders.length === 0 ? (
                    <div className="text-center text-gray-400 py-10 text-xs">No orders yet</div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-50">
                                    <span className="text-xs font-mono text-gray-400">{order.id}</span>
                                    <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">Paid</span>
                                </div>
                                <div className="flex space-x-2 overflow-x-auto no-scrollbar mb-3">
                                    {order.items.map((item, idx) => (
                                        <img key={idx} src={item.product.images[0]} className="w-12 h-12 rounded bg-gray-50 object-contain p-1 flex-shrink-0" alt="" />
                                    ))}
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</span>
                                    <span className="text-sm font-bold text-gray-900">${order.total.toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {activeTab === 'history' && (
             <div className="p-4 pb-20">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Browsing History</h2>
                <div className="grid grid-cols-1 gap-3">
                    {history.map((product, i) => (
                        <div key={i} className="flex bg-white p-3 rounded-xl shadow-sm border border-gray-100" onClick={() => { setSelectedProduct(product); onViewProduct(product); }}>
                            <img src={product.images[0]} className="w-16 h-16 rounded bg-gray-50 object-contain p-1" alt="" />
                            <div className="ml-3 flex-1">
                                <h3 className="text-xs font-medium text-gray-800 line-clamp-1">{product.title}</h3>
                                <div className="flex items-center space-x-2 mt-1">
                                     <span className="text-[10px] text-orange-500 font-medium bg-orange-50 px-1 rounded">{product.brand}</span>
                                     <span className="text-[10px] text-gray-400">{new Date().toLocaleDateString()}</span>
                                </div>
                                <span className="text-xs font-bold text-red-600 block mt-2">${product.price}</span>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
        )}
      </div>

      <div className="flex-none bg-white border-t border-gray-200 pb-1 pt-1">
        <div className="flex justify-around items-center">
            <button 
                onClick={() => setActiveTab('home')}
                className={`p-2 flex flex-col items-center ${activeTab === 'home' ? 'text-orange-600' : 'text-gray-400'}`}
            >
                <Package size={20} />
                <span className="text-[10px] font-medium mt-1">Mall</span>
            </button>
            <button 
                onClick={() => setActiveTab('favorites')}
                className={`p-2 flex flex-col items-center ${activeTab === 'favorites' ? 'text-orange-600' : 'text-gray-400'}`}
            >
                <Heart size={20} className={activeTab === 'favorites' ? 'fill-current' : ''} />
                <span className="text-[10px] font-medium mt-1">Collect</span>
            </button>
            <button 
                onClick={() => setActiveTab('cart')}
                className={`p-2 flex flex-col items-center ${activeTab === 'cart' ? 'text-orange-600' : 'text-gray-400'}`}
            >
                <div className="relative">
                    <ShoppingCart size={20} />
                    {cartCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></span>}
                </div>
                <span className="text-[10px] font-medium mt-1">Cart</span>
            </button>
            <button 
                onClick={() => setActiveTab('orders')}
                className={`p-2 flex flex-col items-center ${activeTab === 'orders' ? 'text-orange-600' : 'text-gray-400'}`}
            >
                <CreditCard size={20} />
                <span className="text-[10px] font-medium mt-1">Orders</span>
            </button>
            <button 
                onClick={() => setActiveTab('history')}
                className={`p-2 flex flex-col items-center ${activeTab === 'history' ? 'text-orange-600' : 'text-gray-400'}`}
            >
                <History size={20} />
                <span className="text-[10px] font-medium mt-1">History</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingMall;
