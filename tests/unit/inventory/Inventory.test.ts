import { CreateProduct } from '@/features/inventory/domain/use-cases/CreateProduct';
import { UpdateProduct } from '@/features/inventory/domain/use-cases/UpdateProduct';
import { DeleteProduct } from '@/features/inventory/domain/use-cases/DeleteProduct';
import { SessionInventoryAccess } from '@/features/inventory/domain/services/InventoryAccess';
import { ProductRemoteDataSource } from '@/features/inventory/data/datasources/ProductRemoteDataSource';
import { ProductRepositoryImpl } from '@/features/inventory/data/repositories/ProductRepositoryImpl';
import { toProductInput } from '@/features/inventory/domain/validation/productValidation';
import type { User } from '@/features/auth/domain/entities/User';
import type { ProductFormValues } from '@/features/inventory/domain/entities/Product';

const values: ProductFormValues = {
  title: ' Camisa ',
  price: '25.50',
  description: 'Algodón',
  image: 'https://example.com/shirt.png',
  category: 'Ropa',
};
const product = { ...toProductInput(values), id: 1 };
function setup(role: User['role'] = 'admin') {
  let user: User | null = { id: '1', email: 'a@example.com', name: 'Test', role };
  const access = new SessionInventoryAccess({ getCurrentUser: async () => user });
  const http = { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() };
  const remote = new ProductRemoteDataSource(http, access);
  const repository = new ProductRepositoryImpl(remote);
  return {
    http,
    remote,
    repository,
    create: new CreateProduct(repository, access),
    update: new UpdateProduct(repository, access),
    remove: new DeleteProduct(repository, access),
    setUser: (next: User | null) => {
      user = next;
    },
  };
}
describe('Inventario: casos de uso y transporte', () => {
  it('crea con POST y datos normalizados, sin inventar persistencia en el catálogo', async () => {
    const { create, http, repository } = setup();
    http.post.mockResolvedValue({ ...product, id: 21 });
    http.get.mockResolvedValue([product]);
    expect((await create.execute(values)).id).toBe(21);
    expect(http.post).toHaveBeenCalledWith('/products', { ...product, id: undefined });
    expect(await repository.getAll()).toEqual([product]);
  });
  it.each([
    ['title', ' '],
    ['description', ''],
    ['category', ' '],
    ['price', 'abc'],
    ['price', ''],
    ['price', '-1'],
    ['price', 'Infinity'],
    ['price', '0'],
    ['price', '0x20'],
    ['image', 'bad'],
    ['image', 'file:///tmp/photo'],
  ])('rechaza %s = %s antes de escribir en la red', async (field, value) => {
    const { create, update, http } = setup();
    const invalid = { ...values, [field]: value };
    await expect(create.execute(invalid)).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    await expect(update.execute(1, invalid)).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    expect(http.post).not.toHaveBeenCalled();
    expect(http.put).not.toHaveBeenCalled();
  });
  it.each(['client', 'auditor', undefined] as const)(
    'bloquea el rol %s incluso llamando directamente a la fuente de datos',
    async (role) => {
      const env = setup();
      env.setUser({ id: '2', email: 'b@example.com', name: 'Other', role });
      for (const operation of [
        () => env.create.execute(values),
        () => env.update.execute(1, values),
        () => env.remove.execute(1),
        () => env.remote.create(product),
        () => env.remote.update(1, product),
        () => env.remote.delete(1),
      ]) {
        await expect(operation()).rejects.toMatchObject({ code: 'FORBIDDEN' });
      }
      expect(env.http.post).not.toHaveBeenCalled();
      expect(env.http.put).not.toHaveBeenCalled();
      expect(env.http.delete).not.toHaveBeenCalled();
    },
  );
  it('comprueba la sesión actual al escribir y bloquea una sesión cerrada', async () => {
    const env = setup();
    env.setUser(null);
    await expect(env.remove.execute(1)).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(env.http.delete).not.toHaveBeenCalled();
  });
  it('actualiza con PUT y conserva el detalle editado durante esta ejecución', async () => {
    const env = setup();
    const edited = { ...product, title: 'Nuevo' };
    env.http.put.mockResolvedValue(edited);
    await env.update.execute(1, { ...values, title: 'Nuevo' });
    expect(env.http.put).toHaveBeenCalledWith(
      '/products/1',
      toProductInput({ ...values, title: 'Nuevo' }),
    );
    expect(await env.repository.getById(1)).toEqual(edited);
    expect(env.http.get).not.toHaveBeenCalled();
  });
  it('elimina con DELETE y permite que un GET posterior vuelva a mostrarlo', async () => {
    const env = setup();
    env.http.delete.mockResolvedValue(product);
    env.http.get.mockResolvedValue([product]);
    await env.remove.execute(1);
    expect(env.http.delete).toHaveBeenCalledWith('/products/1');
    expect(await env.repository.getAll()).toEqual([product]);
  });
  it('propaga fallos sin modificar el detalle local', async () => {
    const env = setup();
    env.http.put.mockRejectedValue(new Error('offline'));
    env.http.get.mockResolvedValue(product);
    await expect(env.update.execute(1, values)).rejects.toThrow('offline');
    expect(await env.repository.getById(1)).toEqual(product);
  });
  it.each([null, {}, { ...product, id: 2 }])(
    'rechaza una respuesta DELETE inválida %p',
    async (payload) => {
      const env = setup();
      env.http.delete.mockResolvedValue(payload);
      await expect(env.remove.execute(1)).rejects.toMatchObject({
        code: 'INVALID_RESPONSE',
      });
    },
  );
  it.each([NaN, -1, 1.2, 0])('rechaza identificadores inválidos %s', async (id) => {
    const env = setup();
    await expect(env.remove.execute(id)).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    expect(env.http.delete).not.toHaveBeenCalled();
  });
});
