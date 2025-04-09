require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./database'); // Importa la base de datos desde el archivo database.js
const app = express();
const port = 3000;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nunjucks = require('nunjucks');
const axios = require('axios'); 
const { getAuthUrl, getAccessToken, getGoogleContacts } = require('./public/js/googleAuth'); // Importa las funciones de autenticación de Google

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
            return res.status(403).json({ error: 'Token inválido' });
        }
        //console.log('Usuario autenticado:', user); // Depuración
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

app.get('/html/monitor.html', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'monitor.html'));
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
    const query = 'SELECT nombre FROM categories';
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error al obtener las categorías:', err.message);
            res.status(500).send('Error al obtener las categorías.');
        } else {
            const categories = rows.map(row => row.nombre);
            res.json(categories); // Devuelve la lista de categorías al frontend
        }
    });
});
// Ruta para verificar si el usuario está autenticado
app.get('/checkAuth', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(200).json({ authenticated: false }); // No autenticado
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(200).json({ authenticated: false }); // Token inválido
        }
        res.status(200).json({ authenticated: true }); // Autenticado
    });
});


// Ruta para redirigir al usuario a Google para autenticarse
app.get('/auth/google', (req, res) => {
    const authUrl = getAuthUrl();
    res.redirect(authUrl);
});

// Ruta de callback para manejar el código de autorización
app.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;
    try {
        const tokens = await getAccessToken(code);
        console.log('Tokens obtenidos:', tokens); // Depuración
        res.redirect('/html/view-contacts.html'); // Redirigir a la vista de contactos
    } catch (err) {
        console.error('Error al obtener el token de acceso:', err);
        res.status(500).send('Error al autenticar con Google');
    }
});

// Ruta para importar contactos desde Google
app.get('/import-google-contacts', authenticateToken, async (req, res) => {
    try {
        const contacts = await getGoogleContacts();
        const userId = req.user.id;

        // Guardar los contactos en la base de datos
        const stmt = db.prepare('INSERT INTO contacts (nombre, email, telefono, user_id) VALUES (?, ?, ?, ?)');
        contacts.forEach(contact => {
            try {
                const nombre = contact.names?.[0]?.displayName || 'Sin Nombre';
                const email = contact.emailAddresses?.[0]?.value || '';
                const telefono = contact.phoneNumbers?.[0]?.value || '';
                stmt.run(nombre, email, telefono, userId);
            } catch (err) {
                console.error('Error al guardar contacto en la base de datos:', err);
            }
        });

        res.status(200).json({ message: 'Contactos importados correctamente' });
    } catch (err) {
        console.error('Error al importar contactos:', err);
        res.status(500).json({ error: 'Error al importar contactos' });
    }
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
    const userId = req.user.id; // Obtener el ID del usuario autenticado

    // Verificar duplicados en la base de datos
    const duplicateCheckQuery = 'SELECT COUNT(*) AS count FROM contacts WHERE telefono = ? AND user_id = ?';
    db.get(duplicateCheckQuery, [telefono, userId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Error al verificar duplicados' });
        }
        if (row.count > 0) {
            return res.status(400).json({ error: 'El número de teléfono ya está registrado' });
        }

        // Insertar el contacto
        const stmt = db.prepare('INSERT INTO contacts (nombre, telefono, email, notas, categoria, user_id) VALUES (?, ?, ?, ?, ?, ?)');
        stmt.run(nombre, telefono, email, notas, categoria, userId, function (err) {
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
    const userId = req.user.id; // Obtener el ID del usuario autenticado
    let query = 'SELECT * FROM contacts WHERE user_id = ?';
    const params = [userId];

    if (categoria && categoria !== 'Todas') {
        query += ' AND categoria = ?';
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
    const userId = req.user.id; // Obtener el ID del usuario autenticado
    const query = 'SELECT * FROM contacts WHERE user_id = ?';
    db.all(query, [userId], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Error al obtener los contactos.');
        } else {
            res.json(rows); // Devuelve la lista de contactos del usuario
        }
    });
});

app.delete('/contacts/delete/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id; // Obtener el ID del usuario autenticado

    // Verificar que el contacto pertenece al usuario
    const checkQuery = 'SELECT * FROM contacts WHERE id = ? AND user_id = ?';
    db.get(checkQuery, [id, userId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Error al verificar el contacto' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Contacto no encontrado o no autorizado' });
        }

        // Eliminar el contacto
        const stmt = db.prepare('DELETE FROM contacts WHERE id = ? AND user_id = ?');
        stmt.run(id, userId, function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.status(200).json({ message: 'Contacto eliminado' });
            }
        });
    });
});

