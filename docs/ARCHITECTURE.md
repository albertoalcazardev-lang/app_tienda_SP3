# Arquitectura de Mercado - US01 y US02

## Objetivo

La solución autentica, restaura y cierra una sesión sin acoplar el dominio a
React, Expo Router, HTTP o SecureStore. US02 extiende los contratos existentes
sin reconstruir US01 ni añadir funcionalidades de otras historias.

## Estructura

```text
src/
├── app/                         Rutas y layouts exclusivos de Expo Router.
├── application/
│   ├── config/                  Configuración del entorno.
│   ├── di/                      Contratos y Composition Root.
│   └── providers/               Montaje de providers globales.
├── features/auth/
│   ├── domain/
│   │   ├── entities/            Session, User y UserRole.
│   │   ├── repositories/        Contrato AuthRepository.
│   │   ├── services/            Regla pura de perfiles.
│   │   └── use-cases/           LoginUser, GetCurrentSession y LogoutUser.
│   ├── data/
│   │   ├── datasources/         API y persistencia segura.
│   │   ├── dto/                 Contratos externos.
│   │   ├── mappers/             Conversión hacia dominio.
│   │   └── repositories/        AuthRepositoryImpl.
│   └── presentation/
│       ├── components/          Formularios, botón y confirmación.
│       ├── hooks/               Controladores equivalentes a ViewModels.
│       └── screens/             Login y cuenta protegida.
└── shared/
    ├── errors/                  Errores tipados.
    ├── http/                    Cliente y conectividad.
    ├── storage/                 Abstracción SecureStorage.
    └── theme/                   Colores, espaciado, radios y sombras.
```

La plantilla de Expo SDK 57 usa `src/app` como raíz de rutas. Para evitar que
Expo Router interprete configuración o providers como pantallas, estos viven
en `src/application`, equivalente a la capa `src/app` descrita en el contrato.

## Dependency Injection

```text
ExpoSecureStorage
        |
        v
SecureAuthLocalDataSource
        |
        v
AuthRepositoryImpl
        |
        v
LogoutUser
        |
        v
DependenciesProvider
        |
        v
useLogout
        |
        v
ProtectedHomeScreen
```

El mismo repositorio conserva el flujo remoto de US01:

```text
FetchHttpClient + ExpoConnectivity
              |
              v
ApiAuthRemoteDataSource
              |
              v
AuthRepositoryImpl
              |
              v
LoginUser / GetCurrentSession
```

`createDependencies.ts` es el único Composition Root. Pantallas, componentes,
hooks y rutas no construyen implementaciones concretas.

## Flujo de US02

1. `ProtectedHomeScreen` representa P13 para una sesión autenticada.
2. `LogoutButton` notifica la intención, pero no elimina datos.
3. `useLogout.requestLogout` abre `LogoutConfirmation`.
4. Cancelar cierra únicamente el modal.
5. Confirmar activa un cerrojo síncrono para evitar doble envío.
6. `useLogout` ejecuta el caso de uso inyectado `LogoutUser`.
7. `LogoutUser` delega en el contrato `AuthRepository.logout`.
8. `AuthRepositoryImpl` coordina la limpieza local obligatoria.
9. `SecureAuthLocalDataSource` intenta eliminar todas las claves de sesión.
10. Solo después del éxito, el hook limpia `SessionProvider`.
11. El estado cambia a `unauthenticated` y `Stack.Protected` retira `(main)`.
12. `router.replace` dirige al Login y P14 muestra el aviso de éxito.

## Cierre remoto

Fake Store API documenta únicamente `POST /auth/login`; no publica un endpoint
de logout. `AuthRemoteDataSource` no contiene una petición simulada y
`AuthRepositoryImpl.logout` no llama a red.

La decisión es: **cierre remoto de mejor esfuerzo y cierre local obligatorio**.
Si el backend incorpora logout, el repositorio intentará la operación remota y
ejecutará la limpieza local en un bloque que no dependa de su éxito. Un error
remoto nunca debe conservar la sesión en el dispositivo.

## Limpieza local e idempotencia

`AUTH_STORAGE_KEYS` centraliza:

