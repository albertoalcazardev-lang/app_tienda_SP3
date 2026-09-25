import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/shared/theme/colors';
export function InventoryLayout({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <Text style={styles.eyebrow}>FAKE STORE · INVENTARIO</Text>
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
export const inventoryStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  body: { color: colors.textMuted, fontSize: 16, lineHeight: 24 },
  price: { color: colors.primary, fontSize: 24, fontWeight: '800' },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'contain',
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  success: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: 16,
    borderRadius: 12,
  },
});
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: 24,
    gap: 16,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingBottom: 48,
  },
  eyebrow: { color: colors.primary, fontSize: 12, letterSpacing: 2, fontWeight: '700' },
  title: { color: colors.text, fontSize: 30, fontWeight: '800' },
});