app.put('/contacts/edit/:id', authenticateToken, validateContact, (req, res) => {
    const { id } = req.params;
    const { nombre, telefono, email, notas, categoria } = req.body;
    const userId = req.user.id; // Obtener el ID del usuario autenticado

    // Verificar que el contacto pertenece al usuario
    const checkQuery = 'SELECT * FROM contacts WHERE id = ? AND user_id = ?';
    db.get(checkQuery, [id, userId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Error al verificar el contacto' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Contacto no encontrado o no autorizado' });
        }

        // Actualizar el contacto
        const stmt = db.prepare('UPDATE contacts SET nombre = ?, telefono = ?, email = ?, notas = ?, categoria = ? WHERE id = ? AND user_id = ?');
        stmt.run(nombre, telefono, email, notas, categoria, id, userId, function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: 'Contacto actualizado' });
        });
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
                return res.status(500).json({ error: 'Error al registrar usuario, ya existe' });
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

const { pingWebsite } = require('./public/js/monitor');
const monitoringIntervals = {}; // Objeto para almacenar los intervalos por URL
const monitoringClients = []; // Lista de clientes conectados para SSE

// Endpoint para iniciar el monitoreo de URLs
app.post('/start-monitoring', (req, res) => {
    const { urls, interval } = req.body;
    if (!urls || !Array.isArray(urls) || !interval) {
        return res.status(400).json({ error: 'Debes proporcionar un array de URLs y un intervalo' });
    }

    urls.forEach(url => {
        if (monitoringIntervals[url]) {
            clearInterval(monitoringIntervals[url]); // Detener cualquier monitoreo previo para esta URL
            console.log(`Intervalo existente para ${url} detenido.`);
        }

        // Iniciar un nuevo intervalo para la URL
        monitoringIntervals[url] = setInterval(async () => {
            const message = `Haciendo ping a ${url}...`;
            console.log(message);
            sendToClients(message); // Enviar mensaje a los clientes conectados

            try {
                const response = await pingWebsite(url);
                const statusMessage = `Respuesta de ${url}: ${response}`;
                console.log(statusMessage);
                sendToClients(statusMessage); // Enviar mensaje a los clientes conectados
            } catch (err) {
                const errorMessage = `Error al hacer ping a ${url}: ${err.message}`;
                console.error(errorMessage);
                sendToClients(errorMessage); // Enviar mensaje a los clientes conectados
            }
        }, interval);

        console.log(`Monitoreo iniciado para ${url} cada ${interval / 1000} segundos.`);
    });

    res.status(200).json({ message: 'Monitoreo iniciado para las URLs proporcionadas' });
});

// Endpoint para detener el monitoreo de URLs
app.post('/stop-monitoring', (req, res) => {
    const { urls } = req.body;
    if (!urls || !Array.isArray(urls)) {
        return res.status(400).json({ error: 'Debes proporcionar un array de URLs' });
    }

    urls.forEach(url => {
        if (monitoringIntervals[url]) {
            clearInterval(monitoringIntervals[url]); // Detener el intervalo
            delete monitoringIntervals[url]; // Eliminarlo del objeto
            const message = `Monitoreo detenido para ${url}.`;
            console.log(message);
            //sendToClients(message); // Enviar mensaje a los clientes conectados
        }
    });

    res.status(200).json({ message: 'Monitoreo detenido para las URLs proporcionadas' });
});

// Endpoint para enviar mensajes de monitoreo en tiempo real (SSE)
app.get('/monitor-stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Agregar el cliente a la lista de clientes conectados
    monitoringClients.push(res);

    // Eliminar el cliente cuando se desconecte
    req.on('close', () => {
        const index = monitoringClients.indexOf(res);
        if (index !== -1) {
            monitoringClients.splice(index, 1);
        }
    });
});

// Endpoint para realizar un GET a una URL y devolver el estado
app.get('/ping-url', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Debes proporcionar una URL' });
    }

    try {
        const response = await axios.get(url, { timeout: 5000 }); // Timeout de 5 segundos
        res.status(200).json({
            status: response.status,
            statusText: response.statusText,
            data: response.data ? 'Contenido recibido' : 'Sin contenido',
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            status: error.response ? error.response.status : 'Sin respuesta',
        });
    }
});

// Función para enviar mensajes a todos los clientes conectados
function sendToClients(message) {
    monitoringClients.forEach(client => {
        client.write(`data: ${message}\n\n`);
    });
}
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});