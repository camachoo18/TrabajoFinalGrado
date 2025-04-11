# TrabajoFinalGrado

## Descripción
Esta aplicación es una **agenda de contactos** con funcionalidades adicionales como monitoreo de URLs y autenticación de usuarios. Permite a los usuarios gestionar sus contactos, realizar búsquedas tanto de numero de telefono, email, nombre etcc.. y monitorear el estado de URLs en tiempo real. La aplicación está protegida mediante autenticación basada en tokens.

## Funcionalidades principales

### 1. **Gestión de contactos**
- Agregar nuevos contactos con información como nombre, teléfono, email, notas y categoría.
- Ver una lista de contactos existentes.
- Editar y eliminar contactos.
- Buscar contactos por nombre, teléfono, email o notas.

### 2. **Monitoreo de URLs**
- Permite a los usuarios monitorear el estado de URLs en tiempo real.
- Configuración de intervalos personalizados para realizar pings a las URLs.
- Visualización de logs en la interfaz con información sobre el estado de las URLs.

### 3. **Autenticación**
- Registro de nuevos usuarios.
- Inicio de sesión con autenticación basada en tokens.
- Integración con Google OAuth 2.0 para autenticación externa.

## Estructura del proyecto
### Descripción de las carpetas y archivos

#### **Raíz del proyecto**
- **`.env`**: Contiene variables de entorno como claves secretas y configuraciones sensibles.
- **`.gitignore`**: Lista de archivos y carpetas que no deben ser rastreados por Git.
- **`contacts.db`**: Base de datos SQLite que almacena los contactos.
- **`database.js`**: Archivo para la configuración y manejo de la base de datos.
- **`package.json`**: Archivo de configuración de Node.js que incluye dependencias y scripts.
- **`README.md`**: Documentación del proyecto.
- **`server.js`**: Archivo principal del servidor que maneja las rutas y la lógica del backend.

#### **Carpeta `public/`**
Esta carpeta contiene todos los archivos públicos accesibles desde el navegador.

- **`css/`**: Contiene los estilos CSS.
  - **`styles.css`**: Archivo principal de estilos para toda la aplicación.

- **`html/`**: Contiene las vistas HTML.
  - **`add-contact.html`**: Página para agregar nuevos contactos.
  - **`home.html`**: Página de inicio.
  - **`index.html`**: Página principal de la aplicación.
  - **`login.html`**: Página de inicio de sesión.
  - **`logout.html`**: Página de cierre de sesión.
  - **`monitor.html`**: Página para monitorear URLs.
  - **`register.html`**: Página de registro de usuarios.
  - **`view-contacts.html`**: Página para ver y gestionar contactos.

- **`js/`**: Contiene los scripts JavaScript para la lógica del frontend.
  - **`auth.js`**: Manejo de autenticación y protección de rutas.
  - **`categoryManager.js`**: Gestión de categorías.
  - **`contactManager.js`**: CRUD de contactos.
  - **`credentials.json`**: Configuración de credenciales para Google OAuth.
  - **`dark-mode.js`**: Alternar entre modo claro y oscuro.
  - **`downloadManager.js`**: Descarga de contactos en formato CSV.
  - **`filterManager.js`**: Filtrado de contactos.
  - **`googleAuth.js`**: Integración con Google OAuth 2.0.
  - **`monitor.js`**: Lógica de monitoreo de URLs en el backend.
  - **`monitorUI.js`**: Lógica de monitoreo de URLs en el frontend.
  - **`script.js`**: Funciones generales del frontend.
  - **`uiHelper.js`**: Funciones auxiliares para la interfaz de usuario.
  - **`viewContacts.js`**: Manejo de la vista de contactos.

## Tecnologías utilizadas
- **Backend:**
  - Node.js con Express.
  - SQLite para la base de datos.
- **Frontend:**
  - HTML, CSS y JavaScript.
  - Diseño responsivo con estilos personalizados.
- **Autenticación:**
  - JWT (JSON Web Tokens) para proteger rutas y sesiones.
  - Google OAuth 2.0 para autenticación externa.
- **Monitoreo:**
  - Axios para realizar solicitudes HTTP a las URLs monitoreadas.
  
  ## Instalación
  npm install

  Configura el .env:
SECRET_KEY=CamachoAPP@2025

    npm start o node server.js


