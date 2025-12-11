import { useState } from 'react';
import { View, Text, StyleSheet, Switch, FlatList, TextInput, TouchableOpacity } from 'react-native';

export default function SettingsScreen() {
  const [camera, setCamera] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [budgetRows, setBudgetRows] = useState([
    { id: 1, category: 'Fashion', amount: 200 },
    { id: 2, category: 'Electronics', amount: 300 },
  ]);

  const total = budgetRows.reduce((s, r) => s + (Number(r.amount) || 0), 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Camera Monitoring</Text>
          <Switch value={camera} onValueChange={setCamera} />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Vibration Alerts</Text>
          <Switch value={vibration} onValueChange={setVibration} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>Monthly Budget (${total})</Text>
        <FlatList
          data={budgetRows}
          keyExtractor={(i) => i.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.budgetRow}>
              <TextInput
                value={item.category}
                onChangeText={(t) => setBudgetRows((prev) => prev.map((r) => (r.id === item.id ? { ...r, category: t } : r)))}
                style={styles.catInput}
              />
              <TextInput
                value={String(item.amount)}
                keyboardType="numeric"
                onChangeText={(t) =>
                  setBudgetRows((prev) => prev.map((r) => (r.id === item.id ? { ...r, amount: Number(t) || 0 } : r)))
                }
                style={styles.amountInput}
              />
            </View>
          )}
          ListFooterComponent={
            <TouchableOpacity
              onPress={() => setBudgetRows((prev) => [...prev, { id: Date.now(), category: '', amount: 0 }])}
              style={styles.addBtn}
            >
              <Text style={{ color: '#f97316', fontWeight: '700' }}>+ Add Category</Text>
            </TouchableOpacity>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 14, backgroundColor: '#f7f7f7' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  label: { fontWeight: '600', color: '#333' },
  section: { fontWeight: '700', marginBottom: 8 },
  budgetRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  catInput: { flex: 1, backgroundColor: '#f4f4f5', padding: 8, borderRadius: 8, marginRight: 8 },
  amountInput: { width: 90, backgroundColor: '#f4f4f5', padding: 8, borderRadius: 8, textAlign: 'right' },
  addBtn: { padding: 10, alignItems: 'center', backgroundColor: '#fff7ed', borderRadius: 8, marginTop: 6, borderWidth: 1, borderColor: '#fed7aa' },
});

