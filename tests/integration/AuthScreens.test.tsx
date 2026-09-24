import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { LoginForm } from '@/features/auth/presentation/components/LoginForm';
import { LogoutConfirmation } from '@/features/auth/presentation/components/LogoutConfirmation';

describe('US01 - formulario de acceso', () => {
  it('valida campos vacíos sin ejecutar el caso de uso', async () => {
    const submit = jest.fn();
    const screen = await render(
      <LoginForm isLoading={false} onSubmit={submit} submitError={null} />,
    );
    await fireEvent.press(screen.getByLabelText('Iniciar sesión'));
    expect(screen.getByText('Ingresa tu usuario.')).toBeTruthy();
    expect(screen.getByText('Ingresa tu contraseña.')).toBeTruthy();
    expect(submit).not.toHaveBeenCalled();
  });

  it('envía usuario y contraseña válidos', async () => {
    const submit = jest.fn().mockResolvedValue(undefined);
    const screen = await render(
      <LoginForm isLoading={false} onSubmit={submit} submitError={null} />,
    );
    await fireEvent.changeText(screen.getByLabelText('Usuario'), 'johnd');
    await fireEvent.changeText(screen.getByLabelText('Contraseña'), 'm38rmF$');
    await fireEvent.press(screen.getByLabelText('Iniciar sesión'));
    await waitFor(() =>
      expect(submit).toHaveBeenCalledWith({ username: 'johnd', password: 'm38rmF$' }),
    );
  });
});

describe('US02 - confirmación de cierre', () => {
  it('permite cancelar o confirmar explícitamente', async () => {
    const cancel = jest.fn();
    const confirm = jest.fn();
    const screen = await render(
      <LogoutConfirmation
        error={null}
        isLoading={false}
        isVisible
        onCancel={cancel}
        onConfirm={confirm}
      />,
    );
    expect(
      screen.getByText(
        '¿Seguro que deseas cerrar sesión? Tu información local se eliminará de este dispositivo.',
      ),
    ).toBeTruthy();
    await fireEvent.press(screen.getByText('Cancelar'));
    await fireEvent.press(screen.getByText('Sí, cerrar sesión'));
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(confirm).toHaveBeenCalledTimes(1);
  });
});
