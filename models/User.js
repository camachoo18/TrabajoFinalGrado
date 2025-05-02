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
        const hashedPassword = await bcrypt.hash(password, 10); // Encriptar la contraseña
        const apiKey = crypto.randomBytes(32).toString('hex'); // Generar una APIKEY única
    
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (username, password, APIKEY) VALUES (?, ?, ?)', 
                [username, hashedPassword, apiKey], 
                function(err) {
                    if (err) {
                        console.error('Error al crear el usuario:', err.message);
                        reject(err);
                    } else {
                        console.log(`Usuario creado con ID ${this.lastID} y APIKEY ${apiKey}`);
                        resolve({ id: this.lastID, apiKey }); // Devolver el ID del usuario y la APIKEY
                    }
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
    
                    console.log(`Nueva APIKEY generada: ${newApiKey}`);
                    console.log(`APIKEY almacenada en texto plano: ${newApiKey}`);
                    console.log(`APIKEY regenerada para el usuario con ID ${userId}`);
    
                    // Verificar que la APIKEY se haya actualizado correctamente
                    db.get('SELECT APIKEY FROM users WHERE id = ?', [userId], (err, row) => {
                        if (err) {
                            console.error('Error al verificar la APIKEY en la base de datos:', err.message);
                        } else {
                            console.log(`APIKEY verificada en la base de datos: ${row.APIKEY}`);
                        }
                    });
    
                    res.json({ message: 'APIKEY regenerada correctamente', apiKey: newApiKey }); // Devolver la APIKEY original
                }
            );
        } catch (error) {
            console.error('Error al regenerar la APIKEY:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}

module.exports = User; 