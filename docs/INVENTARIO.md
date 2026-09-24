# Épica 3 — Inventario de Fake Store

Implementa US06 (alta), US07 (edición) y US08 (eliminación). La rama
`Task-03-Inventario-tienda` parte de `SP3` e integra `task-0-solucion-base` mediante
un merge: ambas ramas originales tenían commits raíz independientes. No se modifican
`SP3`, `main`, `DEV`, `QA` ni la solución base en remoto.

## Ejecutar en VS Code

Abre la carpeta del repositorio y su terminal integrada:

```bash
npm ci
npm start
```

Escanea el QR con Expo Go compatible con SDK 57. Para web, usa `npm run web`.
No necesitas crear un `.env` para la demostración. Si ya tienes uno, usa
`EXPO_PUBLIC_USE_MOCKS=true`. Esto simula únicamente la autenticación; el inventario
consume la API pública real `https://fakestoreapi.com` y necesita conexión a Internet.

| Rol           | Correo           | Contraseña |
| ------------- | ---------------- | ---------- |
| Administrador | admin@demo.com   | Demo1234   |
| Cliente       | demo@demo.com    | Demo1234   |
| Auditor       | auditor@demo.com | Demo1234   |

Después de iniciar sesión, selecciona **Abrir catálogo**. Solo el administrador ve
**Agregar producto**, **Editar** y **Eliminar**. Las sesiones antiguas sin rol se
consideran de solo lectura; cierra sesión e ingresa de nuevo para usar un rol demo.

## Arquitectura para explicar el código

```text
Ruta de Expo Router → Pantalla → Hook controlador (ViewModel)
                                 ↓
                              Caso de uso
                                 ↓
                        ProductRepository (interface)
                                 ↓
                        ProductRepositoryImpl
                                 ↓
                        ProductDataSource (interface)
                                 ↓
                        ProductRemoteDataSource → HTTP
```

- `domain/entities`: contratos `Product`, `ProductInput` y valores del formulario.
- `domain/validation`: validación local compartida por presentación y casos de uso.
- `domain/use-cases`: listar, consultar, crear, actualizar y eliminar, una acción por clase.
- `domain/services/InventoryAccess`: interfaz de autorización y política de administrador.
- `data`: validación de respuestas desconocidas y operaciones GET, POST, PUT y DELETE.
- `presentation/hooks`: estado, errores, carga, guardado y confirmación. Las pantallas
  no instancian repositorios ni hacen peticiones HTTP.
- `src/app/di/createInventoryDependencies.ts`: composition root que construye el
  cliente HTTP, autorización, fuente de datos, repositorio y casos de uso mediante
  sus constructores. `createDependencies.ts` lo integra con la sesión de la base.

Se usan interfaces, sin clases abstractas. Cada capa tiene una responsabilidad;
los casos de uso dependen del contrato del repositorio y el transporte de escritura
extiende `HttpClient` mediante `MutationHttpClient` sin romper sus consumidores de
solo lectura/POST. Los dobles de prueba implementan esos mismos contratos.

## Reglas y simulación

- Todos los campos son obligatorios. Precio decimal mayor que cero (punto decimal)
  e imagen con URL HTTP/HTTPS. Se muestran errores de campo y no se envía la escritura
  mientras los datos sean inválidos.
- Alta: POST `/products`, alerta con ID devuelto y formulario limpio. No se agrega
  artificialmente al catálogo, porque un GET posterior no lo devolvería.
- Edición: precarga de título, precio, descripción, imagen y categoría; PUT
  `/products/{id}`; mensaje `Producto actualizado (Simulación)` y regreso al detalle.
  El repositorio mantiene la edición en memoria durante la ejecución para que el
  detalle y el catálogo reflejen el resultado. Se pierde al reiniciar la app.
- Eliminación: diálogo nativo de React Native en Android/iOS; cancelar no hace red.
  Confirmar ejecuta DELETE `/products/{id}`. Tras una respuesta válida se vuelve al
  catálogo con un aviso accesible de éxito que desaparece a los cinco segundos.
  El GET posterior puede volver a mostrar el producto, tal como indican las historias.
- En web se usan los diálogos del navegador para confirmación y mensajes, porque
  `Alert` nativo no está disponible. El guardado y borrado bloquean solicitudes duplicadas.
- Los enlaces directos de alta/edición pasan por `AdminGuard`. Los casos de uso y
  la fuente de datos comprueban la sesión actual antes de cada escritura, por lo
  que cambiar la navegación no concede permisos.

Fake Store es un servicio de demostración sin autorización real para estas
escrituras. Las comprobaciones del cliente cumplen los flujos de la app; un backend
propio deberá validar roles y tokens en el servidor para seguridad de producción.
El modo remoto de autenticación heredado espera `/auth/me` y `/auth/logout`, además
de `/auth/login`; no es el contrato de autenticación de Fake Store. No cambies
su URL a Fake Store esperando que ambos contratos sean equivalentes.

En Android/iOS se conserva Expo SecureStore. En web se usa `sessionStorage`, limitado
a la pestaña y sin cifrado: apropiado para la demo, no un reemplazo de un diseño de
sesión de producción con cookies seguras.

## Validación y entrega

```bash
npm run verify
npx expo export --platform all
```

Las pruebas cubren validación previa al envío, permisos en casos de uso y fuente de
datos, ausencia de sesión, IDs inválidos, respuestas malformadas, fallos HTTP/red,
actualización visual, alta y limpieza, carga/envíos duplicados, enlaces restringidos,
y confirmación/cancelación de borrado. También se ejecutan las pruebas de login de
la solución base.

Se fijó `test-renderer` a 1.2.0 para mantener compatibilidad con React 19.2.3 de la
base y se sincronizó el archivo de dependencias para permitir `npm ci`.

Para una revisión manual en teléfono:

1. Ingresa como administrador y abre catálogo y detalle.
2. Intenta guardar datos vacíos y un precio con letras; verifica los errores.
3. Crea un producto válido; confirma el ID y los campos vacíos después del éxito.
4. Edita un producto existente; revisa precarga, indicador y detalle actualizado.
5. Cancela una eliminación; confirma que continúas en el mismo detalle.
6. Confirma la eliminación; revisa el aviso al regresar al catálogo.
7. Repite con cliente y auditor: no deben aparecer controles de escritura y los
   enlaces `/inventory/create` y `/inventory/1/edit` deben redirigir al catálogo.

Si Metro informa `EMFILE: too many open files, watch` en macOS, instala Watchman
según las instrucciones oficiales de React Native y vuelve a iniciar Expo. Es un
límite del sistema de vigilancia de archivos, no un error de TypeScript.

Referencias: [Fake Store API](https://fakestoreapi.com/docs),
[Expo Router](https://docs.expo.dev/router/basics/notation/).
