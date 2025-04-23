require('dotenv').config(); // Cargar variables de entorno
const app = require('./app'); // Importar la aplicación configurada en app.js
const port = process.env.PORT || 3000;

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});