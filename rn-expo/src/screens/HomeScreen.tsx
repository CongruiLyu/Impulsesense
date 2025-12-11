import { View, Text, StyleSheet, FlatList, Modal, TouchableOpacity } from 'react-native';
import { useImpulse } from '../hooks/useImpulseEngine';
import { InterventionLevel } from '../types';
import BreathingOverlay from '../components/BreathingOverlay';

const levelName = (level: InterventionLevel) => {
  switch (level) {
    case InterventionLevel.L0_NORMAL:
      return 'Calm';
    case InterventionLevel.L1_REFLECTION:
      return 'Alert';
    case InterventionLevel.L2_GRAYSCALE:
      return 'Distracted';
    case InterventionLevel.L3_BREATHING:
      return 'Impulsive';
    case InterventionLevel.L4_MICRO_LOCK:
      return 'High Risk';
    case InterventionLevel.L5_SAFE_MODE:
      return 'Locked';
    default:
      return 'Unknown';
  }
};

export default function HomeScreen() {
  const { state, excitementHistory, setState } = useImpulse();
  const recent = excitementHistory.slice(-60);
  const activeEvent = recent.find((r) => r.triggerInfo);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ImpulseSense</Text>
      <Text style={styles.level}>
        {levelName(state.level)} • {state.score.toFixed(2)}
      </Text>
      <Text style={styles.sub}>Risk: {state.sessionHighRisk ? 'High' : 'Normal'}</Text>

      <Text style={styles.section}>Excitement (last 60s)</Text>
      <FlatList
        data={recent}
        horizontal
        keyExtractor={(item) => item.timestamp.toString()}
        renderItem={({ item }) => <View style={[styles.bar, { height: item.score * 3 }]} />}
        contentContainerStyle={{ alignItems: 'flex-end' }}
        showsHorizontalScrollIndicator={false}
      />

      {activeEvent?.triggerInfo && (
        <View style={styles.eventBox}>
          <Text style={styles.eventTitle}>Last Trigger</Text>
          <Text style={styles.eventText}>{activeEvent.triggerInfo.reason}</Text>
        </View>
      )}

      {state.level === InterventionLevel.L3_BREATHING && (
        <BreathingOverlay
          onComplete={() => {
            setState((prev: any) => {
              const score = Math.max(0, prev.score - 0.15);
              return { ...prev, score, level: InterventionLevel.L2_GRAYSCALE };
            });
          }}
        />
      )}

      <Modal visible={state.level === InterventionLevel.L5_SAFE_MODE} transparent>
        <View style={styles.safe}>
          <Text style={styles.safeTitle}>Safe Mode</Text>
          <Text style={styles.safeText}>Shopping locked for cooling down.</Text>
          <TouchableOpacity
            style={styles.safeBtn}
            onPress={() =>
              setState((p: any) => ({
                ...p,
                score: Math.max(0, p.score - 0.5),
                level: InterventionLevel.L2_GRAYSCALE,
              }))
            }
          >
            <Text style={{ color: '#fff' }}>Emergency Unlock</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 6 },
  level: { fontSize: 18, fontWeight: '500' },
  sub: { color: '#666', marginTop: 4 },
  section: { marginTop: 24, marginBottom: 8, fontWeight: '600' },
  bar: { width: 6, marginRight: 4, backgroundColor: '#ef4444', borderRadius: 4 },
  eventBox: { marginTop: 20, padding: 12, borderRadius: 12, backgroundColor: '#fff', shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  eventTitle: { fontSize: 12, fontWeight: '700', color: '#ef4444' },
  eventText: { marginTop: 4, color: '#333', fontSize: 12 },
  safe: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  safeTitle: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 12 },
  safeText: { color: '#ddd', fontSize: 14, marginBottom: 20, textAlign: 'center' },
  safeBtn: { backgroundColor: '#ef4444', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999 },
});

