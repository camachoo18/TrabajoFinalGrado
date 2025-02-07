require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./database'); // Importa la base de datos desde el archivo database.js
const app = express();
const port = 3000;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nunjucks = require('nunjucks');

const SECRET_KEY = process.env.SECRET_KEY;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configurar Nunjucks
nunjucks.configure('public/html', {
    autoescape: true,
    express: app
});

// Middleware para verificar el token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No autenticado' }); // Enviar un error 401 si no hay token
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' }); // Enviar un error 403 si el token es inválido
        }
        req.user = user;
        next();
    });
}

// Ruta para servir la página de inicio
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'home.html'));
});

// Ruta para servir la página de registro
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'register.html'));
});

// Ruta para servir la página de inicio de sesión
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
});

// Rutas protegidas para servir las páginas de la aplicación
app.get('/html/index.html', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

app.get('/html/view-contacts.html', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'view-contacts.html'));
});

app.get('/html/add-contact.html', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'add-contact.html'));
});

// Ruta para verificar si el usuario está autenticado
app.get('/isAuthenticated', authenticateToken, (req, res) => {
    res.status(200).json({ authenticated: true });
});

// Rutas protegidas para la API
app.get('/contacts/search', authenticateToken, (req, res) => {
    const query = req.query.q || ''; // Obtén la query de búsqueda (si no hay, usa una cadena vacía)
    const sql = `
        SELECT * FROM contacts
        WHERE 
            nombre LIKE ? OR
            telefono LIKE ? OR
            email LIKE ? OR
            notas LIKE ?
    `;
    const searchTerm = `%${query}%`; // Usa comodines para búsqueda parcial

    db.all(sql, [searchTerm, searchTerm, searchTerm, searchTerm], (err, rows) => {
        if (err) {
            console.error('Error al buscar contactos:', err.message);
            res.status(500).json({ error: 'Error al buscar contactos' });
        } else {
            res.json(rows);
        }
    });
});

app.get('/categories', authenticateToken, (req, res) => {
    const query = 'SELECT DISTINCT categoria FROM contacts';
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Error al obtener las categorías.');
        } else {
            const categories = rows.map(row => row.categoria);
            res.json(categories); // Devuelve la lista de categorías únicas al frontend
        }
    });
});

app.post('/categories/add', authenticateToken, (req, res) => {
    const { categoria } = req.body;

    if (!categoria) {
        return res.status(400).json({ error: 'La categoría es obligatoria' });
    }

    // Verificar si la categoría ya existe
    const duplicateCheckQuery = 'SELECT COUNT(*) AS count FROM categoria WHERE nombre = ?';
    db.get(duplicateCheckQuery, [categoria], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Error al verificar duplicados' });
        }
        if (row.count > 0) {
            return res.status(400).json({ error: 'La categoría ya existe' });
        }

        // Insertar nueva categoría
        const stmt = db.prepare('INSERT INTO categoria (nombre) VALUES (?)');
        stmt.run(categoria, function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.status(200).json({ id: this.lastID });
            }
        });
    });
});

app.post('/add', authenticateToken, validateContact, (req, res) => {
    const { nombre, telefono, email, notas, categoria } = req.body;

    // Verificar duplicados en la base de datos
    const duplicateCheckQuery = 'SELECT COUNT(*) AS count FROM contacts WHERE telefono = ?';
    db.get(duplicateCheckQuery, [telefono], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Error al verificar duplicados' });
        }
        if (row.count > 0) {
            return res.status(400).json({ error: 'El número de teléfono ya está registrado' });
        }

        // Insertar el contacto
        const stmt = db.prepare('INSERT INTO contacts (nombre, telefono, email, notas, categoria) VALUES (?, ?, ?, ?, ?)');
        stmt.run(nombre, telefono, email, notas, categoria, function (err) {
            if (err) {
                return res.status(500).json({ error: 'Error al agregar contacto' });
            }
            res.status(200).json({ id: this.lastID, categoria }); // Devolver la categoría junto con el ID
        });
    });
});

