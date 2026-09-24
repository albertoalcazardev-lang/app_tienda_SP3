# Fake Store — Sprint 3

Base multiplataforma para Android, iOS y web creada con React Native, Expo,
TypeScript estricto y Expo Router. Incluye una implementación vertical de
autenticación para mostrar Clean Architecture ligera, SOLID, Repository/Data Source,
casos de uso y Dependency Injection manual.

## Épica 3: inventario

Alta, edición y eliminación de productos con permisos de administrador. Consulta
[la guía de inventario](docs/INVENTARIO.md) para ejecutar, probar y explicar la
arquitectura MVVM, los casos de uso y la simulación de Fake Store.

Administrador: `admin@demo.com` / `Demo1234`. Cliente: `demo@demo.com`. Auditor:
`auditor@demo.com`. Todos usan la misma contraseña de demostración.

## Requisitos

- Node.js LTS compatible con Expo SDK 57 (22.13 o superior; se validó con Node 24).
- npm 11 o compatible.
- Expo Go en un dispositivo físico para la ruta más rápida de desarrollo.
- Android Studio solo si se desea un emulador Android local.
- macOS y Xcode para ejecutar un simulador o una compilación iOS local.

## Instalación

```bash
npm ci
```

Copia `.env.example` como `.env` y ajusta los valores. Si no existe `.env`, la
aplicación usa el repositorio mock y `https://api.example.com` como URL de reserva.

```env
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_USE_MOCKS=true
```

Las variables `EXPO_PUBLIC_*` quedan incluidas en el bundle de la aplicación. Nunca
deben contener contraseñas, tokens privados, claves de firma ni secretos de backend.

## Ejecutar

```bash
npm start
npm run android
npm run ios
npm run web
```

En Expo Go, escanea el QR que muestra `npm start`. El teléfono y el equipo deben estar
en la misma red, salvo que se utilice el modo túnel.

### Credenciales de demostración

- Correo: `demo@demo.com`
- Contraseña: `Demo1234`

Estas credenciales solo existen en `MockAuthRepository` y no forman parte de la
implementación remota.

## Calidad

```bash
npm run format
npm run format:check
npm run lint
npm run typecheck
npm test
npx expo config --type public
```

## Seleccionar repositorio mock o remoto

- `EXPO_PUBLIC_USE_MOCKS=true`: usa `MockAuthRepository`, persiste la sesión en
  SecureStore en móvil (sessionStorage en web) y no necesita backend de autenticación.
  El inventario sí usa la API pública de Fake Store.
- `EXPO_PUBLIC_USE_MOCKS=false`: usa `AuthRepositoryImpl`, preparado para:
  `POST /auth/login`, `GET /auth/me` y `POST /auth/logout`.

El cambio se decide exclusivamente en `src/app/di/createDependencies.ts`. Pantallas,
hooks y casos de uso no cambian.

## Agregar una funcionalidad

1. Crea `src/features/<feature>/domain` con entidades, contrato de repositorio y casos
   de uso sin importar React, Expo o infraestructura.
2. Agrega DTO, mapper, Data Sources e implementación en `data`.
3. Agrega componentes, hook controlador y pantallas en `presentation`.
4. Registra las implementaciones concretas y casos de uso en el Composition Root.
5. Expón rutas delgadas desde `app/`.
6. Añade pruebas de dominio, datos y presentación.

No coloques capacidades no relacionadas en una carpeta global `services/`. `shared/`
se reserva para mecanismos reutilizables que no pertenecen a una funcionalidad.

## Expo Go y development build

Expo Go es un cliente genérico adecuado para esta base y para módulos incluidos en
Expo Go. Un development build es una aplicación propia con módulos nativos y
configuración específica; es necesario cuando se agregan módulos no incluidos en
Expo Go o se prueban cambios nativos.

Para preparar un development build:

```bash
npx expo install expo-dev-client
npx expo run:android
# En macOS:
npx expo run:ios
```

También se puede usar EAS Build después de configurar el proyecto Expo.

## Generación nativa

El repositorio no contiene `android/` ni `ios/`; usa Continuous Native Generation.
Genera esas carpetas solo cuando sean necesarias:

```bash
npx expo prebuild
npx expo run:android
# En macOS:
npx expo run:ios
```

Las carpetas generadas están ignoradas para que `app.config.ts` y los config plugins
sean la fuente de verdad.

## Estructura principal

```text
app/                         Rutas de Expo Router
src/app/config/              Configuración validada
src/app/di/                  Composition Root y Context de DI
src/app/providers/           Proveedores generales
src/features/auth/domain/    Entidades, contratos y casos de uso
src/features/auth/data/      DTO, mappers, Data Sources y repositorios
src/features/auth/presentation/ Componentes, hooks, sesión y pantallas
src/shared/                  UI, errores, HTTP, SecureStore y tema reutilizable
tests/unit/                  Pruebas de dominio y repositorios
tests/integration/           Prueba vertical de presentación
docs/ARCHITECTURE.md         Decisiones y reglas arquitectónicas
```

Los recursos binarios permanecen en `assets/`, en la raíz, porque Expo los resuelve
desde `app.config.ts`. El otro ajuste intencional es que el plugin de Expo Router fija
explícitamente `root: "app"`: la carpeta
`src/app/` contiene DI y configuración, y sin esta opción Router intentaría tratarla
como una carpeta de rutas.

Consulta [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para el flujo de dependencias,
la matriz de imports y ejemplos concretos de SOLID.
