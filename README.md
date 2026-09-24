# app_tineda

Base multiplataforma para Android, iOS y web creada con React Native, Expo,
TypeScript estricto y Expo Router. Incluye una implementación vertical de
autenticación para mostrar Clean Architecture ligera, SOLID, Repository/Data Source,
casos de uso y Dependency Injection manual.

## Requisitos

- Node.js LTS compatible con Expo SDK 57 (22.13 o superior; se validó con Node 24).
- npm 11 o compatible.
- Expo Go en un dispositivo físico para la ruta más rápida de desarrollo.
- Android Studio solo si se desea un emulador Android local.
- macOS y Xcode para ejecutar un simulador o una compilación iOS local.

## Instalación

```bash
npm install
```

Copia `.env.example` como `.env` y ajusta los valores. Si no existe `.env`, la
aplicación usa Fake Store API y un tiempo límite de 10 segundos.

```env
EXPO_PUBLIC_API_URL=https://fakestoreapi.com
EXPO_PUBLIC_REQUEST_TIMEOUT_MS=10000
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

### Credenciales de Fake Store API

- Usuario administrador: `johnd`
- Contraseña: `m38rmF$`

La aplicación envía usuario y contraseña a `POST /auth/login`, obtiene el perfil
desde `GET /users` y asigna el rol según el ID: 1–2 Administrador, 3 Auditor y el
resto Cliente.

## Calidad

```bash
npm run format
npm run format:check
npm run lint
npm run typecheck
npm test
npx expo config --type public
```

## Autenticación y cierre de sesión

- El runtime siempre usa `AuthRepositoryImpl`; no existe un mock habilitado en producción.
- El inicio de sesión consume `POST /auth/login` y `GET /users`.
- Token y usuario mínimo se almacenan por separado en SecureStore; nunca se guarda la contraseña.
- Fake Store API no ofrece logout. US02 elimina localmente ambas claves después de una confirmación.

Todas las implementaciones se conectan en `src/app/di/createDependencies.ts`.

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
