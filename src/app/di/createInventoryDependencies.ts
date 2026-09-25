import { ProductRemoteDataSource } from '@/features/inventory/data/datasources/ProductRemoteDataSource';
import { ProductRepositoryImpl } from '@/features/inventory/data/repositories/ProductRepositoryImpl';
import { SessionInventoryAccess } from '@/features/inventory/domain/services/InventoryAccess';
import type { CurrentUserReader } from '@/features/inventory/domain/services/InventoryAccess';
import { ListProducts } from '@/features/inventory/domain/use-cases/ListProducts';
import { GetProduct } from '@/features/inventory/domain/use-cases/GetProduct';
import { CreateProduct } from '@/features/inventory/domain/use-cases/CreateProduct';
import { UpdateProduct } from '@/features/inventory/domain/use-cases/UpdateProduct';
import { DeleteProduct } from '@/features/inventory/domain/use-cases/DeleteProduct';
import { FetchHttpClient } from '@/shared/http/FetchHttpClient';
export interface InventoryDependencies {
  readonly listProducts: ListProducts;
  readonly getProduct: GetProduct;
  readonly createProduct: CreateProduct;
  readonly updateProduct: UpdateProduct;
  readonly deleteProduct: DeleteProduct;
}
export function createInventoryDependencies(
  session: CurrentUserReader,
): InventoryDependencies {
  const access = new SessionInventoryAccess(session);
  const http = new FetchHttpClient('https://fakestoreapi.com');
  const remote = new ProductRemoteDataSource(http, access);
  const repository = new ProductRepositoryImpl(remote);
  return Object.freeze({
    listProducts: new ListProducts(repository),
    getProduct: new GetProduct(repository),
    createProduct: new CreateProduct(repository, access),
    updateProduct: new UpdateProduct(repository, access),
    deleteProduct: new DeleteProduct(repository, access),
  });
}
