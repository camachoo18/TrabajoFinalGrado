const express = require('express');
const router = express.Router();
const googleController = require('../controllers/googleController');
const authenticateToken = require('../middlewares/authenticateToken');


// Rutas públicas relacionadas con la autenticación de Google
router.get('/auth-status', authenticateToken, googleController.checkAuthStatus); // Verificar si el usuario está autenticado con Google
router.get('/auth-url', googleController.getAuthUrl); // Obtener la URL de autenticación de Google
router.get('/callback', googleController.handleCallback); // Manejar el callback de Google después de la autenticación

// Rutas protegidas relacionadas con la importación de contactos
router.post('/import-contacts', authenticateToken, googleController.importContacts); // Importar contactos desde Google

module.exports = router; 