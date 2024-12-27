// server.js: Configuración del servidor y endpoints
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database'); // Importar el módulo de la base de datos

// Configurar el servidor
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(bodyParser.json()); // Para manejar JSON en las solicitudes

// Endpoint para agregar un contacto
app.post('/add', (req, res) => {
    const { nombre, telefono, correo, notas } = req.body;
    if (!nombre || !telefono || !correo) {
        return res.status(400).json({ message: 'Nombre, teléfono y correo son obligatorios.' });
    }

    db.agregarContacto(nombre, telefono, correo, notas, (err, contacto) => {
        if (err) {
            return res.status(500).json({ message: 'Error al agregar el contacto.', error: err.message });
        }
        res.status(201).json({ message: 'Contacto agregado exitosamente.', contacto });
    });
});

// Endpoint para obtener la lista de contactos
app.get('/contacts', (req, res) => {
    db.obtenerContactos((err, contactos) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener los contactos.', error: err.message });
        }
        res.json(contactos);
    });
});

// Endpoint para editar un contacto
app.put('/edit/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, telefono, correo, notas } = req.body;

    db.editarContacto(id, nombre, telefono, correo, notas, (err, cambios) => {
        if (err) {
            return res.status(500).json({ message: 'Error al actualizar el contacto.', error: err.message });
        }
        if (cambios === 0) {
            return res.status(404).json({ message: 'Contacto no encontrado.' });
        }
        res.json({ message: 'Contacto actualizado exitosamente.' });
    });
});

// Endpoint para eliminar un contacto
app.delete('/delete/:id', (req, res) => {
    const { id } = req.params;

    db.eliminarContacto(id, (err, cambios) => {
        if (err) {
            return res.status(500).json({ message: 'Error al eliminar el contacto.', error: err.message });
        }
        if (cambios === 0) {
            return res.status(404).json({ message: 'Contacto no encontrado.' });
        }
        res.json({ message: 'Contacto eliminado exitosamente.' });
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
