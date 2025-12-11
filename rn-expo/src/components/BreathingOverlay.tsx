import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';

export default function BreathingOverlay({ onComplete }: { onComplete: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.35, duration: 4000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.9, duration: 4000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scale]);

  return (
    <View style={styles.backdrop}>
      <Animated.View style={[styles.circle, { transform: [{ scale }] }]} />
      <Text style={styles.text}>Breathe</Text>
      <TouchableOpacity onPress={onComplete} style={styles.btn}>
        <Text style={styles.btnText}>I am calm now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center' },
  circle: { width: 180, height: 180, borderRadius: 90, backgroundColor: '#7fa0bc', opacity: 0.9 },
  text: { color: 'white', fontSize: 24, marginTop: 20, letterSpacing: 2 },
  btn: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: 'white', borderRadius: 999 },
  btnText: { color: '#111', fontWeight: '600' },
});

