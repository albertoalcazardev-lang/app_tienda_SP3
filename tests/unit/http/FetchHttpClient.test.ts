import { FetchHttpClient } from '@/shared/http/FetchHttpClient';
const fetchMock = jest.fn();
const originalFetch = globalThis.fetch;
beforeEach(() => {
  globalThis.fetch = fetchMock;
});
afterEach(() => {
  globalThis.fetch = originalFetch;
});
const client = new FetchHttpClient('https://fakestoreapi.com');
function response(ok: boolean, status: number, payload: unknown) {
  return { ok, status, text: async () => JSON.stringify(payload) };
}
it('envía PUT con JSON y devuelve el objeto', async () => {
  fetchMock.mockResolvedValue(response(true, 200, { id: 1 }));
  expect(await client.put('/products/1', { title: 'Camisa' })).toEqual({ id: 1 });
  expect(fetchMock).toHaveBeenCalledWith(
    'https://fakestoreapi.com/products/1',
    expect.objectContaining({ method: 'PUT', body: JSON.stringify({ title: 'Camisa' }) }),
  );
});
it('envía DELETE sin cuerpo', async () => {
  fetchMock.mockResolvedValue(response(true, 200, { id: 1 }));
  await client.delete('/products/1');
  expect(fetchMock).toHaveBeenCalledWith(
    'https://fakestoreapi.com/products/1',
    expect.objectContaining({ method: 'DELETE' }),
  );
  expect(fetchMock.mock.calls[0]?.[1].body).toBeUndefined();
});
it('no trata un error HTTP como éxito', async () => {
  fetchMock.mockResolvedValue(
    response(false, 500, { message: 'Servidor no disponible' }),
  );
  await expect(client.delete('/products/1')).rejects.toMatchObject({
    code: 'HTTP_ERROR',
    message: 'Servidor no disponible',
  });
});
it('convierte fallos de red en un error legible', async () => {
  fetchMock.mockRejectedValue(new TypeError('fetch failed'));
  await expect(client.put('/products/1', {})).rejects.toMatchObject({
    code: 'NETWORK_ERROR',
  });
});
