import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Product } from '../types';

export default function ProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.images[0] }} style={styles.img} resizeMode="contain" />
        {product.impulseFactor > 0.7 && (
          <View style={styles.hotBadge}>
            <Text style={styles.hotText}>HOT</Text>
          </View>
        )}
      </View>
      <Text style={styles.brand}>{product.brand}</Text>
      <Text numberOfLines={2} style={styles.title}>{product.title}</Text>
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
    maxWidth: '48%'
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 6
  },
  img: { 
    width: '100%', 
    height: '100%'
  },
  hotBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  hotText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700'
  },
  brand: { 
    fontSize: 10, 
    color: '#888', 
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  title: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: '#222',
    marginBottom: 4,
    minHeight: 32
  },
  price: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#e11d48' 
  },
});

