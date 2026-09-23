import type { PropsWithChildren } from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { Dependencies } from '@/application/di/Dependencies';
import { DependenciesProvider } from '@/application/di/DependenciesProvider';
import { SessionProvider } from '@/features/auth/presentation/hooks/useSession';
import { LoginScreen } from '@/features/auth/presentation/screens/LoginScreen';
import { AppError } from '@/shared/errors/AppError';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

async function renderLogin(loginResult?: Error) {
  const dependencies: Dependencies = {
    loginUser: {
      execute: loginResult
        ? jest.fn().mockRejectedValue(loginResult)
        : jest.fn(),
    },
    getCurrentSession: { execute: jest.fn().mockResolvedValue(null) },
  };

  function Wrapper({ children }: PropsWithChildren) {
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
  }

  return render(<LoginScreen />, { wrapper: Wrapper });
}

type LoginRenderResult = Awaited<ReturnType<typeof render>>;

async function submitCredentials(view: LoginRenderResult) {
  await fireEvent.changeText(view.getByLabelText('Usuario'), 'demo');
  await fireEvent.changeText(view.getByLabelText('Contraseña'), 'incorrecta');
  await fireEvent.press(view.getByRole('button', { name: 'Iniciar sesión' }));
}

describe('LoginScreen P02-P04', () => {
  beforeEach(() => {
    mockReplace.mockReset();
  });

  it('P02 renderiza la composición accesible del formulario', async () => {
    const view = await renderLogin();

    expect(view.getByText('Todo empieza por aquí.')).toBeTruthy();
    expect(view.getByText('Inicia sesión en Mercado.')).toBeTruthy();
    expect(view.getByPlaceholderText('Ingresa tu usuario')).toBeTruthy();
    expect(view.getByPlaceholderText('Ingresa tu contraseña')).toBeTruthy();
    expect(view.getByRole('button', { name: 'Iniciar sesión' })).toBeTruthy();
  });

  it('P03 muestra el mensaje exacto de credenciales inválidas', async () => {
    const view = await renderLogin(
      new AppError('invalid-credentials', 'detalle interno'),
    );
    await submitCredentials(view);

    await waitFor(() =>
      expect(view.getByText('Usuario o contraseña inválidos')).toBeTruthy(),
    );
    expect(view.getByLabelText('Usuario').props.editable).toBe(true);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('P04 distingue la falta de conexión y permite reintentar', async () => {
    const view = await renderLogin(new AppError('offline', 'detalle interno'));
    await submitCredentials(view);

    await waitFor(() =>
      expect(
        view.getByText('Sin conexión. Revisa tu acceso a internet.'),
      ).toBeTruthy(),
    );
    expect(view.getByLabelText('Contraseña').props.editable).toBe(true);
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