- `mercado.session.token`.
- `mercado.session.user`.

El segundo valor contiene ID, rol y datos mínimos. La contraseña nunca se
guarda. `clearSession` utiliza `Promise.allSettled` para intentar ambas
eliminaciones incluso si una falla. El adaptador SecureStore acepta eliminar
claves inexistentes, por lo que ejecutar logout varias veces es válido.

Si alguna eliminación falla, se lanza `AppError('secure-storage')`. El hook
mantiene la confirmación, no limpia falsamente la sesión en memoria, no navega
y permite reintentar.

No existe TanStack Query ni otra caché global. La limpieza en memoria elimina
`Session`, `User` y `UserRole` del `SessionProvider`. El contador interno de
restauración invalida resultados asíncronos anteriores para impedir que una
sesión eliminada reaparezca.

## Estado y navegación

`SessionProvider` mantiene responsabilidades distintas a las del modal:

- `loading`: restauración pendiente.
- `authenticated`: existe una sesión válida.
- `unauthenticated`: no existe sesión activa.
- `notice`: mensaje transitorio mostrado después del cierre.

La visibilidad, carga y error de la confirmación pertenecen a `useLogout`.
`Stack.Protected` bloquea rutas profundas y elimina pantallas protegidas cuando
el guard cambia. `router.replace` evita añadir Login sobre el historial.

## Componentes de presentación

- `LogoutButton.tsx`: área táctil, rol, label y estado deshabilitado.
- `LogoutConfirmation.tsx`: `Modal` transparente, bloqueo del fondo,
  `onRequestClose` en Android, acciones accesibles, error y carga.
- `ProtectedHomeScreen.tsx`: P13, información del usuario y composición
  inferior no funcional.
- `LoginScreen.tsx`: conserva P02-P04 y agrega el resultado P14.

El PDF no contiene una pantalla de confirmación: P14 es el Login posterior al
cierre. Se añadió el modal exigido por los criterios funcionales y se conservó
P14 como resultado con el texto exacto del aviso.

## Errores tipados

`AppError` distingue credenciales, falta de conexión, respuesta inválida,
timeout, sesión expirada, almacenamiento seguro y error inesperado. En US02,
el fallo crítico es `secure-storage`; no se muestran claves, tokens, headers,
endpoints ni stack traces.

## SOLID con archivos concretos

### Responsabilidad única

- `LogoutButton`: representa la acción.
- `LogoutConfirmation`: solicita una decisión.
- `useLogout`: coordina estado de presentación y navegación.
- `LogoutUser`: expresa el caso de uso.
- `AuthRepositoryImpl`: coordina orígenes de autenticación.
- `SecureAuthLocalDataSource`: administra persistencia de sesión.
- `SessionProvider`: conserva el estado global.
- `createDependencies`: construye el grafo.

### Abierto/cerrado

`SecureStorage`, `AuthLocalDataSource` y `AuthRepository` permiten reemplazar
infraestructura sin modificar `LogoutUser`.

### Sustitución de Liskov

Los fakes de Jest sustituyen casos de uso, repositorios, data sources y
almacenamiento respetando sus contratos asíncronos.

### Segregación de interfaces

`AuthRepository` contiene login, restauración y logout. No recibe operaciones
de catálogo, carrito o productos. `SecureStorage` mantiene solamente lectura,
escritura y eliminación de valores.

### Inversión de dependencias

`LogoutUser` recibe `AuthRepository` por constructor. No importa React,
SecureStore, Expo Router, `fetch` ni implementaciones concretas.

## Estrategia de pruebas

Las pruebas no usan internet y cubren:

- Ejecución e idempotencia de `LogoutUser`.
- Eliminación de todas las claves y conservación de datos ajenos.
- Propagación de fallos reales de almacenamiento.
- Ausencia de peticiones ficticias de logout.
- Apertura, cancelación, carga, doble confirmación y reintento del hook.
- P13, confirmación accesible y P14.
- Regresión completa de login, conectividad, roles, persistencia y navegación
  de US01.

El movimiento físico de foco del lector de pantalla se valida manualmente en
Android/iOS; las pruebas automáticas verifican labels, modalidad, roles y orden
estructural.
