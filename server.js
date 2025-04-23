require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.JWT_SECRET || JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));
// Importar rutas
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const googleRoutes = require('./routes/googleRoutes');

// Importar middleware
const authenticateToken = require('./middlewares/authenticateToken');

// Configuración de middlewares
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));


// Rutas API protegidas con authenticateToken
app.use('/auth', authRoutes);
//app.use('/contacts/search', authenticateToken, contactRoutes);
app.use('/contacts', authenticateToken, contactRoutes);
app.use('/categories', authenticateToken, categoryRoutes);
app.use('/google', authenticateToken, googleRoutes);

// Rutas para servir archivos HTML
app.get('/', (req, res) => {
    const token = req.cookies?.token;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Si el token es válido, redirigir a index.html
            res.redirect('/index.html');
        } catch (error) {
            console.error('Token inválido o expirado:', error);
            // Si el token es inválido o expirado, redirigir a home.html
            res.redirect('/home.html');
        }
    } else {
        // Si no hay token, redirigir a home.html
        res.redirect('/home.html');
    }
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



// Middleware para manejar errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});