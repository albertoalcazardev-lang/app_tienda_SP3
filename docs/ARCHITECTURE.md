# Arquitectura de Mercado US01

## Objetivo

US01 autentica a una persona, identifica su ID real, asigna un perfil local,
persiste una sesión mínima y protege la navegación. La solución utiliza Clean
Architecture ligera, casos de uso, Repository Pattern, Data Source Pattern e
inyección manual mediante constructor.

## Estructura

```text
src/
├── app/
│   └── rutas Expo Router  Rutas públicas, protegidas y redirección inicial.
├── application/
│   ├── config/            Configuración de entorno.
│   ├── di/                Composition Root y contratos de dependencias.
│   └── providers/         Montaje de providers globales.
├── features/auth/
│   ├── domain/            Entidades, contratos, regla de roles y casos de uso.
│   ├── data/              DTO, mapper, data sources y repositorio concreto.
│   └── presentation/      Componentes, pantallas y hooks controladores.
└── shared/
    ├── errors/            Errores tipados independientes de la interfaz.
    ├── http/              Cliente fetch y abstracción de conectividad.
    ├── storage/           Contrato e implementación de almacenamiento seguro.
    └── theme/             Tokens visuales compartidos.
```

Los archivos de ruta permanecen delgados y solo renderizan pantallas o
layouts. Ningún componente visual ejecuta `fetch` ni accede a SecureStore.

## Flujo de dependencias

```text
FetchHttpClient + ExpoConnectivity
              |
              v
   ApiAuthRemoteDataSource
              |
              v
      AuthRepositoryImpl <--- SecureAuthLocalDataSource <--- ExpoSecureStorage
              |
              v
 LoginUser / GetCurrentSession
              |
              v
      DependenciesProvider
              |
              v
     useLogin / useSession
              |
              v
 LoginScreen / Expo Router
```

`createDependencies.ts` es el Composition Root. Es el único lugar que conoce
las implementaciones concretas y conecta cada abstracción con su adaptador.

## Flujo de inicio de sesión

1. `SessionProvider` ejecuta `GetCurrentSession` al iniciar.
2. Mientras restaura, la aplicación conserva un estado `loading` y no muestra
   una ruta incorrecta.
3. Sin sesión, Expo Router habilita el grupo `(auth)` y bloquea `(main)`.
4. `useLogin` valida campos y evita envíos duplicados.
5. `ApiAuthRemoteDataSource` consulta `ExpoConnectivity`.
6. Sin red, lanza un error `offline` antes de utilizar el cliente HTTP.
7. Con red, envía `POST /auth/login`.
8. Una respuesta 400, 401 o 403 se convierte en `invalid-credentials`.
9. Una respuesta exitosa debe incluir un token no vacío.
10. Como el token de Fake Store no contiene el ID, se ejecuta `GET /users` y
    se localiza el nombre de usuario exacto.
11. `UserMapper` transforma el DTO y `resolveUserRole` asigna el perfil.
12. `AuthRepositoryImpl` guarda la sesión solamente después de completar toda
    la validación.
13. `useSession` actualiza el estado global y Expo Router habilita `(main)`.
14. La navegación usa reemplazo; Atrás no recupera Login.

## Persistencia segura

`SecureAuthLocalDataSource` guarda dos valores:

- Token.
- Usuario mínimo: ID, usuario, correo, nombre visible y rol.

No guarda la contraseña. Si la escritura queda incompleta o los datos
persistidos no son válidos, limpia ambas claves y devuelve una sesión nula.

`ExpoSecureStorage` utiliza el almacén cifrado del sistema en Android y el
Keychain en iOS. En web usa memoria volátil, ya que SecureStore no ofrece un
almacén web nativo y no se desea degradar la seguridad con almacenamiento
persistente sin cifrar.

## Errores tipados

La infraestructura distingue:

- `invalid-credentials`
- `offline`
- `invalid-response`
- `timeout`
- `unexpected`

Solo `useLogin` traduce estos códigos a mensajes de presentación. Ninguna
pantalla recibe endpoints, códigos HTTP, tokens o stack traces.

## Aplicación de SOLID

### Responsabilidad única

- `LoginScreen` renderiza.
- `useLogin` coordina el estado de presentación.
- `LoginUser` ejecuta el caso de uso.
- `AuthRepositoryImpl` coordina orígenes de datos.
- Los data sources encapsulan API y almacenamiento.
- `UserMapper` transforma DTO en entidad.
- `createDependencies` construye el grafo.

### Abierto/cerrado

`HttpClient`, `Connectivity` y `SecureStorage` pueden sustituirse sin modificar
el caso de uso ni la pantalla.

### Sustitución de Liskov

Las pruebas sustituyen contratos reales por fakes en memoria y conservan el
mismo comportamiento observable.

### Segregación de interfaces

Los contratos de US01 contienen únicamente operaciones de autenticación,
conectividad, HTTP o almacenamiento. No mezclan productos, carrito o usuarios
administrativos.

### Inversión de dependencias

Los casos de uso dependen de `AuthRepository`; el repositorio depende de
contratos de data source; la presentación recibe casos de uso por Context.

## Navegación

- `src/app/(auth)`: grupo público.
- `src/app/(main)`: grupo protegido.
- `Stack.Protected` selecciona el grupo accesible según el estado de sesión.
- `src/app/index.tsx` redirige al destino correspondiente.
- La restauración se completa antes de montar el navegador.

Esta protección es del cliente. La regla local de perfiles controla la futura
interfaz, pero no sustituye autorización real en un servidor.

## Diseño P02-P04

- Fondo azul hielo/gris lavanda.
- Marca provisional `m` en recuadro índigo.
- Campos blancos con etiquetas visibles.
- Acción primaria índigo de ancho completo.
- Banners rosa claro con texto explícito y región accesible.
- `SafeAreaView`, scroll y ajuste de teclado.
- Ancho máximo para pantallas amplias y margen adaptable desde 320 px.

P02 muestra el formulario normal. P03 agrega credenciales inválidas. P04 agrega
el aviso de falta de conexión. Los mensajes no dependen únicamente del color.

## Estrategia de pruebas

Las pruebas viven fuera de `src/app` y no consumen internet. Cubren:

- Regla de perfiles.
- Casos de uso.
- Solicitudes y respuestas del data source remoto.
- Ausencia de HTTP sin conexión.
- Persistencia, restauración y descarte de datos incompletos.
- Mapeo y coordinación del repositorio.
- Estado del hook, doble envío y navegación.
- Representación de P02, P03 y P04.
