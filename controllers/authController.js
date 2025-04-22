require('dotenv').config();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class AuthController {
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

            // Generar el token JWT
            const token = jwt.sign(
                { id: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '6h' }
            );

            res.json({ token });
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

            res.status(201).json({ token });
        } catch (error) {
            console.error('Error en el registro:', error);
            res.status(500).json({ error: 'Error en el proceso de registro' });
        }
    }

    // Verificar si el usuario está autenticado
    static async checkAuth(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ authenticated: false });
            }

            // Verificar el token JWT
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
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

    // Manejar el cierre de sesión
    static async logout(req, res) {
        try {
            // Aquí puedes limpiar la sesión o realizar otras acciones necesarias
            res.json({ message: 'Sesión cerrada correctamente' });
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            res.status(500).json({ error: 'Error al cerrar sesión' });
        }
    }
}

module.exports = AuthController;