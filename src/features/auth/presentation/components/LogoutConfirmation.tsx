import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '@/shared/theme/colors';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';

interface Props {
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
}: Props) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={isVisible}
      onRequestClose={isLoading ? () => undefined : onCancel}
    >
      <View style={styles.backdrop}>
        <View
          accessibilityLabel="Confirmación de cierre de sesión"
          accessibilityViewIsModal
          style={styles.dialog}
        >
          <Text accessibilityRole="header" style={styles.title}>
            Cerrar sesión
          </Text>
          <Text style={styles.message}>
            ¿Seguro que deseas cerrar sesión? Tu información local se eliminará de este
            dispositivo.
          </Text>
          {error ? (
            <Text
              accessibilityRole="alert"
              accessibilityLiveRegion="assertive"
              style={styles.error}
            >
              {error}
            </Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            disabled={isLoading}
            onPress={onCancel}
            style={styles.cancel}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ busy: isLoading, disabled: isLoading }}
            disabled={isLoading}
            onPress={onConfirm}
            style={styles.confirm}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.confirmText}>Sí, cerrar sesión</Text>
            )}
          </Pressable>
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
    backgroundColor: 'rgba(23,32,51,0.55)',
    padding: spacing.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: 390,
    gap: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  title: { color: colors.text, fontSize: typography.heading, fontWeight: '700' },
  message: { color: colors.textMuted, fontSize: typography.body, lineHeight: 24 },
  error: {
    color: colors.error,
    backgroundColor: colors.errorBackground,
    borderRadius: 8,
    padding: spacing.sm,
  },
  cancel: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
  },
  cancelText: { color: colors.text, fontWeight: '600' },
  confirm: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.error,
  },
  confirmText: { color: colors.surface, fontWeight: '700' },
});
