const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authenticateToken = require('../middlewares/authenticateToken');
const validateContact = require('../middlewares/validateContact');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas CRUD
router.get('/', contactController.getAll);
router.get('/:id', contactController.getById);
router.post('/', validateContact, contactController.create);
router.put('/:id', validateContact, contactController.update);
router.delete('/:id', contactController.delete);

// Rutas adicionales
router.get('/search', contactController.search);
router.get('/category/:categoryId', contactController.filterByCategory);
router.get('/filter', contactController.filterByCategory);

module.exports = router; 