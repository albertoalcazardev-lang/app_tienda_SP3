import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, radii, shadows, spacing, typography } from '@/shared/theme';

interface LogoutConfirmationProps {
  readonly error: string | null;
  readonly isLoading: boolean;
  readonly isVisible: boolean;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}

export function LogoutConfirmation({
  error,
  isLoading,
  isVisible,
  onCancel,
  onConfirm,
}: LogoutConfirmationProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={isLoading ? () => undefined : onCancel}
      transparent
      visible={isVisible}
    >
      <View style={styles.backdrop}>
        <View
          accessibilityLabel="Confirmación de cierre de sesión"
          accessibilityViewIsModal
          style={styles.dialog}
          testID="logout-confirmation"
        >
          <Text accessibilityRole="header" style={styles.title}>
            Cerrar sesión
          </Text>
          <Text style={styles.message}>
            ¿Seguro que deseas cerrar sesión? Tu información local se eliminará
            de este dispositivo.
          </Text>

          {error ? (
            <View
              accessibilityLiveRegion="assertive"
              accessibilityRole="alert"
              style={styles.errorBanner}
            >
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              accessibilityLabel="Cancelar cierre de sesión"
              accessibilityRole="button"
              accessibilityState={{ disabled: isLoading }}
              disabled={isLoading}
              onPress={onCancel}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && !isLoading ? styles.secondaryPressed : null,
                isLoading ? styles.disabled : null,
              ]}
            >
              <Text style={styles.secondaryText}>Cancelar</Text>
            </Pressable>

            <Pressable
              accessibilityLabel={
                isLoading ? 'Cerrando sesión' : 'Confirmar cierre de sesión'
              }
              accessibilityRole="button"
              accessibilityState={{ busy: isLoading, disabled: isLoading }}
              disabled={isLoading}
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.destructiveButton,
                pressed && !isLoading ? styles.destructivePressed : null,
                isLoading ? styles.disabled : null,
              ]}
            >
              {isLoading ? (
                <View style={styles.loadingContent}>
                  <ActivityIndicator color={colors.white} size="small" />
                  <Text style={styles.destructiveText}>Cerrando sesión…</Text>
                </View>
              ) : (
                <Text style={styles.destructiveText}>Sí, cerrar sesión</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.modalBackdrop,
    padding: spacing.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: 390,
    gap: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    ...shadows.card,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
  },
  message: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 24,
  },
  errorBanner: {
    borderRadius: radii.sm,
    backgroundColor: colors.errorBackground,
    padding: spacing.sm,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.label,
    lineHeight: 20,
  },
  actions: {
    gap: spacing.sm,
  },
  secondaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
  },
  secondaryPressed: {
    backgroundColor: colors.primarySoft,
  },
  secondaryText: {
    color: colors.textPrimary,
    fontSize: typography.label,
    fontWeight: '600',
  },
  destructiveButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
  },
  destructivePressed: {
    backgroundColor: colors.errorPressed,
  },
  destructiveText: {
    color: colors.white,
    fontSize: typography.label,
    fontWeight: '700',
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  disabled: {
    opacity: 0.65,
  },
});
