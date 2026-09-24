import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '@/shared/theme/colors';

interface LoadingIndicatorProps {
  readonly label?: string;
}

export function LoadingIndicator({
  label = 'Cargando aplicación',
}: LoadingIndicatorProps) {
  return (
    <View accessibilityLabel={label} style={styles.container}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
});
