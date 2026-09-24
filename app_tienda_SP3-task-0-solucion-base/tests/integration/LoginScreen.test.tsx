import { act, render, userEvent, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DependenciesProvider } from '@/app/di/DependenciesProvider';
import { LoginUser } from '@/features/auth/domain/use-cases/LoginUser';
import { LogoutUser } from '@/features/auth/domain/use-cases/LogoutUser';
import { GetCurrentUser } from '@/features/auth/domain/use-cases/GetCurrentUser';
import { LoginScreen } from '@/features/auth/presentation/screens/LoginScreen';
import { SessionProvider } from '@/features/auth/presentation/session/SessionProvider';
import { AppError } from '@/shared/errors/AppError';

import type { Dependencies } from '@/app/di/Dependencies';
import type { User } from '@/features/auth/domain/entities/User';
import type { AuthRepository } from '@/features/auth/domain/repositories/AuthRepository';

const mockReplace = jest.fn();

jest.setTimeout(15_000);

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

const user: User = {
  id: 'demo-user',
  email: 'demo@demo.com',
  name: 'Usuario Demo',
};

function createDependencies(login: AuthRepository['login']): Dependencies {
  const repository: AuthRepository = {
    login,
    logout: async () => undefined,
    getCurrentUser: async () => null,
  };

  return {
    loginUser: new LoginUser(repository),
    logoutUser: new LogoutUser(repository),
    getCurrentUser: new GetCurrentUser(repository),
  };
}

async function renderLoginScreen(dependencies: Dependencies) {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, right: 0, bottom: 34, left: 0 },
      }}
    >
      <DependenciesProvider dependencies={dependencies}>
        <SessionProvider>
          <LoginScreen />
        </SessionProvider>
      </DependenciesProvider>
    </SafeAreaProvider>,
  );
}

describe('LoginScreen', () => {
  it('muestra errores de validación sin ejecutar el caso de uso', async () => {
    const login = jest.fn(async () => user);
    const screen = await renderLoginScreen(createDependencies(login));
    const interaction = userEvent.setup();

    await interaction.press(screen.getByLabelText('Iniciar sesión'));

    expect(await screen.findByText('El correo es obligatorio.')).toBeTruthy();
    expect(screen.getByText('La contraseña es obligatoria.')).toBeTruthy();
    expect(login).not.toHaveBeenCalled();
  });

  it('muestra carga, ejecuta el caso de uso inyectado y navega al completar', async () => {
    let resolveLogin: ((value: User) => void) | undefined;
    const login = jest.fn(
      () =>
        new Promise<User>((resolve) => {
          resolveLogin = resolve;
        }),
    );
    const screen = await renderLoginScreen(createDependencies(login));
    const interaction = userEvent.setup();

    await interaction.type(screen.getByLabelText('Correo electrónico'), 'demo@demo.com');
    await interaction.type(screen.getByLabelText('Contraseña'), 'Demo1234');
    await interaction.press(screen.getByLabelText('Iniciar sesión'));

    await waitFor(() => expect(login).toHaveBeenCalledTimes(1));
    expect(screen.getByLabelText('Procesando')).toBeTruthy();

    await act(async () => {
      resolveLogin?.(user);
    });

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(main)'));
  });

  it('presenta un error controlado de autenticación', async () => {
    const login = jest.fn(async () =>
      Promise.reject(
        new AppError('Correo o contraseña incorrectos.', 'AUTH_INVALID_CREDENTIALS'),
      ),
    );
    const screen = await renderLoginScreen(createDependencies(login));
    const interaction = userEvent.setup();

    await interaction.type(screen.getByLabelText('Correo electrónico'), 'demo@demo.com');
    await interaction.type(screen.getByLabelText('Contraseña'), 'Incorrecta1');
    await interaction.press(screen.getByLabelText('Iniciar sesión'));

    expect(await screen.findByText('Correo o contraseña incorrectos.')).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
