import { StyleSheet, Text } from 'react-native';

import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';

interface ErrorMessageProps {
  readonly message: string | null;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (message === null) return null;

  return (
    <Text
      accessibilityLiveRegion="assertive"
      accessibilityRole="alert"
      style={styles.message}
    >
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  message: {
    backgroundColor: '#FEE4E2',
    borderRadius: 8,
    color: colors.error,
    fontSize: typography.label,
    padding: spacing.md,
  },
});
