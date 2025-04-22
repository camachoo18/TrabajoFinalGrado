const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const auth = require('../middlewares/auth');

// Rutas públicas
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);

// Rutas protegidas
router.get('/isAuthenticated', auth, AuthController.checkAuth);
router.post('/logout', auth, AuthController.logout);

module.exports = router; 