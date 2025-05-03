const db = require('../db/database');

class Contact {
    static async getAll(userId) {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM contacts WHERE user_id = ?', [userId], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    static async getById(id, userId) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM contacts WHERE id = ? AND user_id = ?', [id, userId], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }
    static async create(contactData) {
        return new Promise((resolve, reject) => {
            const { nombre, telefono, email, notas, categoria, user_id } = contactData;
            db.run(
                'INSERT INTO contacts (nombre, telefono, email, notas, categoria, user_id) VALUES (?, ?, ?, ?, ?, ?)',
                [nombre, telefono, email, notas || '', categoria || 'Sin Categoría', user_id],
                function (err) {
                    if (err) {
                        console.error('Error al insertar contacto:', err);
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
        });
    }


    static async update(id, contactData, userId) {
        return new Promise((resolve, reject) => {
            const { nombre, telefono, email, notas, categoria } = contactData;
            db.run(
                'UPDATE contacts SET nombre = ?, telefono = ?, email = ?, notas = ?, categoria = ? WHERE id = ? AND user_id = ?',
                [nombre, telefono, email, notas, categoria, id, userId],
                function (err) {
                    if (err) reject(err);
                    resolve(this.changes); // Devuelve el número de filas afectadas
                }
            );
        });
    }

    static async delete(id, userId) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM contacts WHERE id = ? AND user_id = ?', [id, userId], function(err) {
                if (err) reject(err);
                resolve(this.changes);
            });
        });
    }

    static async search(query, userId) {
        return new Promise((resolve, reject) => {
            const searchTerm = `%${query}%`; // Usar comodines para la búsqueda
            const sql = `
                SELECT * FROM contacts
                WHERE user_id = ? AND (
                    nombre LIKE ? OR
                    telefono LIKE ? OR
                    email LIKE ? OR
                    notas LIKE ?
                )
            `;
    
    
            db.all(sql, [userId, searchTerm, searchTerm, searchTerm, searchTerm], (err, rows) => {
                if (err) {
                    console.error('Error al buscar contactos:', err.message);
                    reject(err);
                } else {
                    //console.log('Resultados de búsqueda:', rows); // Depuración
                    resolve(rows);
                }
            });
        });
    }

    static async filterByCategory(categoria, userId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM contacts
                WHERE categoria = ? AND user_id = ?
            `;
    
    
            db.all(sql, [categoria, userId], (err, rows) => {
                if (err) {
                    console.error('Error al filtrar contactos por categoría:', err.message);
                    reject(err);
                } else {
                    //console.log('Contactos filtrados por categoría:', rows); // Depuración
                    resolve(rows);
                }
            });
        });
    }
}

module.exports = Contact; 