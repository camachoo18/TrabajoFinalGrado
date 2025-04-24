const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const jwt = require('jsonwebtoken');
const contactRoutes = require('./routes/contactRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const googleRoutes = require('./routes/googleRoutes');
const authenticateToken = require('./middlewares/authenticateToken');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://tu-dominio.com' // cuando utilice el vps
        : 'http://localhost:3000',
    credentials: true
}));

// Rutas protegidas con authenticateToken
app.use('/auth', authRoutes);
app.use('/contacts', authenticateToken, contactRoutes);
app.use('/categories', authenticateToken, categoryRoutes);
app.use('/google', authenticateToken, googleRoutes);

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas para servir archivos HTML
app.get('/', (req, res) => {
    const token = req.cookies?.token;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Si el token es válido, redirigir a index.html
            return res.redirect('/html/index.html');
        } catch (error) {
            console.error('Token inválido o expirado:', error);
        }
    }

    // Si no hay token o es inválido, redirigir a home.html
    res.redirect('/html/home.html');
});
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
});

app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'register.html'));
});

app.get('/home.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'home.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

// Ruta de fallback para SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public','html', 'index.html'));
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;