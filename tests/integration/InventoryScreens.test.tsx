import {
  act,
  fireEvent,
  render,
  renderHook,
  waitFor,
} from '@testing-library/react-native';
import { Alert, Text } from 'react-native';
import { ProductEditor } from '@/features/inventory/presentation/components/ProductEditor';
import { AdminGuard } from '@/features/inventory/presentation/components/AdminGuard';
import { useDeleteProduct } from '@/features/inventory/presentation/hooks/useDeleteProduct';
import { ProductDetailScreen } from '@/features/inventory/presentation/screens/ProductDetailScreen';

const mockReplace = jest.fn();
const mockInventory = {
  createProduct: { execute: jest.fn() },
  updateProduct: { execute: jest.fn() },
  deleteProduct: { execute: jest.fn() },
};
let mockRole: string | undefined = 'admin';
const product = {
  id: 1,
  title: 'Camisa',
  price: 25,
  description: 'Algodón',
  image: 'https://example.com/shirt.png',
  category: 'Ropa',
};
jest.mock('@/app/di/useDependencies', () => ({
  useDependencies: () => ({ inventory: mockInventory }),
}));
jest.mock('@/features/auth/presentation/hooks/useSession', () => ({
  useSession: () => ({ user: { role: mockRole }, isInitializing: false }),
}));
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: () => ({ id: '1' }),
  Redirect: ({ href }: { href: string }) => {
    mockReplace(href);
    return null;
  },
}));
jest.mock('@/features/inventory/presentation/hooks/useProductQuery', () => ({
  useProductQuery: () => ({ data: product, loading: false, error: null }),
}));
beforeEach(() => {
  mockRole = 'admin';
});
afterEach(() => jest.restoreAllMocks());

async function fillForm(screen: Awaited<ReturnType<typeof render>>) {
  for (const [label, value] of [
    ['Título', 'Camisa'],
    ['Precio', '25'],
    ['Descripción', 'Algodón'],
    ['URL de imagen', 'https://example.com/shirt.png'],
    ['Categoría', 'Ropa'],
  ] as const) {
    await fireEvent.changeText(screen.getByLabelText(label!), value);
  }
}
describe('Pantallas de inventario', () => {
  it('marca los campos vacíos y no llama al caso de uso', async () => {
    const screen = await render(<ProductEditor />);
    await fireEvent.press(screen.getByLabelText('Guardar producto'));
    expect(screen.getAllByText('Este campo es obligatorio.')).toHaveLength(3);
    expect(screen.getByText('Ingresa un precio numérico mayor que cero.')).toBeTruthy();
    expect(mockInventory.createProduct.execute).not.toHaveBeenCalled();
  });
  it('precarga todos los datos, deshabilita guardar y muestra el detalle actualizado', async () => {
    let resolve: ((value: typeof product) => void) | undefined;
    mockInventory.updateProduct.execute.mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const screen = await render(<ProductEditor product={product} />);
    expect(screen.getByLabelText('Título').props.value).toBe('Camisa');
    expect(screen.getByLabelText('Precio').props.value).toBe('25');
    expect(screen.getByLabelText('Descripción').props.value).toBe('Algodón');
    expect(screen.getByLabelText('Categoría').props.value).toBe('Ropa');
    expect(screen.getByLabelText('URL de imagen').props.value).toBe(product.image);
    await fireEvent.press(screen.getByLabelText('Guardar producto'));
    expect(
      screen.getByLabelText('Guardar producto').props.accessibilityState.disabled,
    ).toBe(true);
    await fireEvent.press(screen.getByLabelText('Guardar producto'));
    expect(mockInventory.updateProduct.execute).toHaveBeenCalledTimes(1);
    await act(async () => resolve?.(product));
    expect(alert).toHaveBeenCalledWith(
      'Operación exitosa',
      'Producto actualizado (Simulación)',
    );
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/(main)/inventory/[id]',
      params: { id: '1' },
    });
  });
  it('crea, muestra el ID y limpia el formulario', async () => {
    mockInventory.createProduct.execute.mockResolvedValue({ ...product, id: 21 });
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const screen = await render(<ProductEditor />);
    await fillForm(screen);
    await fireEvent.press(screen.getByLabelText('Guardar producto'));
    await waitFor(() =>
      expect(alert).toHaveBeenCalledWith(
        'Operación exitosa',
        'Producto creado (Simulación). ID: 21',
      ),
    );
    expect(screen.getByLabelText('Título').props.value).toBe('');
    expect(screen.getByLabelText('Precio').props.value).toBe('');
  });
  it('conserva los datos y permite reintentar después de un error', async () => {
    mockInventory.createProduct.execute.mockRejectedValue(new Error('offline'));
    const screen = await render(<ProductEditor />);
    await fillForm(screen);
    await fireEvent.press(screen.getByLabelText('Guardar producto'));
    expect(await screen.findByText('No fue posible guardar el producto.')).toBeTruthy();
    expect(screen.getByLabelText('Título').props.value).toBe('Camisa');
    expect(
      screen.getByLabelText('Guardar producto').props.accessibilityState.disabled,
    ).toBe(false);
  });
  it.each(['client', 'auditor', undefined])(
    'redirige enlaces de edición/alta y oculta acciones para %s',
    async (role) => {
      mockRole = role;
      const guard = await render(
        <AdminGuard>
          <Text>Formulario privado</Text>
        </AdminGuard>,
      );
      expect(guard.queryByText('Formulario privado')).toBeNull();
      expect(mockReplace).toHaveBeenCalledWith('/(main)/inventory');
      const detail = await render(<ProductDetailScreen />);
      expect(detail.queryByLabelText('Eliminar producto')).toBeNull();
      expect(detail.queryByLabelText('Editar producto')).toBeNull();
    },
  );
  it('cancelar el diálogo nativo no hace DELETE ni navega', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const deleted = jest.fn();
    const hook = await renderHook(() => useDeleteProduct(1, deleted));
    await act(() => hook.result.current.confirmDelete());
    expect(alert).toHaveBeenCalledWith(
      'Eliminar producto',
      '¿Estás seguro de eliminar este producto?',
      expect.any(Array),
      expect.any(Object),
    );
    await act(() => alert.mock.calls[0]?.[2]?.[0]?.onPress?.());
    expect(mockInventory.deleteProduct.execute).not.toHaveBeenCalled();
    expect(deleted).not.toHaveBeenCalled();
  });
  it('confirmar elimina una vez y navega únicamente tras recibir éxito', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    let resolve: (() => void) | undefined;
    mockInventory.deleteProduct.execute.mockImplementation(
      () =>
        new Promise<void>((r) => {
          resolve = r;
        }),
    );
    const deleted = jest.fn();
    const hook = await renderHook(() => useDeleteProduct(1, deleted));
    await act(() => hook.result.current.confirmDelete());
    await act(() => {
      alert.mock.calls[0]?.[2]?.[1]?.onPress?.();
      alert.mock.calls[0]?.[2]?.[1]?.onPress?.();
    });
    expect(mockInventory.deleteProduct.execute).toHaveBeenCalledTimes(1);
    expect(deleted).not.toHaveBeenCalled();
    expect(hook.result.current.deleting).toBe(true);
    await act(async () => resolve?.());
    expect(deleted).toHaveBeenCalledTimes(1);
  });
});
