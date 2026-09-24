import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import { router } from "expo-router";

import {
  getProducts,
  getCategories,
  getProductsByCategory,
  Product,
} from "../../src/services/api";

import CategoryFilter from "../../src/components/CategoryFilter";

export default function CatalogoScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Cargar productos y categorías al entrar
  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, []);

  // US03 - Cargar todos los productos
  const cargarProductos = async () => {
    try {
      setLoading(true);
      setError(false);

      const data = await getProducts();

      setProducts(data);
    } catch (error) {
      console.log("Error al cargar productos:", error);

      setProducts([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // US04 - Cargar categorías
  const cargarCategorias = async () => {
    try {
      const data = await getCategories();

      setCategories(data);
    } catch (error) {
      console.log("Error al cargar categorías:", error);
    }
  };

  // US04 - Filtrar productos
  const seleccionarCategoria = async (
    category: string | null
  ) => {
    setSelectedCategory(category);

    try {
      setLoading(true);
      setError(false);

      // Limpiar productos anteriores
      setProducts([]);

      // Mostrar todos
      if (category === null) {
        const data = await getProducts();

        setProducts(data);
      }

      // Mostrar categoría seleccionada
      else {
        const data = await getProductsByCategory(category);

        setProducts(data);
      }
    } catch (error) {
      console.log("Error al filtrar productos:", error);

      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // US03 - Mostrar cada producto
  const renderProducto = ({
    item,
  }: {
    item: Product;
  }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push(`/detalle/${item.id}`)
        }
      >
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          resizeMode="contain"
        />

        <Text
          style={styles.title}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        <Text style={styles.price}>
          ${item.price}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Catálogo de productos
      </Text>

      {/* US04 - Filtro */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={seleccionarCategoria}
      />

      {/* Loading */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />

          <Text style={styles.loadingText}>
            Cargando productos...
          </Text>
        </View>
      ) : error ? (
        /* Error */
        <View style={styles.center}>
          <Text style={styles.error}>
            No se pudieron cargar los productos.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              seleccionarCategoria(selectedCategory)
            }
          >
            <Text style={styles.buttonText}>
              Reintentar
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Productos */
        <FlatList
          data={products}
          keyExtractor={(item) =>
            item.id.toString()
          }
          renderItem={renderProducto}
          numColumns={2}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  header: {
    fontSize: 24,
    fontWeight: "bold",
    margin: 20,
  },

  list: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 8,
    padding: 12,
    borderRadius: 10,
    elevation: 3,
  },

  image: {
    width: "100%",
    height: 150,
  },

  title: {
    fontSize: 14,
    marginTop: 8,
  },

  price: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  loadingText: {
    marginTop: 10,
  },

  error: {
    textAlign: "center",
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#222",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});