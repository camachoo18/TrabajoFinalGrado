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
                [nombre, telefono, email, notas, categoria, user_id],
                function (err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                }
            );
            //console.log('Modelo Contact.create: Datos recibidos:', contactData);
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
            const searchTerm = `%${query}%`;
            db.all('SELECT * FROM contacts WHERE user_id = ? AND (nombre LIKE ? OR telefono LIKE ? OR email LIKE ? OR notas LIKE ?)',
                [userId, searchTerm, searchTerm, searchTerm, searchTerm],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });
    }

    static async filterByCategory(categoryId, userId) {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM contacts WHERE categoria = ? AND user_id = ?', [categoryId, userId], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }
}

module.exports = Contact; 