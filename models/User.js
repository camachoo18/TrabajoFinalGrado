const db = require('../db/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

function generarApiKey() {
    return crypto.randomBytes(32).toString('hex'); // Genera un string de 64 caracteres
}

class User {
    static async findByUsername(username) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    static async create(username, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        return new Promise((resolve, reject) => {
            db.run('INSERT INTO users (username, password) VALUES (?, ?)', 
                [username, hashedPassword], 
                function(err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                }
            );
        });
    }

    static async update(id, username, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        return new Promise((resolve, reject) => {
            db.run('UPDATE users SET username = ?, password = ? WHERE id = ?', 
                [username, hashedPassword, id], 
                function(err) {
                    if (err) reject(err);
                    resolve(this.changes);
                }
            );
        });
    }

    static async delete(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
                if (err) reject(err);
                resolve(this.changes);
            });
        });
    }

    static async comparePassword(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }

    static async regenerateApiKey(req, res) {
        try {
            const userId = req.user.id; // ID del usuario autenticado
            const crypto = require('crypto');
            const newApiKey = crypto.randomBytes(32).toString('hex'); // Generar una nueva APIKEY
    
            // Actualizar la APIKEY en la base de datos
            db.run(
                'UPDATE users SET APIKEY = ? WHERE id = ?',
                [newApiKey, userId],
                function (err) {
                    if (err) {
                        console.error('Error al regenerar la APIKEY:', err.message);
                        return res.status(500).json({ error: 'Error al regenerar la APIKEY' });
                    }
    
                    
                    res.json({ message: 'APIKEY regenerada correctamente', apiKey: newApiKey });
                }
            );
        } catch (error) {
            console.error('Error al regenerar la APIKEY:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}

module.exports = User; 