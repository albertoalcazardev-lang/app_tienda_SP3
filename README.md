# Mercado - US01 y US02

Aplicación React Native construida con Expo SDK 57, Expo Router y TypeScript
estricto. Esta entrega conserva el inicio de sesión de US01 e incorpora el
cierre seguro de sesión de US02.

## Alcance implementado

### US01 - Inicio de sesión

- Autenticación mediante Fake Store API.
- Identificación del usuario y asignación local de perfil.
- Persistencia nativa con `expo-secure-store`.
- Restauración de sesión y rutas protegidas.
- Manejo de credenciales inválidas y falta de conexión.

### US02 - Cierre de sesión

- P13: cuenta autenticada con información mínima, perfil y acción accesible
  `Cerrar sesión`.
- Confirmación personalizada con cancelar, confirmar y estado
  `Cerrando sesión…`.
- Prevención de confirmaciones duplicadas.
- Eliminación obligatoria de la sesión persistida.
- Limpieza del estado global y de datos privados mantenidos en memoria.
- P14: regreso al Login con el aviso exacto
  `Sesión cerrada. Tu información local se ha eliminado.`.
- Rutas protegidas retiradas del historial al cambiar a `unauthenticated`.
- Reintento seguro cuando falla el almacenamiento.

No se implementan catálogo, carrito, productos ni historias posteriores. Los
elementos inferiores de P13 son únicamente composición visual sin lógica nueva.

## Requisitos

- Node.js 22.13 o posterior compatible con Expo SDK 57.
- npm.
- Visual Studio Code.
- Android Studio, un emulador o Expo Go.
- macOS para ejecutar iOS localmente.

## Instalación

```powershell
cd "A:\Apps moviles\Sprint 03\US02 - Cierre de sesión y limpieza de credenciales"
npm install
Copy-Item .env.example .env
code .
```

Variable pública:

```env
EXPO_PUBLIC_API_URL=https://fakestoreapi.com
```

No contiene secretos. La contraseña nunca se persiste.

## Ejecución

```powershell
npm start
npm run android
npm run web
npm run ios
```

## Verificación

```powershell
npm run format:check
npm run lint
npm run typecheck
npm test
npx expo config
npx expo-doctor
```

Las pruebas usan fakes inyectados y no dependen de internet.

## Cómo comprobar US02

### Abrir y cancelar

1. Inicia sesión con una cuenta válida de Fake Store API.
2. Comprueba P13: `Mi cuenta`, datos del usuario, rol y `Cerrar sesión`.
3. Pulsa `Cerrar sesión`.
4. Confirma que la sesión continúa activa detrás de la confirmación.
5. Pulsa `Cancelar`.
6. Verifica que permaneces en P13 y que el cierre no se ejecutó.

### Confirmar

1. Abre nuevamente la confirmación.
2. Pulsa `Sí, cerrar sesión`.
3. Comprueba que las acciones se deshabilitan durante el proceso.
4. Verifica que aparece el Login con el aviso de sesión cerrada.
5. Pulsa Atrás en Android: la zona autenticada no debe reaparecer.

### Probar sin conexión

1. Inicia sesión y espera a llegar a P13.
2. Desactiva Wi-Fi y datos del emulador o dispositivo.
3. Confirma el cierre.
4. La aplicación debe eliminar la sesión local y mostrar el Login sin carga
   infinita. No existe una petición remota que pueda bloquear esta operación.

### Probar un fallo de almacenamiento

Este caso se cubre con fakes en las pruebas. Si SecureStore no puede eliminar
alguna clave, la confirmación permanece abierta, se muestra un mensaje
comprensible y no se declara falsamente que la sesión fue eliminada.

## API y política de cierre

Fake Store API publica `POST /auth/login`, pero no proporciona un endpoint de
logout. US02 no realiza una solicitud ficticia. La política documentada es:

> Cierre remoto de mejor esfuerzo y cierre local obligatorio.

Cuando exista un endpoint real, podrá agregarse al data source remoto. Aunque
ese cierre falle, la limpieza local deberá seguir ejecutándose. Actualmente la
operación es completamente local y funciona sin conexión.

## Datos eliminados

`SecureAuthLocalDataSource.clearSession` intenta eliminar siempre:

- `mercado.session.token`.
- `mercado.session.user`, que contiene ID, rol, usuario, correo y nombre
  visible.

Las claves se centralizan en `AUTH_STORAGE_KEYS`. La eliminación de claves
inexistentes es válida e idempotente. Se intentan borrar ambas claves incluso
si una operación falla. No se elimina información pública ajena a la sesión.

No existe una caché remota global en esta entrega. Al salir se limpian el
objeto `Session`, el usuario y su rol del `SessionProvider`. Cuando se agregue
una caché privada en historias posteriores, deberá conectarse al mismo flujo.

## Navegación segura

`Stack.Protected` habilita `(main)` únicamente con estado `authenticated`.
Después del cierre, `useLogout` limpia el contexto y usa `router.replace` hacia
el Login. Al cambiar el guard, Expo Router retira las pantallas protegidas del
historial, por lo que Atrás no recupera P13.

## Mockups P13 y P14

El documento visual muestra P13 como la cuenta autenticada y P14 como el Login
posterior al cierre. El criterio funcional también exige confirmación previa,
pero el PDF no dibuja ese estado. Por ello se implementó un modal accesible con
el mismo lenguaje visual y P14 se conservó como resultado final con su aviso
verde exacto.

## Arquitectura

Consulta [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para conocer las capas,
Dependency Injection, SOLID, flujos y estrategia de pruebas.

## Dependencias

US02 no agrega dependencias. Utiliza `Modal`, `Pressable` y componentes de
React Native, además de Expo Router y SecureStore ya instalados por US01.

## Limitaciones

- Fake Store API es académica y no ofrece logout ni invalidación remota.
- El perfil se asigna localmente y no sustituye autorización del servidor.
- En web, la sesión vive únicamente en memoria porque SecureStore no ofrece un
  almacén web nativo; al recargar se pierde.
- El movimiento real del foco dentro del modal depende de cada plataforma. La
  jerarquía, labels y modalidad accesible sí se verifican automáticamente.
- npm informa vulnerabilidades moderadas transitivas de Expo. No se aplica
  `npm audit fix --force` porque podría introducir versiones incompatibles.
