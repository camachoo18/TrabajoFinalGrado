const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authenticateToken = require('../middlewares/authenticateToken');
const validateContact = require('../middlewares/validateContact');
const validateApiKey = require('../middlewares/validateApiKey');
const { auth } = require('googleapis/build/src/apis/abusiveexperiencereport');

// Todas las rutas requieren autenticación


// Rutas adicionales (más específicas primero)
router.get('/search', authenticateToken, contactController.search);
router.get('/category/:categoryId', authenticateToken, contactController.filterByCategory);
router.get('/filter', authenticateToken, contactController.filterByCategory);

router.get('/contacts', validateApiKey, contactController.getAll);
// Rutas CRUD

router.get('/', authenticateToken, contactController.getAll);
router.get('/:id', authenticateToken, contactController.getById);
router.post('/', authenticateToken, validateContact, contactController.create);
router.put('/:id', authenticateToken, validateContact, contactController.update);
router.delete('/:id', authenticateToken, contactController.delete);

module.exports = router;