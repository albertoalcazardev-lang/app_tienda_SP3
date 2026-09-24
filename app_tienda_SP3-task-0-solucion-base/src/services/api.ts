const API_URL = "https://fakestoreapi.com";

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: {
    rate: number;
    count: number;
  };
}

// US03 - Obtener todos los productos
export const getProducts = async (): Promise<Product[]> => {
  const response = await fetch(`${API_URL}/products`);

  if (!response.ok) {
    throw new Error("No se pudieron cargar los productos");
  }

  return await response.json();
};

// US04 - Obtener categorías
export const getCategories = async (): Promise<string[]> => {
  const response = await fetch(`${API_URL}/products/categories`);

  if (!response.ok) {
    throw new Error("No se pudieron cargar las categorías");
  }

  return await response.json();
};

// US04 - Obtener productos por categoría
export const getProductsByCategory = async (
  category: string
): Promise<Product[]> => {
  const response = await fetch(
    `${API_URL}/products/category/${encodeURIComponent(category)}`
  );

  if (!response.ok) {
    throw new Error("No se pudieron cargar los productos de la categoría");
  }

  return await response.json();
};

// US05 - Obtener producto por ID
export const getProductById = async (
  id: number
): Promise<Product> => {
  const response = await fetch(`${API_URL}/products/${id}`);

  if (!response.ok) {
    throw new Error("Producto no disponible");
  }

  return await response.json();
};