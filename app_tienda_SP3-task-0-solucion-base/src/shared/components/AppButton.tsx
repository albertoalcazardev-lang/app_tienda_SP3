import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';

interface AppButtonProps {
  readonly title: string;
  readonly onPress: () => void;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly accessibilityLabel: string;
}

export function AppButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  accessibilityLabel,
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          accessibilityLabel="Procesando"
          color={colors.surface}
          size="small"
        />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  pressed: {
    backgroundColor: colors.primaryPressed,
  },
  disabled: {
    backgroundColor: colors.disabled,
  },
  text: {
    color: colors.surface,
    fontSize: typography.body,
    fontWeight: '700',
  },
});
