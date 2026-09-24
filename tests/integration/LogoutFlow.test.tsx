import type { PropsWithChildren } from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { Dependencies } from '@/application/di/Dependencies';
import { DependenciesProvider } from '@/application/di/DependenciesProvider';
import {
  SessionProvider,
  useSession,
} from '@/features/auth/presentation/hooks/useSession';
import { LoginScreen } from '@/features/auth/presentation/screens/LoginScreen';
import { ProtectedHomeScreen } from '@/features/auth/presentation/screens/ProtectedHomeScreen';

import { sessionFixture } from '../unit/auth/fixtures';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

function SessionAwareScreen() {
  const { status } = useSession();

  if (status === 'loading') {
    return null;
  }

  return status === 'authenticated' ? <ProtectedHomeScreen /> : <LoginScreen />;
}

function createWrapper(logoutExecute: jest.Mock) {
  const dependencies: Dependencies = {
    loginUser: { execute: jest.fn() },
    getCurrentSession: {
      execute: jest.fn().mockResolvedValue(sessionFixture),
    },
    logoutUser: { execute: logoutExecute },
  };

  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 24, left: 0, right: 0, bottom: 24 },
        }}
      >
        <DependenciesProvider dependencies={dependencies}>
          <SessionProvider>{children}</SessionProvider>
        </DependenciesProvider>
      </SafeAreaProvider>
    );
  };
}

describe('US02 P13-P14', () => {
  beforeEach(() => {
    mockReplace.mockReset();
  });

  it('P13 abre una confirmación accesible sin cerrar inmediatamente', async () => {
    const execute = jest.fn();
    const view = await render(<SessionAwareScreen />, {
      wrapper: createWrapper(execute),
    });

    await view.findByText('Mi cuenta');
    await fireEvent.press(view.getByRole('button', { name: 'Cerrar sesión' }));

    expect(
      view.getByLabelText('Confirmación de cierre de sesión'),
    ).toBeTruthy();
    expect(
      view.getByText(
        '¿Seguro que deseas cerrar sesión? Tu información local se eliminará de este dispositivo.',
      ),
    ).toBeTruthy();
    expect(execute).not.toHaveBeenCalled();
  });

  it('cancelar conserva la sesión y la pantalla protegida', async () => {
    const execute = jest.fn();
    const view = await render(<SessionAwareScreen />, {
      wrapper: createWrapper(execute),
    });

    await view.findByText('Mi cuenta');
    await fireEvent.press(view.getByRole('button', { name: 'Cerrar sesión' }));
    await fireEvent.press(
      view.getByRole('button', { name: 'Cancelar cierre de sesión' }),
    );

    expect(view.queryByTestId('logout-confirmation')).toBeNull();
    expect(view.getByText('Mi cuenta')).toBeTruthy();
    expect(execute).not.toHaveBeenCalled();
  });

  it('confirmar limpia la sesión y muestra P14 con el aviso exacto', async () => {
    const execute = jest.fn().mockResolvedValue(undefined);
    const view = await render(<SessionAwareScreen />, {
      wrapper: createWrapper(execute),
    });

    await view.findByText('Mi cuenta');
    await fireEvent.press(view.getByRole('button', { name: 'Cerrar sesión' }));
    await fireEvent.press(
      view.getByRole('button', { name: 'Confirmar cierre de sesión' }),
    );

    await waitFor(() =>
      expect(
        view.getByText('Sesión cerrada. Tu información local se ha eliminado.'),
      ).toBeTruthy(),
    );
    expect(execute).toHaveBeenCalledTimes(1);
    expect(view.getByText('Todo empieza por aquí.')).toBeTruthy();
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
  });
});
