//const bcrypt = require('bcrypt');
const saltRounds = 10;
const Database = require('better-sqlite3');
const fs = require('fs');
const crypto = require('crypto');

let db_aux = null;
if (!fs.existsSync('agenda.db')) {
    db_aux = new Database('agenda.db');
    db_aux.exec(`CREATE TABLE contactos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        telefono TEXT NOT NULL,
        correo TEXT NOT NULL,
        notas TEXT
    )`);
    console.log("Base de datos creada.");
} else {
    db_aux = new Database('agenda.db');
    console.log("Base de datos cargada.");
}

const db = db_aux;

// Operaciones CRUD para contactos

// Agregar contacto
function agregarContacto(nombre, telefono, correo, notas) {
    const query = `INSERT INTO contactos (nombre, telefono, correo, notas) VALUES (?, ?, ?, ?)`;
    const statement = db.prepare(query);
    const result = statement.run(nombre, telefono, correo, notas || '');
    return { id: result.lastInsertRowid, nombre, telefono, correo, notas };
}

// Obtener contactos
function obtenerContactos() {
    const query = `SELECT * FROM contactos`;
    const statement = db.prepare(query);
    return statement.all();
}

// Editar contacto
function editarContacto(id, nombre, telefono, correo, notas) {
    const query = `UPDATE contactos SET nombre = ?, telefono = ?, correo = ?, notas = ? WHERE id = ?`;
    const statement = db.prepare(query);
    const result = statement.run(nombre, telefono, correo, notas, id);
    return result.changes;
}

// Eliminar contacto
function eliminarContacto(id) {
    const query = `DELETE FROM contactos WHERE id = ?`;
    const statement = db.prepare(query);
    const result = statement.run(id);
    return result.changes;
}

// Exportar funciones
module.exports = {
    agregarContacto,
    obtenerContactos,
    editarContacto,
    eliminarContacto
};
