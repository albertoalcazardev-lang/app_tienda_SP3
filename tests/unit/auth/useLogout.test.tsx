import type { PropsWithChildren } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { Dependencies } from '@/application/di/Dependencies';
import { DependenciesProvider } from '@/application/di/DependenciesProvider';
import { SessionProvider } from '@/features/auth/presentation/hooks/useSession';
import { useLogout } from '@/features/auth/presentation/hooks/useLogout';
import { AppError } from '@/shared/errors/AppError';

import { sessionFixture } from './fixtures';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

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
      <DependenciesProvider dependencies={dependencies}>
        <SessionProvider>{children}</SessionProvider>
      </DependenciesProvider>
    );
  };
}

describe('useLogout', () => {
  beforeEach(() => {
    mockReplace.mockReset();
  });

  it('abre y cancela la confirmación sin ejecutar efectos secundarios', async () => {
    const execute = jest.fn();
    const { result } = await renderHook(() => useLogout(), {
      wrapper: createWrapper(execute),
    });

    await act(async () => {
      result.current?.requestLogout();
    });
    expect(result.current?.isConfirmationVisible).toBe(true);

    await act(async () => {
      result.current?.cancelLogout();
    });
    expect(result.current?.isConfirmationVisible).toBe(false);
    expect(execute).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('evita confirmaciones duplicadas y reemplaza la ruta tras el cierre', async () => {
    let resolveLogout: (() => void) | undefined;
    const pendingLogout = new Promise<void>((resolve) => {
      resolveLogout = resolve;
    });
    const execute = jest.fn(() => pendingLogout);
    const { result } = await renderHook(() => useLogout(), {
      wrapper: createWrapper(execute),
    });

    await act(async () => {
      result.current?.requestLogout();
    });
    let firstRequest: Promise<void> | undefined;
    let duplicateRequest: Promise<void> | undefined;

    await act(async () => {
      firstRequest = result.current!.confirmLogout();
      duplicateRequest = result.current!.confirmLogout();
      await Promise.resolve();
    });

    expect(result.current?.isLoggingOut).toBe(true);
    expect(execute).toHaveBeenCalledTimes(1);

    resolveLogout?.();
    await act(async () => {
      await Promise.all([firstRequest, duplicateRequest]);
    });

    expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
    expect(result.current?.isLoggingOut).toBe(false);
  });

  it('mantiene la sesión visual y permite reintentar si falla SecureStore', async () => {
    const execute = jest
      .fn()
      .mockRejectedValue(new AppError('secure-storage', 'fallo interno'));
    const { result } = await renderHook(() => useLogout(), {
      wrapper: createWrapper(execute),
    });

    await act(async () => {
      result.current?.requestLogout();
    });
    await act(async () => result.current!.confirmLogout());

    await waitFor(() =>
      expect(result.current?.error).toBe(
        'No pudimos eliminar tu sesión de forma segura. Inténtalo nuevamente.',
      ),
    );
    expect(result.current?.isConfirmationVisible).toBe(true);
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
