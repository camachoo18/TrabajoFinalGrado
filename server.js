const express = require('express');
const path = require('path');
const db = require('./database'); // Importa la base de datos desde el archivo database.js
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


// Endpoint para buscar contactos
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
// Middleware para validar datos del contacto
function validateContact(req, res, next) {
    const { nombre, telefono, email } = req.body;

    // Verificar que los campos obligatorios estén presentes
    if (!nombre || !telefono || !email) {
        return res.status(400).json({ error: 'Nombre, teléfono y email son obligatorios' });
    }

    // Validar que el teléfono tenga exactamente 9 dígitos numéricos
    if (!/^\d{9}$/.test(telefono)) {
        return res.status(400).json({ error: 'El teléfono debe tener exactamente 9 dígitos' });
    }
    
    // Validar categoría
    const categoriaFinal = nuevaCategoria?.trim() || categoria;
    if (!categoriaFinal) {
        return res.status(400).json({ error: 'La categoría es obligatoria' });
    }

    req.body.categoria = categoriaFinal; // Usar categoría final
    next(); // SI TODO ESTA BIEN , PASA A LA
}

// Ruta para agregar un nuevo contacto con middleware de validación
app.post('/add', validateContact, (req, res) => {
    const { nombre, telefono, email, notas } = req.body;

    // Verificar duplicados en la base de datos
    const duplicateCheckQuery = 'SELECT COUNT(*) AS count FROM contacts WHERE telefono = ?';
    db.get(duplicateCheckQuery, [telefono], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Error al verificar duplicados' });
        }
        if (row.count > 0) {
            return res.status(400).json({ error: 'El número de teléfono ya está registrado' });
        }

        // Insertar contacto si no hay duplicado
        const stmt = db.prepare('INSERT INTO contacts (nombre, telefono, email, notas) VALUES (?, ?, ?, ?)');
        stmt.run(nombre, telefono, email, notas, function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.status(200).json({ id: this.lastID });
            }
        });
    });
});



// Ruta para eliminar un contacto
app.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM contacts WHERE id = ?');
    stmt.run(id, function(err) {
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
    const { nombre, telefono, email, notas } = req.body;

    const stmt = db.prepare('UPDATE contacts SET nombre = ?, telefono = ?, email = ?, notas = ? WHERE id = ?');
    stmt.run(nombre, telefono, email, notas, id, function(err) {
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
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});