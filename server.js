const express = require('express');
const path = require('path');
const db = require('./database'); // Importa la base de datos desde el archivo database.js
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para obtener todos los contactos
app.get('/contacts', (req, res) => {
    db.all('SELECT * FROM contacts', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Ruta para agregar un nuevo contacto
app.post('/add', (req, res) => {
    const { nombre, telefono, email, notas } = req.body;
    const stmt = db.prepare('INSERT INTO contacts (nombre, telefono, email, notas) VALUES (?, ?, ?, ?)');
    stmt.run(nombre, telefono, email, notas, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(200).json({ id: this.lastID });
        }
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
app.put('/edit/:id', (req, res) => {
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

// Servir la página HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
