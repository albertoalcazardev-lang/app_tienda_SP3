import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";

import {
  useLocalSearchParams,
  router,
} from "expo-router";

import {
  getProductById,
  Product,
} from "../../../src/services/api";

export default function DetalleProductoScreen() {
  const { id } = useLocalSearchParams();

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarProducto();
  }, []);

  const cargarProducto = async () => {
    try {
      setLoading(true);

      const productId = Number(id);

      const data =
        await getProductById(productId);

      setProduct(data);
    } catch (error) {
      console.log("Error:", error);

      Alert.alert(
        "Producto no disponible",
        "No fue posible obtener la información del producto.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text>
          Cargando producto...
        </Text>
      </View>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: product.image }}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.title}>
        {product.title}
      </Text>

      <Text style={styles.price}>
        ${product.price}
      </Text>

      <Text style={styles.category}>
        Categoría: {product.category}
      </Text>

      <Text style={styles.description}>
        {product.description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },

  image: {
    width: "100%",
    height: 280,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
  },

  price: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },

  category: {
    fontSize: 16,
    marginTop: 10,
  },

  description: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 15,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});