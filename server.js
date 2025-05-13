require('dotenv').config(); // Cargar variables de entorno
const app = require('./app'); // Importar la aplicación configurada en app.js
const port = process.env.PORT || 3000;

// Iniciar el servidor
app.listen(3000, '0.0.0.0', () => {
  console.log("Servidor corriendo en puerto 3000");
});
