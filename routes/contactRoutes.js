const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authenticateToken = require('../middlewares/authenticateToken');
const validateContact = require('../middlewares/validateContact');
const validateApiKey = require('../middlewares/validateApiKey');

// Todas las rutas requieren autenticación


// Rutas adicionales (más específicas primero)
router.get('/search', contactController.search);
router.get('/category/:categoryId', contactController.filterByCategory);
router.get('/filter', contactController.filterByCategory);

// Rutas CRUD
router.get('/', validateApiKey, contactController.getAll);

router.get('/:id', contactController.getById);
router.post('/', validateContact, contactController.create);
router.put('/:id', validateContact, contactController.update);
router.delete('/:id', contactController.delete);

module.exports = router;