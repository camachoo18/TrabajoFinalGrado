const sqlite3 = require('sqlite3').verbose();

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
        telefono TEXT UNIQUE,
        email TEXT,
        notas TEXT
    );
`, (err) => {
    if (err) {
        console.error('Error al crear la tabla:', err.message);
    } else {
        console.log('Tabla de contactos creada (o ya existe).');
    }
});

// Asegurarse de que la columna 'categoria' existe en la tabla
db.all(`
    PRAGMA table_info(contacts);
`, (err, columns) => {
    if (err) {
        console.error('Error al verificar columnas:', err.message);
    } else {
        const columnNames = columns.map(column => column.name);
        if (!columnNames.includes('categoria')) {
            db.run(`
                ALTER TABLE contacts ADD COLUMN categoria TEXT DEFAULT 'Sin Categoría';
            `, (err) => {
                if (err) {
                    console.error('Error al agregar la columna "categoria":', err.message);
                } else {
                    console.log('Columna "categoria" agregada correctamente.');
                }
            });
        } else {
            console.log('La columna "categoria" ya existe.');
        }
    }
});

// Exportar la base de datos para usarla en otros archivos
module.exports = db;
