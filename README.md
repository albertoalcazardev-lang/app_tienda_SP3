# Mercado - US01 Login y asignación local de perfiles

Aplicación móvil y web construida con React Native, Expo SDK 57, Expo Router y
TypeScript estricto. Esta entrega implementa exclusivamente US01 y los estados
visuales P02, P03 y P04.

## Alcance

- Inicio de sesión real mediante Fake Store API.
- Validación local de usuario y contraseña.
- Detección de conectividad antes de enviar credenciales.
- Mensajes diferenciados para credenciales inválidas y falta de conexión.
- Identificación del usuario autenticado y asignación local de perfil.
- Persistencia nativa de la sesión mediante `expo-secure-store`.
- Restauración de la sesión al abrir la aplicación.
- Rutas públicas y protegidas con Expo Router.
- Pantalla protegida mínima; el catálogo pertenece a historias posteriores.

No se implementan registro, recuperación de contraseña, catálogo, carrito ni
gestión de productos.

## Requisitos

- Node.js 22.13 o posterior compatible con Expo SDK 57.
- npm.
- Android Studio y un emulador, o Expo Go en un dispositivo compatible.
- Visual Studio Code.

## Instalación

Desde la raíz del proyecto:

```powershell
npm install
Copy-Item .env.example .env
```

La variable pública disponible es:

```env
EXPO_PUBLIC_API_URL=https://fakestoreapi.com
```

No contiene secretos. La URL también tiene ese valor como respaldo para
permitir el arranque cuando `.env` todavía no existe.

## Ejecución

```powershell
npm start
npm run android
npm run web
```

La ejecución local de iOS requiere macOS:

```powershell
npm run ios
```

Para abrir la carpeta actual en Visual Studio Code:

```powershell
code .
```

## Verificación

```powershell
npm run format:check
npm run lint
npm run typecheck
npm test
npx expo config
```

Las pruebas usan fakes inyectados y no requieren internet.

## Cómo comprobar US01

### P02 - Inicio de sesión

1. Inicia la aplicación.
2. Confirma que aparecen el logotipo, el título, ambos campos y el botón.
3. Usa una cuenta válida publicada por Fake Store API.
4. Confirma que el botón muestra `Iniciando sesión…` durante la solicitud.
5. Comprueba que se abre la pantalla protegida con el perfil asignado.

### P03 - Credenciales inválidas

1. Introduce credenciales incorrectas.
2. Pulsa `Iniciar sesión`.
3. Confirma el mensaje `Usuario o contraseña inválidos`.
4. Comprueba que el formulario conserva los datos y permite corregirlos.

### P04 - Sin conexión

1. Desactiva Wi-Fi y datos en el dispositivo o emulador.
2. Completa ambos campos y pulsa `Iniciar sesión`.
3. Confirma el mensaje `Sin conexión. Revisa tu acceso a internet.`.
4. Recupera la conexión y vuelve a intentarlo sin reiniciar la aplicación.

## Asignación de perfiles

| ID de usuario              | Perfil        |
| -------------------------- | ------------- |
| 1 y 2                      | Administrador |
| 3                          | Auditor       |
| Cualquier otro ID positivo | Cliente       |

La regla vive en una función pura y no se repite en pantallas.

## Endpoints

| Método | Ruta          | Uso                                                         |
| ------ | ------------- | ----------------------------------------------------------- |
| POST   | `/auth/login` | Valida las credenciales y entrega el token.                 |
| GET    | `/users`      | Localiza el ID y los datos mínimos del usuario autenticado. |

Fake Store API devuelve únicamente el token en el login y su payload contiene
el nombre de usuario, no el ID. Por eso, después de un login exitoso, la capa de
datos consulta usuarios y exige una coincidencia exacta antes de construir la
sesión. Nunca se inventa un ID.

## Almacenamiento

En Android e iOS, el token y los datos mínimos del usuario se guardan mediante
`expo-secure-store`. La contraseña nunca se guarda. En web, SecureStore no está
disponible; se utiliza memoria volátil para no persistir el token en un medio
inseguro. Por lo tanto, la sesión web se pierde al recargar.

## Arquitectura

Consulta [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para conocer las capas,
la inyección de dependencias, SOLID y el flujo completo.

## Limitaciones

- Fake Store API es un servicio académico y su disponibilidad no está
  garantizada.
- El perfil es una regla local de la aplicación, no una autorización emitida
  por el servidor.
- La pantalla protegida es deliberadamente mínima hasta implementar P01 y P15.
- La plantilla oficial de SDK 57 usa `src/app/` para Expo Router. No se agrega
  otra carpeta `app/` en la raíz.
- No se incluye `babel.config.js`: Expo SDK 57 configura Babel internamente y
  US01 no requiere transformaciones personalizadas.
