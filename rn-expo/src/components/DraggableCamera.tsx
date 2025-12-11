import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder } from 'react-native';
import { Camera, CameraType } from 'expo-camera';

export default function DraggableCamera({ enabled }: { enabled: boolean }) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const pos = useRef({ x: 20, y: 60 });
  const translate = useRef({ x: 0, y: 0 });
  const [, force] = useState(0);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        translate.current = { x: g.dx, y: g.dy };
        force((v) => v + 1);
      },
      onPanResponderRelease: (_, g) => {
        pos.current = { x: pos.current.x + g.dx, y: pos.current.y + g.dy };
        translate.current = { x: 0, y: 0 };
        force((v) => v + 1);
      },
    })
  ).current;

  if (!enabled) return null;
  if (hasPermission === false) {
    return (
      <View style={[styles.box, { left: pos.current.x, top: pos.current.y }]}>
        <Text style={styles.err}>No Camera</Text>
      </View>
    );
  }

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.box,
        { left: pos.current.x + translate.current.x, top: pos.current.y + translate.current.y },
      ]}
    >
      {hasPermission && <Camera style={StyleSheet.absoluteFill} type={CameraType.front} ratio="4:3" />}
      <View style={styles.overlay}>
        <View style={styles.dot} />
        <Text style={styles.rec}>REC</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { position: 'absolute', width: 110, height: 150, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000' },
  overlay: { position: 'absolute', top: 6, left: 6, flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'red', marginRight: 4 },
  rec: { color: '#fff', fontSize: 10, letterSpacing: 1 },
  err: { color: '#fff', padding: 8, fontSize: 12 },
});

