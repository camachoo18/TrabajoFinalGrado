require('dotenv').config();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('../db/database');

class AuthController {
    static async checkAuth(req, res) {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(401).json({ authenticated: false });
            }
    
            res.json({
                authenticated: true,
                user: {
                    id: user.id,
                    username: user.username
                }
            });
        } catch (error) {
            console.error('Error al verificar autenticación:', error);
            res.status(401).json({ authenticated: false });
        }
    }
    // Manejar el inicio de sesión
    static async login(req, res) {
        try {
            const { username, password } = req.body;

            // Buscar el usuario por nombre de usuario
            const user = await User.findByUsername(username);
            if (!user) {
                return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
            }

            // Verificar la contraseña
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '6h' }
            );
            
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 6 * 60 * 60 * 1000, // 6 horas
                path: '/' // Hacer que la cookie sea accesible en todas las rutas
            });
            
            res.json({ message: 'Inicio de sesión exitoso' });
        } catch (error) {
            console.error('Error en el login:', error);
            res.status(500).json({ error: 'Error en el proceso de autenticación' });
        }
    }

    // Manejar el registro de nuevos usuarios
    static async register(req, res) {
        try {
            const { username, password } = req.body;
    
            // Verificar si el usuario ya existe
            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                return res.status(400).json({ error: 'El usuario ya existe' });
            }
    
            // Crear el usuario con la contraseña encriptada
            const userId = await User.create(username, password);
    
            // Generar el token JWT
            const token = jwt.sign(
                { id: userId, username },
                process.env.JWT_SECRET,
                { expiresIn: '6h' }
            );
    
            // Establecer la cookie con el token
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 6 * 60 * 60 * 1000, // 6 horas
            });
    
            res.status(201).json({ message: 'Usuario registrado y autenticado correctamente' });
        } catch (error) {
            console.error('Error en el registro:', error);
            res.status(500).json({ error: 'Error en el proceso de registro' });
        }
    }

    // Manejar el cierre de sesión
    static async logout(req, res) {
        try {
            console.log('Cerrando sesión para el usuario:', req.user); // Depuración
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/' // Asegurarse de que coincida con el path de la cookie
            });
            console.log('Cookie eliminada correctamente'); // Depuración
            res.json({ message: 'Sesión cerrada exitosamente' });
        } catch (error) {
            console.error('Error en el logout:', error);
            res.status(500).json({ error: 'Error al cerrar sesión' });
        }
    }
    static async getApiKey(req, res) {
        try {
            const userId = req.user?.id; // Asegurarse de que req.user esté definido
            if (!userId) {
                return res.status(401).json({ error: 'Usuario no autenticado' });
            }
    
            db.get('SELECT APIKEY FROM users WHERE id = ?', [userId], (err, row) => {
                if (err) {
                    console.error('Error al obtener la APIKEY:', err.message);
                    return res.status(500).json({ error: 'Error al obtener la APIKEY' });
                }
                if (!row) {
                    return res.status(404).json({ error: 'Usuario no encontrado' });
                }
    
                // Establecer la APIKEY como cookie httpOnly
                res.cookie('apiKey', row.APIKEY, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production', // Solo en HTTPS en producción
                    sameSite: 'strict',
                    maxAge: 6 * 60 * 60 * 1000 // 6 horas
                });
    
                // Devolver la APIKEY en el cuerpo de la respuesta JSON
                res.json({ apiKey: row.APIKEY });
            });
        } catch (error) {
            console.error('Error al obtener la APIKEY:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
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
                    res.json({ message: 'APIKEY regenerada correctamente', apiKey: newApiKey }); // Devolver la APIKEY original
                }
            );
        } catch (error) {
            console.error('Error al regenerar la APIKEY:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
    static async getUserByUsername(req, res) {
        try {
            const { username } = req.params;

            // Verificar que el usuario autenticado coincide con el username proporcionado
            if (req.user.username !== username) {
                return res.status(403).json({ error: 'No tienes permiso para acceder a esta información' });
            }

            // Obtener los contactos asociados al usuario autenticado
            const contacts = await Contact.getAll(req.user.id);
            res.json(contacts);
        } catch (error) {
            console.error('Error al obtener contactos:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}

module.exports = AuthController;