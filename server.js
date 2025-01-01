const express = require('express');
const path = require('path');
const db = require('./database'); // Importa la base de datos desde el archivo database.js
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para buscar contactos
app.get('/contacts/search', (req, res) => {
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





// Ruta para agregar una nueva categoría
app.post('/categories/add', (req, res) => {
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

// Ruta para agregar un nuevo contacto con middleware de validación
// Ruta para agregar un nuevo contacto con middleware de validación
app.post('/add', validateContact, (req, res) => {
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

        // Verificar si la categoría es válida
        const validCategories = ['Trabajo', 'Amigos', 'Familia', 'Sin Categoría', 'Otra'];
        if (!validCategories.includes(categoria)) {
            return res.status(400).json({ error: 'Categoría inválida' });
        }

        // Insertar el contacto
        const stmt = db.prepare('INSERT INTO contacts (nombre, telefono, email, notas, categoria) VALUES (?, ?, ?, ?, ?)');
        stmt.run(nombre, telefono, email, notas, categoria, function (err) {
            if (err) {
                return res.status(500).json({ error: 'Error al agregar contacto' });
            }
            res.status(200).json({ id: this.lastID });
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

    // Validar que el teléfono tenga exactamente 9 dígitos numéricos
    if (!/^\d{9}$/.test(telefono)) {
        return res.status(400).json({ error: 'El teléfono debe tener exactamente 9 dígitos' });
    }

    next(); // Continuar si todo es válido
}


// Ruta para obtener todos los contactos
app.get('/contacts', (req, res) => {
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

// Ruta para eliminar un contacto
app.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM contacts WHERE id = ?');
    stmt.run(id, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(200).json({ message: 'Contacto eliminado' });
        }
    });
});

// Ruta para editar un contacto
app.put('/edit/:id', validateContact, (req, res) => {
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

// Ruta para obtener un contacto específico por ID
app.get('/contacts/:id', (req, res) => {
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

// Servir la página HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
