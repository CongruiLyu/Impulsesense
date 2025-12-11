import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions } from 'react-native';
import { Camera, CameraType } from 'expo-camera';

export default function DraggableCamera({ enabled, impulseScore }: { enabled: boolean; impulseScore: number }) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const pos = useRef({ x: Dimensions.get('window').width - 130, y: 60 });
  const translate = useRef({ x: 0, y: 0 });
  const [_, force] = useState(0);

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
        pos.current = { 
          x: Math.max(0, Math.min(Dimensions.get('window').width - 110, pos.current.x + g.dx)), 
          y: Math.max(0, Math.min(Dimensions.get('window').height - 200, pos.current.y + g.dy))
        };
        translate.current = { x: 0, y: 0 };
        force((v) => v + 1);
      }
    })
  ).current;

  if (!enabled) return null;
  if (hasPermission === false) {
    return (
      <View 
        {...panResponder.panHandlers}
        style={[
          styles.box, 
          { 
            left: pos.current.x + translate.current.x, 
            top: pos.current.y + translate.current.y 
          }
        ]}
      >
        <View style={styles.errorOverlay}>
          <Text style={styles.err}>No Camera</Text>
        </View>
      </View>
    );
  }

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.box,
        { 
          left: pos.current.x + translate.current.x, 
          top: pos.current.y + translate.current.y 
        }
      ]}
    >
      {hasPermission && (
        <Camera style={StyleSheet.absoluteFill} type={CameraType.front} ratio="4:3" />
      )}
      <View style={styles.overlay}>
        <View style={styles.topRow}>
          <View style={styles.recIndicator}>
            <View style={styles.dot} />
            <Text style={styles.rec}>REC</Text>
          </View>
        </View>
        <View style={styles.faceMesh}>
          <View style={styles.meshCircle} />
          <View style={styles.meshDot} />
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>ARO</Text>
            <Text style={[styles.metricValue, impulseScore > 0.6 && styles.metricValueHigh]}>
              {(impulseScore * 100).toFixed(0)}%
            </Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>GAZE</Text>
            <Text style={styles.metricValue}>CTR</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { 
    position: 'absolute', 
    width: 110, 
    height: 150, 
    borderRadius: 12, 
    overflow: 'hidden', 
    backgroundColor: '#000',
    zIndex: 50,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    padding: 8,
    justifyContent: 'space-between'
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  recIndicator: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dot: { 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: 'red', 
    marginRight: 4 
  },
  rec: { 
    color: '#fff', 
    fontSize: 8, 
    letterSpacing: 1,
    opacity: 0.7
  },
  faceMesh: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -32 }],
    width: 48,
    height: 64
  },
  meshCircle: {
    position: 'absolute',
    width: 48,
    height: 64,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  meshDot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(34, 197, 94, 0.5)',
    transform: [{ translateX: -2 }, { translateY: -2 }]
  },
  bottomRow: {
    gap: 2
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  metricLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 7,
    fontFamily: 'monospace'
  },
  metricValue: {
    color: '#22c55e',
    fontSize: 7,
    fontFamily: 'monospace',
    fontWeight: '600'
  },
  metricValueHigh: {
    color: '#ef4444'
  },
  errorOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  err: { 
    color: '#fff', 
    padding: 8, 
    fontSize: 10,
    textAlign: 'center'
  },
});

