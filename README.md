
# TrabajoFinalGrado

## Descripción

Esta aplicación es una **agenda de contactos** con funcionalidades adicionales como monitoreo de URLs y autenticación de usuarios. Permite a los usuarios gestionar sus contactos, realizar búsquedas tanto de número de teléfono, email, nombre, etc., y monitorear el estado de URLs en tiempo real. La aplicación está protegida mediante autenticación basada en tokens y soporta integración con Google OAuth 2.0.

---

## Funcionalidades principales

### 1. **Gestión de contactos**
- Agregar nuevos contactos con información como nombre, teléfono, email, notas y categoría.
- Ver una lista de contactos existentes.
- Editar y eliminar contactos.
- Buscar contactos por nombre, teléfono, email o notas.
- Descargar contactos en formato CSV.

### 2. **Monitoreo de URLs**
- Permite a los usuarios monitorear el estado de URLs en tiempo real.
- Configuración de intervalos personalizados para realizar pings a las URLs.
- Visualización de logs en la interfaz con información sobre el estado de las URLs.

### 3. **Autenticación**
- Registro de nuevos usuarios.
- Inicio de sesión con autenticación basada en tokens JWT.
- Integración con Google OAuth 2.0 para autenticación externa.
- Ademas utilizo httpOnly
- Generación y regeneración de APIKEYs únicas para cada usuario.

### 4. **Exposición de la API**
- Los usuarios pueden acceder a su información de contactos mediante la APIKEY de cada usuario independiente.
- Ejemplo de uso:

```bash
curl -X GET "http://localhost:3000/contacts" -H "APIKEY: 487946c6fdf4129a94ab0b557c6de5e563ef5c289a6a7283d0ba062b834d59a7"
```

---

## Estructura del proyecto

### Raíz del proyecto
- **app.js**: Archivo principal que configura el servidor Express, middlewares y rutas.
- **.env**: Contiene variables de entorno como claves secretas y configuraciones sensibles.
- **.gitignore**: Lista de archivos y carpetas que no deben ser rastreados por Git.
- **contacts.db**: Base de datos SQLite que almacena los contactos.
- **database.js**: Archivo para la configuración y manejo de la base de datos.
- **package.json**: Archivo de configuración de Node.js que incluye dependencias y scripts.
- **README.md**: Documentación del proyecto.
- **server.js**: Archivo que inicia el servidor Express configurado en app.js.

### Carpeta `controllers/`
Contiene la lógica de negocio para cada entidad de la aplicación:
- **authController.js**: Maneja el registro, inicio de sesión, regeneración de APIKEY y autenticación.
- **categoryController.js**: Maneja la gestión de categorías.
- **contactController.js**: Maneja las operaciones CRUD de contactos.
- **googleController.js**: Maneja la integración con Google OAuth 2.0.

### Carpeta `db/`
Contiene todo lo relacionado con la base de datos:
- **contacts.db**: Base de datos SQLite que almacena los contactos.
- **credentials.json**: Credenciales para la integración con Google OAuth.
- **database.js**: Configuración y conexión a la base de datos SQLite.

### Carpeta `middlewares/`
Contiene middlewares reutilizables:
- **auth.js**: Middleware para manejar la autenticación.
- **authenticateToken.js**: Verifica la validez del token JWT.
- **rateLimiter.js**: Implementa límites de tasa para proteger la API.
- **validateApiKey.js**: Valida la APIKEY proporcionada por el usuario.
- **validateContact.js**: Valida los datos de los contactos antes de procesarlos.

### Carpeta `models/`
Contiene la lógica de acceso a la base de datos:
- **Auth.js**: Maneja la autenticación y los usuarios.
- **Category.js**: Maneja las categorías.
- **Contact.js**: Maneja los contactos.
- **User.js**: Maneja las operaciones relacionadas con los usuarios.

### Carpeta `public/`
Contiene los archivos públicos accesibles desde el navegador.

#### Subcarpeta `css/`
- **styles.css**: Archivo principal de estilos para toda la aplicación.

#### Subcarpeta `html/`
- **add-contact.html**: Página para agregar nuevos contactos.
- **home.html**: Página de inicio.
- **index.html**: Página principal de la aplicación.
- **login.html**: Página de inicio de sesión.
- **logout.html**: Página de cierre de sesión.
- **monitor.html**: Página para monitorear URLs.
- **register.html**: Página de registro de usuarios.
- **view-contacts.html**: Página para ver y gestionar contactos.

#### Subcarpeta `js/`
- **auth.js**: Manejo de autenticación y protección de rutas.
- **categoryManager.js**: Gestión de categorías.
- **contactManager.js**: CRUD de contactos.
- **downloadManager.js**: Descarga de contactos en formato CSV.
- **filterManager.js**: Filtrado de contactos.
- **uiHelper.js**: Funciones auxiliares para la interfaz de usuario.
- **viewContacts.js**: Manejo de la vista de contactos.

### Carpeta `routes/`
Define las rutas de la aplicación:
- **authRoutes.js**: Rutas relacionadas con la autenticación.
- **categoryRoutes.js**: Rutas para la gestión de categorías.
- **contactRoutes.js**: Rutas para la gestión de contactos.
- **googleRoutes.js**: Rutas para la integración con Google OAuth.

### Carpeta `services/`
Contiene servicios externos o integraciones:
- **googleOAuthService.js**: Configuración y manejo de Google OAuth 2.0. Es el más importante, ya que incluye además el refresco de tokens.

### Carpeta `src/`
- **googleAuthHelper.js**: Este archivo no encapsula las funcionalidades en una clase y utiliza funciones independientes.

---

## Tecnologías utilizadas

- **Backend**: Node.js con Express.
- **Base de datos**: SQLite.
- **Frontend**: HTML, CSS y JavaScript. Diseño responsivo con estilos personalizados.
- **Autenticación**:
  - JWT (JSON Web Tokens) para proteger rutas y sesiones.
  - Google OAuth 2.0 para autenticación externa.
- **Monitoreo(en otro repositorio)**: Axios para realizar solicitudes HTTP a las URLs monitoreadas.

---

## Instalación

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
JWT_SECRET=CamachoAPP@2025
```

### 3. Iniciar el servidor
```bash
node server.js
```