// Middleware para validar datos del contacto
function validateContact(req, res, next) {
    const { nombre, telefono, email, categoria } = req.body;

    // Verificar que los campos obligatorios estén presentes
    if (!nombre || !telefono || !email || !categoria) {
        return res.status(400).json({ error: 'Nombre, teléfono, email y categoría son obligatorios' });
    }

    // Validar que el nombre tenga al menos 2 caracteres
    if (nombre.length < 2) {
        return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres' });
    }

    // Validar que el nombre no contenga etiquetas HTML o JavaScript
    const scriptRegex = /<script[\s\S]*?>[\s\S]*?<\/script>/gi; // Detecta etiquetas <script>
    const htmlRegex = /<\/?[a-z][\s\S]*>/i; // Detecta cualquier etiqueta HTML
    if (scriptRegex.test(nombre) || htmlRegex.test(nombre)) {
        return res.status(400).json({ error: 'El nombre no puede contener etiquetas HTML o código malicioso' });
    }

    // Validar que el teléfono tenga exactamente 9 dígitos numéricos
    if (!/^\d{9}$/.test(telefono)) {
        return res.status(400).json({ error: 'El teléfono debe tener exactamente 9 dígitos' });
    }

    // Validar que el correo electrónico tenga un formato válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'El correo electrónico no tiene un formato válido' });
    }

    // Validar que la categoría no esté vacía
    if (!categoria.trim()) {
        return res.status(400).json({ error: 'Debe seleccionar una categoría.' });
    }

    next(); // Continuar si todo es válido
}

app.get('/contacts/filter', authenticateToken, (req, res) => {
    const categoria = req.query.categoria;
    let query = 'SELECT * FROM contacts';
    const params = [];

    if (categoria && categoria !== 'Todas') {
        query += ' WHERE categoria = ?';
        params.push(categoria);
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
        res.json(rows); // Devolver los contactos filtrados
    });
});

app.get('/contacts', authenticateToken, (req, res) => {
    const query = 'SELECT * FROM contacts';
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Error al obtener los contactos.');
        } else {
            res.json(rows); // Devuelve la lista de contactos al frontend
        }
    });
});

app.delete('/contacts/delete/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM contacts WHERE id = ?');
    stmt.run(id, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            // Obtener todos los contactos después de eliminar uno
            const query = 'SELECT * FROM contacts';
            db.all(query, [], (err, rows) => {
                if (err) {
                    console.error(err.message);
                    res.status(500).send('Error al obtener los contactos.');
                } else {
                    res.json(rows); // Devuelve todos los contactos restantes
                }
            });
        }
    });
});

app.put('/contacts/edit/:id', authenticateToken, validateContact, (req, res) => {
    const { id } = req.params;
    const { nombre, telefono, email, notas, categoria } = req.body;

    const stmt = db.prepare('UPDATE contacts SET nombre = ?, telefono = ?, email = ?, notas = ?, categoria = ? WHERE id = ?');
    stmt.run(nombre, telefono, email, notas, categoria, id, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(200).json({ message: 'Contacto actualizado' });
        }
    });
});

app.get('/contacts/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM contacts WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!row) {
            res.status(404).json({ message: 'Contacto no encontrado' });
        } else {
            res.json(row);
        }
    });
});

// Ruta de registro
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username y password son obligatorios' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
        stmt.run(username, hashedPassword, function (err) {
            if (err) {
                return res.status(500).json({ error: 'Error al registrar usuario' });
            }
            res.status(201).json({ message: 'Usuario registrado' });
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

// Ruta de inicio de sesión
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username y password son obligatorios' });
    }

    const query = 'SELECT * FROM users WHERE username = ?';
    db.get(query, [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Error al buscar usuario' });
        }
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});