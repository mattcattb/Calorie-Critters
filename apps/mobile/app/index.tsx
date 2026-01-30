import { useMemo, useState } from "react";
import { SafeAreaView, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { DEFAULT_NICOTINE_MG, NICOTINE_TYPES, type NicotineType } from "shared";
import { useEntries, useQuickLog } from "../src/db/entries";

const typeLabels: Record<NicotineType, string> = {
  cigarette: "Cigarette",
  vape: "Vape",
  zyn: "Zyn",
  pouch: "Pouch",
  gum: "Gum",
  patch: "Patch",
  other: "Other",
};

export default function HomeScreen() {
  const [selectedType, setSelectedType] = useState<NicotineType>("cigarette");

  const defaultMg = useMemo(
    () => DEFAULT_NICOTINE_MG[selectedType],
    [selectedType]
  );
  const logEntry = useQuickLog(selectedType, defaultMg);
  const { data: entries } = useEntries();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Nicotine Tracker</Text>
        <Text style={styles.subtitle}>
          Offline-first mobile, shared logic from the monorepo.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Log</Text>
          <Text style={styles.cardText}>
            Default nicotine for {typeLabels[selectedType]}: {defaultMg} mg
          </Text>

          <Pressable style={styles.logButton} onPress={logEntry}>
            <Text style={styles.logButtonText}>Log one {typeLabels[selectedType]}</Text>
          </Pressable>

          <View style={styles.pills}>
            {NICOTINE_TYPES.map((type) => {
              const isActive = type === selectedType;
              return (
                <Pressable
                  key={type}
                  onPress={() => setSelectedType(type)}
                  style={[styles.pill, isActive && styles.pillActive]}
                >
                  <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                    {typeLabels[type]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Local Entries</Text>
          <Text style={styles.cardText}>
            {entries?.length ?? 0} stored on this device
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  content: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f8fafc",
  },
  subtitle: {
    fontSize: 16,
    color: "#cbd5f5",
  },
  card: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f8fafc",
  },
  cardText: {
    fontSize: 14,
    color: "#e2e8f0",
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  logButton: {
    backgroundColor: "#0ea5e9",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  logButtonText: {
    color: "#0f172a",
    fontWeight: "700",
  },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#334155",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pillActive: {
    backgroundColor: "#38bdf8",
    borderColor: "#38bdf8",
  },
  pillText: {
    color: "#e2e8f0",
    fontSize: 12,
  },
  pillTextActive: {
    color: "#0f172a",
    fontWeight: "600",
  },
});
