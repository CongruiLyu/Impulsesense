import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Product } from '../types';

export default function ProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: product.images[0] }} style={styles.img} resizeMode="contain" />
      <Text numberOfLines={2} style={styles.title}>
        {product.title}
      </Text>
      <Text style={styles.brand}>{product.brand}</Text>
      <Text style={styles.price}>${product.price}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    margin: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  img: { width: '100%', height: 120, backgroundColor: '#f8f8f8', borderRadius: 10 },
  title: { marginTop: 6, fontSize: 12, fontWeight: '600', color: '#222' },
  brand: { fontSize: 10, color: '#888', marginTop: 2 },
  price: { marginTop: 6, fontSize: 14, fontWeight: '700', color: '#e11d48' },
});

