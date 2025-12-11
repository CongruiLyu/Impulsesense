import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useImpulse } from '../hooks/useImpulseEngine';
import { getLevelFromScore } from '../services/impulseEngine';
import { Product, CartItem, Order } from '../types';
import ProductCard from '../components/ProductCard';

type SubTab = 'home' | 'cart' | 'orders' | 'favorites' | 'history';
const CATEGORIES = ['Recommended', 'Electronics', 'Fashion', 'Home', 'Beauty', 'Groceries'];

export default function MallScreen() {
  const { state, setState, setCurrentProduct } = useImpulse();
  const [activeTab, setActiveTab] = useState<SubTab>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Recommended');
  const [selected, setSelected] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [history, setHistory] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('https://dummyjson.com/products?limit=100');
        const data = await res.json();
        const mapped: Product[] = data.products.map((p: any) => ({
          id: p.id,
          title: p.title,
          brand: p.brand || 'Generic',
          price: p.price,
          category:
            p.category.includes('shoe')
              ? 'Fashion'
              : p.category.includes('laptop') || p.category.includes('phone')
              ? 'Electronics'
              : 'Recommended',
          images: p.images?.length ? p.images : [p.thumbnail],
          description: p.description,
          impulseFactor: Math.random() * 0.9,
          tags: [p.brand, p.category, ...p.title.split(' ')].filter(Boolean),
        }));
        setProducts(mapped);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      const matchCat = category === 'Recommended' || p.category === category;
      const matchSearch = !q || p.title.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [products, search, category]);

  const cartCount = cart.reduce((a, b) => a + b.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  const bumpImpulse = (delta: number) => {
    setState((prev: any) => {
      const score = Math.min(1, prev.score + delta);
      return { ...prev, score, level: getLevelFromScore(score), isShopping: true };
    });
  };

  const onAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) return prev.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...prev, { product, quantity: 1, addedAt: Date.now() }];
    });
    bumpImpulse(0.25);
  };

  const onCheckout = () => {
    const order: Order = {
      id: `ORD-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString(),
      items: cart.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        purchaseMetadata: {
          impulseScore: state.score,
          dwellTime: Math.random() * 120 + 30,
          timeToBuySeconds: (Date.now() - item.addedAt) / 1000,
        },
      })),
      total: cart.reduce((s, i) => s + i.product.price * i.quantity, 0),
    };
    setOrders((prev) => [order, ...prev]);
    setCart([]);
  };

  const onViewProduct = (p: Product) => {
    setCurrentProduct(p);
    setHistory((prev) => [p, ...prev.filter((x) => x.id !== p.id)].slice(0, 20));
    bumpImpulse(0.05);
  };

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const renderDetail = () => {
    if (!selected) return null;
    const isFav = favorites.includes(selected.id);
    return (
      <Modal visible transparent animationType="slide">
        <View style={styles.detailBackdrop}>
          <View style={styles.detailCard}>
            <ScrollView>
              <Image source={{ uri: selected.images[0] }} style={styles.detailImg} resizeMode="contain" />
              <Text style={styles.detailBrand}>{selected.brand}</Text>
              <Text style={styles.detailTitle}>{selected.title}</Text>
              <Text style={styles.detailPrice}>${selected.price}</Text>
              <Text style={styles.detailDesc}>{selected.description}</Text>
            </ScrollView>
            <View style={styles.detailActions}>
              <TouchableOpacity onPress={() => toggleFavorite(selected.id)} style={styles.favBtn}>
                <Text style={{ color: isFav ? '#ef4444' : '#666' }}>{isFav ? '♥' : '♡'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  onAddToCart(selected);
                  setSelected(null);
                  setActiveTab('cart');
                }}
                style={styles.buyBtn}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Add to Cart</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelected(null)} style={styles.closeBtn}>
                <Text style={{ color: '#111' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderContent = () => {
    if (activeTab === 'home') {
      return (
        <View style={{ flex: 1 }}>
          <View style={styles.searchRow}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search products..."
              style={styles.search}
              onFocus={() => bumpImpulse(0.01)}
            />
            <TouchableOpacity onPress={() => setActiveTab('cart')}>
              <Text style={styles.cartBtn}>Cart ({cartCount})</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => {
                  setCategory(cat);
                  bumpImpulse(0.01);
                }}
                style={[styles.chip, category === cat && styles.chipActive]}
              >
                <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {loading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color="#f97316" />
            </View>
          ) : filtered.length === 0 ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text>No products</Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              numColumns={2}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  onPress={() => {
                    setSelected(item);
                    onViewProduct(item);
                  }}
                />
              )}
              contentContainerStyle={{ paddingBottom: 120 }}
            />
          )}
        </View>
      );
    }

    if (activeTab === 'cart') {
      return (
        <View style={{ flex: 1, padding: 12 }}>
          {cart.length === 0 ? (
            <Text>Your cart is empty</Text>
          ) : (
            <>
              <FlatList
                data={cart}
                keyExtractor={(item) => item.product.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.cartRow}>
                    <Image source={{ uri: item.product.images[0] }} style={styles.cartImg} />
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={1} style={{ fontWeight: '600' }}>
                        {item.product.title}
                      </Text>
                      <Text style={{ color: '#666' }}>${item.product.price}</Text>
                    </View>
                    <Text style={{ marginHorizontal: 8 }}>x{item.quantity}</Text>
                  </View>
                )}
              />
              <View style={styles.checkoutBar}>
                <Text style={{ fontWeight: '700' }}>${cartTotal.toFixed(2)}</Text>
                <TouchableOpacity style={styles.checkoutBtn} onPress={onCheckout}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Checkout</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      );
    }

    if (activeTab === 'favorites') {
      return (
        <View style={{ flex: 1, padding: 12 }}>
          <FlatList
            data={favoriteProducts}
            numColumns={2}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <ProductCard product={item} onPress={() => { setSelected(item); onViewProduct(item); }} />}
            ListEmptyComponent={<Text>No favorites</Text>}
          />
        </View>
      );
    }

    if (activeTab === 'orders') {
      return (
        <View style={{ flex: 1, padding: 12 }}>
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.orderCard}>
                <Text style={{ fontSize: 12, color: '#666' }}>{item.id}</Text>
                <Text style={{ fontWeight: '700' }}>${item.total.toFixed(2)}</Text>
                <Text style={{ color: '#666' }}>{new Date(item.date).toLocaleDateString()}</Text>
              </View>
            )}
            ListEmptyComponent={<Text>No orders yet</Text>}
          />
        </View>
      );
    }

    if (activeTab === 'history') {
      return (
        <View style={{ flex: 1, padding: 12 }}>
          <FlatList
            data={history}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.historyRow}>
                <Image source={{ uri: item.images[0] }} style={styles.historyImg} />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={{ fontWeight: '600' }}>
                    {item.title}
                  </Text>
                  <Text style={{ color: '#666' }}>{item.brand}</Text>
                </View>
                <Text style={{ color: '#e11d48' }}>${item.price}</Text>
              </View>
            )}
            ListEmptyComponent={<Text>No history</Text>}
          />
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {renderDetail()}
      <View style={styles.tabBar}>
        {(['home', 'favorites', 'cart', 'orders', 'history'] as SubTab[]).map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={styles.tabBtn}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabActive]}>{tab.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7', paddingTop: 50 },
  tabBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  tabBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  tabText: { color: '#666', fontSize: 12, fontWeight: '600' },
  tabActive: { color: '#f97316' },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginVertical: 8 },
  search: { flex: 1, backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#eee' },
  cartBtn: { marginLeft: 10, color: '#f97316', fontWeight: '700' },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: '#eee', marginHorizontal: 6, marginVertical: 6 },
  chipActive: { backgroundColor: '#fef3c7', borderWidth: 1, borderColor: '#f97316' },
  chipText: { color: '#666', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#f97316' },
  detailBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  detailCard: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '90%' },
  detailImg: { width: '100%', height: 260, backgroundColor: '#f8f8f8' },
  detailBrand: { fontSize: 12, color: '#f97316', marginHorizontal: 16, marginTop: 12, fontWeight: '700' },
  detailTitle: { fontSize: 18, fontWeight: '700', marginHorizontal: 16, marginTop: 4 },
  detailPrice: { fontSize: 20, fontWeight: '800', color: '#e11d48', marginHorizontal: 16, marginTop: 6 },
  detailDesc: { margin: 16, color: '#444', lineHeight: 20 },
  detailActions: { flexDirection: 'row', alignItems: 'center', padding: 16, borderTopWidth: 1, borderColor: '#eee' },
  favBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', marginRight: 10 },
  buyBtn: { flex: 1, backgroundColor: '#f97316', padding: 12, borderRadius: 10, alignItems: 'center', marginRight: 8 },
  closeBtn: { padding: 12, borderRadius: 10, backgroundColor: '#eee', alignItems: 'center' },
  cartRow: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#fff', borderRadius: 10, marginVertical: 6 },
  cartImg: { width: 60, height: 60, marginRight: 10, borderRadius: 8, backgroundColor: '#f5f5f5' },
  checkoutBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderRadius: 12, marginTop: 10 },
  checkoutBtn: { backgroundColor: '#111', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  orderCard: { padding: 12, backgroundColor: '#fff', borderRadius: 10, marginVertical: 6 },
  historyRow: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#fff', borderRadius: 10, marginVertical: 6 },
  historyImg: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#f5f5f5', marginRight: 10 },
});

