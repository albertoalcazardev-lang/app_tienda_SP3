import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radii, spacing, typography } from '@/shared/theme';

interface LogoutButtonProps {
  readonly disabled?: boolean;
  readonly onPress: () => void;
}

export function LogoutButton({ disabled = false, onPress }: LogoutButtonProps) {
  return (
    <Pressable
      accessibilityLabel="Cerrar sesión"
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
      testID="logout-button"
    >
      <Text style={styles.text}>Cerrar sesión</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  pressed: {
    backgroundColor: colors.errorBackground,
  },
  disabled: {
    opacity: 0.55,
  },
  text: {
    color: colors.error,
    fontSize: typography.label,
    fontWeight: '600',
  },
});
