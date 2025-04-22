const express = require('express');
const router = express.Router();
const googleController = require('../controllers/googleController');
const authenticateToken = require('../middlewares/authenticateToken');

// Ruta pública para obtener URL de autenticación
router.get('/auth-url', googleController.getAuthUrl);

// Ruta pública para el callback de Google
router.get('/callback', googleController.handleCallback);

// Ruta protegida para importar contactos
router.post('/import-contacts', authenticateToken, googleController.importContacts);

module.exports = router; 