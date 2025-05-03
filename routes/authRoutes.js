const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authenticateToken = require('../middlewares/authenticateToken');
const apiLimiter = require('../middlewares/rateLimiter');
const validateApiKey = require('../middlewares/validateApiKey');

// Rutas públicas
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.get('/apikey', authenticateToken, AuthController.getApiKey);
router.post('/regenerate-apikey', authenticateToken, AuthController.regenerateApiKey);



// ruta para exponer la API
router.get('/contacts/:username',apiLimiter, authenticateToken,validateApiKey, AuthController.getUserByUsername)
// Rutas protegidas
router.get('/isAuthenticated', authenticateToken, AuthController.checkAuth);
// Ruta para cerrar sesión (no requiere autenticación)
router.post('/logout', AuthController.logout);

module.exports = router;