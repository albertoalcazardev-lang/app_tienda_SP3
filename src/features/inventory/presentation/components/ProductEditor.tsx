import { Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import type { Product, ProductFormValues } from '../../domain/entities/Product';
import { useProductEditor } from '../hooks/useProductEditor';
import { InventoryLayout } from './InventoryLayout';
const fields: { key: keyof ProductFormValues; label: string }[] = [
  { key: 'title', label: 'Título' },
  { key: 'price', label: 'Precio' },
  { key: 'description', label: 'Descripción' },
  { key: 'image', label: 'URL de imagen' },
  { key: 'category', label: 'Categoría' },
];
export function ProductEditor({ product }: { product?: Product }) {
  const model = useProductEditor(product);
  const router = useRouter();
  async function save() {
    const result = await model.save();
    if (!result) return;
    const message = product
      ? 'Producto actualizado (Simulación)'
      : `Producto creado (Simulación). ID: ${result.id}`;
    if (Platform.OS === 'web') window.alert(message);
    else Alert.alert('Operación exitosa', message);
    if (product)
      router.replace({
        pathname: '/(main)/inventory/[id]',
        params: { id: String(result.id) },
      });
  }
  return (
    <InventoryLayout title={product ? 'Editar producto' : 'Nuevo producto'}>
      {fields.map(({ key, label }) => (
        <AppInput
          key={key}
          label={label}
          value={model.values[key]}
          error={model.errors[key]}
          onChangeText={(value) => model.change(key, value)}
          editable={!model.saving}
          keyboardType={
            key === 'price' ? 'decimal-pad' : key === 'image' ? 'url' : 'default'
          }
          autoCapitalize={key === 'image' ? 'none' : 'sentences'}
          multiline={key === 'description'}
        />
      ))}
      <ErrorMessage message={model.error} />
      <AppButton
        title="Guardar"
        accessibilityLabel="Guardar producto"
        loading={model.saving}
        onPress={() => {
          void save();
        }}
      />
      <AppButton
        title="Cancelar"
        accessibilityLabel="Cancelar edición"
        disabled={model.saving}
        onPress={() =>
          router.replace(
            product
              ? { pathname: '/(main)/inventory/[id]', params: { id: String(product.id) } }
              : '/(main)/inventory',
          )
        }
      />
    </InventoryLayout>
  );
}
