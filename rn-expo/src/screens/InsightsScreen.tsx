import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VictoryArea, VictoryPie, VictoryChart, VictoryBar, VictoryTheme } from 'victory-native';
import { useImpulse } from '../hooks/useImpulseEngine';

export default function InsightsScreen() {
  const { state, excitementHistory } = useImpulse();
  const trend = excitementHistory.slice(-90).map((p, idx) => ({ x: idx, y: p.score }));
  const levelDist = [
    { x: 'L1', y: 10 },
    { x: 'L2', y: 6 },
    { x: 'L3', y: 3 },
    { x: 'L4', y: 1 },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Insights</Text>
      <Text style={{ color: '#666' }}>Current Score: {state.score.toFixed(2)}</Text>

      <Text style={styles.section}>Excitement Trend</Text>
      <VictoryChart width={Dimensions.get('window').width - 24} theme={VictoryTheme.material}>
        <VictoryArea data={trend} style={{ data: { fill: '#fecdd3', stroke: '#f43f5e', strokeWidth: 2 } }} />
      </VictoryChart>

      <Text style={styles.section}>Level Distribution</Text>
      <VictoryPie
        data={levelDist}
        colorScale={['#facc15', '#f97316', '#ef4444', '#7f1d1d']}
        width={Dimensions.get('window').width - 24}
        labels={({ datum }) => `${datum.x}: ${datum.y}`}
        innerRadius={40}
      />

      <Text style={styles.section}>Category Impulse Index (mock)</Text>
      <VictoryChart width={Dimensions.get('window').width - 24} domainPadding={16}>
        <VictoryBar
          data={[
            { x: 'Digital', y: 0.7 },
            { x: 'Fashion', y: 0.8 },
            { x: 'Beauty', y: 0.6 },
            { x: 'Home', y: 0.4 },
          ]}
          style={{ data: { fill: '#22d3ee' } }}
          cornerRadius={{ top: 4 }}
        />
      </VictoryChart>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 12, backgroundColor: '#fafafa' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 6 },
  section: { marginTop: 16, marginBottom: 6, fontWeight: '700' },
});

