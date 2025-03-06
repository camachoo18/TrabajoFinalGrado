const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Crear o abrir la base de datos SQLite
const db = new sqlite3.Database('contacts.db', (err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
    }
});

// Crear la tabla de contactos si no existe
db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        telefono TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        notas TEXT,
        id_user INTEGER NOT NULL FOREIGN KEY REFERENCES users(id), // Relación con la tabla de usuarios
        categoria TEXT NOT NULL CHECK (categoria IN ('Trabajo', 'Amigos', 'Familia', 'Sin Categoría', 'Otra'))
    );
`, (err) => {
    if (err) {
        console.error('Error al crear la tabla de contactos:', err.message);
    } else {
        console.log('Tabla de contactos creada (o ya existe).');
    }
});

// Crear la tabla de contactos si no existe
db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        telefono TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        notas TEXT,
        categoria TEXT NOT NULL CHECK (categoria IN ('Trabajo', 'Amigos', 'Familia', 'Sin Categoría', 'Otra'))
    );
`, (err) => {
    if (err) {
        console.error('Error al crear la tabla de contactos:', err.message);
    } else {
        console.log('Tabla de contactos creada (o ya existe).');
    }
});

// Eliminar la tabla de categorías si existe (ya no la necesitamos)
db.run(`DROP TABLE IF EXISTS categories;`, (err) => {
    if (err) {
        console.error('Error al eliminar la tabla de categorías:', err.message);
    } else {
        console.log('Tabla de categorías eliminada.');
    }
});

// Exportar la base de datos para usarla en otros archivos
module.exports = db;
