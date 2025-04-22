const db = require('../db/database');
const bcrypt = require('bcrypt');

class Auth {
    static async findByUsername(username) {
        try {
            const query = 'SELECT * FROM users WHERE username = ?';
            const [user] = await db.query(query, [username]);
            return user;
        } catch (error) {
            console.error('Error al buscar usuario:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const query = 'SELECT * FROM users WHERE id = ?';
            const [user] = await db.query(query, [id]);
            return user;
        } catch (error) {
            console.error('Error al buscar usuario por ID:', error);
            throw error;
        }
    }

    static async create({ username, password }) {
        try {
            const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
            const result = await db.query(query, [username, password]);
            return { id: result.insertId, username };
        } catch (error) {
            console.error('Error al crear usuario:', error);
            throw error;
        }
    }

    static async update(id, { username, password }) {
        try {
            const updates = [];
            const values = [];

            if (username) {
                updates.push('username = ?');
                values.push(username);
            }

            if (password) {
                updates.push('password = ?');
                values.push(password);
            }

            if (updates.length === 0) {
                return null;
            }

            values.push(id);
            const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
            await db.query(query, values);

            return { id, username };
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            const query = 'DELETE FROM users WHERE id = ?';
            const result = await db.query(query, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            throw error;
        }
    }

    static async comparePassword(password, hashedPassword) {
        try {
            return await bcrypt.compare(password, hashedPassword);
        } catch (error) {
            console.error('Error al comparar contraseñas:', error);
            throw error;
        }
    }
}

module.exports = Auth; 