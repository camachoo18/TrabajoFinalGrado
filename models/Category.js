const db = require('../db/database');

class Category {
    static async getAll() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM categories', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    static async getById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM categories WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    static async create(nombre) {
        return new Promise((resolve, reject) => {
            db.run('INSERT INTO categories (nombre) VALUES (?)', 
                [nombre], 
                function(err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                }
            );
        });
    }

    static async update(id, nombre) {
        return new Promise((resolve, reject) => {
            db.run('UPDATE categories SET nombre = ? WHERE id = ?', 
                [nombre, id], 
                function(err) {
                    if (err) reject(err);
                    resolve(this.changes);
                }
            );
        });
    }

    static async delete(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
                if (err) reject(err);
                resolve(this.changes);
            });
        });
    }
}

module.exports = Category; 