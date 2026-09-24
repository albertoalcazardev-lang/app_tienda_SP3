import type { PropsWithChildren } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { Dependencies } from '@/application/di/Dependencies';
import { DependenciesProvider } from '@/application/di/DependenciesProvider';
import { useLogin } from '@/features/auth/presentation/hooks/useLogin';
import { SessionProvider } from '@/features/auth/presentation/hooks/useSession';
import { AppError } from '@/shared/errors/AppError';

import { sessionFixture } from './fixtures';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

function createWrapper(dependencies: Dependencies) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <DependenciesProvider dependencies={dependencies}>
        <SessionProvider>{children}</SessionProvider>
      </DependenciesProvider>
    );
  };
}

describe('useLogin', () => {
  beforeEach(() => {
    mockReplace.mockReset();
  });

  it('activa carga, evita doble envío, actualiza sesión y navega', async () => {
    let resolveLogin: (value: typeof sessionFixture) => void = () => undefined;
    const pendingLogin = new Promise<typeof sessionFixture>((resolve) => {
      resolveLogin = resolve;
    });
    const execute = jest.fn(() => pendingLogin);
    const dependencies: Dependencies = {
      loginUser: { execute },
      getCurrentSession: { execute: jest.fn().mockResolvedValue(null) },
      logoutUser: { execute: jest.fn() },
    };
    const { result } = await renderHook(() => useLogin(), {
      wrapper: createWrapper(dependencies),
    });

    await act(async () => {
      result.current?.setUsername('auditor_demo');
      result.current?.setPassword('secret');
    });

    let firstSubmission: Promise<void> = Promise.resolve();
    await act(async () => {
      firstSubmission = result.current!.submit();
      void result.current!.submit();
      await Promise.resolve();
    });

    expect(execute).toHaveBeenCalledTimes(1);
    expect(result.current?.isLoading).toBe(true);

    await act(async () => {
      resolveLogin(sessionFixture);
      await firstSubmission;
    });

    expect(result.current?.isLoading).toBe(false);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(main)'));
  });

  it('mantiene el formulario y traduce credenciales inválidas', async () => {
    const dependencies: Dependencies = {
      loginUser: {
        execute: jest
          .fn()
          .mockRejectedValue(
            new AppError('invalid-credentials', 'mensaje técnico'),
          ),
      },
      getCurrentSession: { execute: jest.fn().mockResolvedValue(null) },
      logoutUser: { execute: jest.fn() },
    };
    const { result } = await renderHook(() => useLogin(), {
      wrapper: createWrapper(dependencies),
    });

    await act(async () => {
      result.current?.setUsername('incorrecto');
      result.current?.setPassword('incorrecta');
    });
    await act(async () => {
      await result.current!.submit();
    });

    expect(result.current?.errorMessage).toBe('Usuario o contraseña inválidos');
    expect(result.current?.username).toBe('incorrecto');
    expect(result.current?.password).toBe('incorrecta');
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('valida campos vacíos sin ejecutar el caso de uso', async () => {
    const execute = jest.fn();
    const dependencies: Dependencies = {
      loginUser: { execute },
      getCurrentSession: { execute: jest.fn().mockResolvedValue(null) },
      logoutUser: { execute: jest.fn() },
    };
    const { result } = await renderHook(() => useLogin(), {
      wrapper: createWrapper(dependencies),
    });

    await act(async () => {
      await result.current!.submit();
    });

    expect(result.current?.fieldErrors).toEqual({
      username: 'Ingresa tu usuario.',
      password: 'Ingresa tu contraseña.',
    });
    expect(execute).not.toHaveBeenCalled();
  });
});
