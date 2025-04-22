const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '.', 'contacts.db');
// Crear o abrir la base de datos SQLite
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite');
    }
});
// Crear tabla de contactos si no existe
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            telefono TEXT,
            email TEXT,
            notas TEXT,
            categoria TEXT,
            user_id INTEGER
        )
    `, (err) => {
        if (err) {
            console.error('Error al crear la tabla contacts:', err.message);
        } else {
            console.log('Tabla contacts verificada o creada.');
        }
    });
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
        //console.log('La columna `user_id` ya existe en la tabla `contacts`.'); Debug columna user_id existe
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
        //console.log('Tabla de usuarios creada (o ya existe).'); Debug tabla usuarios creada
    }
});




// Crear la tabla de categorías si no existe
db.run(`
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE
    );
`, (err) => {
    if (err) {
        console.error('Error al crear la tabla de categorías:', err.message);
    } else {
       // console.log('Tabla de categorías creada (o ya existe).'); Debug tabla categorias creada

        // Insertar categorías predeterminadas si no existen
        const defaultCategories = ['Trabajo', 'Amigos', 'Familia', 'Sin Categoría'];
        defaultCategories.forEach(categoria => {
            db.run('INSERT OR IGNORE INTO categories (nombre) VALUES (?)', [categoria], (err) => {
                if (err) {
                    console.error(`Error al insertar la categoría "${categoria}":`, err.message);
                }
            });
        });
    }
});

// Exportar la base de datos para usarla en otros archivos
module.exports = db;