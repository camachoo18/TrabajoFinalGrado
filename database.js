const sqlite3 = require('sqlite3').verbose();

// Crear o abrir la base de datos SQLite
const db = new sqlite3.Database('contacts.db', (err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
    }
});

// Verificar si la columna `user_id` existe en la tabla `contacts`
db.all("PRAGMA table_info(contacts);", (err, rows) => {
    if (err) {
        console.error('Error al verificar la tabla de contactos:', err.message);
        return;
    }

    const columnExists = rows.some(row => row.name === 'user_id');
    if (!columnExists) {
        console.log('La columna `user_id` no existe. Añadiéndola a la tabla `contacts`...');

        // Añadir la columna `user_id` a la tabla `contacts`
        db.run(`
            ALTER TABLE contacts ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1;
        `, (err) => {
            if (err) {
                console.error('Error al añadir la columna `user_id`:', err.message);
            } else {
                console.log('Columna `user_id` añadida correctamente.');
            }
        });
    } else {
        console.log('La columna `user_id` ya existe en la tabla `contacts`.');
    }
});

// Crear la tabla de usuarios si no existe
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    );
`, (err) => {
    if (err) {
        console.error('Error al crear la tabla de usuarios:', err.message);
    } else {
        console.log('Tabla de usuarios creada (o ya existe).');
    }
});

// Exportar la base de datos para usarla en otros archivos
module.exports = db;