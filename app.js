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
const googleAuth = require('./src/googleAuth');
const session = require('express-session'); // Importar express-session
const app = express();
const JWT_SECRET = process.env.JWT_SECRET

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://tu-dominio.com' // cuando utilice el vps
        : 'http://localhost:3000',
    credentials: true
}));
// Configurar el middleware de sesión
app.use(session({
    secret: process.env.SESSION_SECRET || JWT_SECRET, // Cambia esto por una cadena segura
    resave: false, // No guardar la sesión si no hay cambios
    saveUninitialized: false, // No guardar sesiones vacías
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Solo usar cookies seguras en producción
        httpOnly: true, // Asegura que las cookies no sean accesibles desde JavaScript del cliente
        maxAge: 6 * 60 * 60 * 1000 // 6 horas
    }
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

app.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;
    console.log('Código de autorización recibido:', code);

    try {
        const tokens = await googleAuth.getAccessToken(code);
        console.log('Tokens obtenidos:', tokens);

        req.session.googleTokens = tokens; // Guardar tokens en la sesión
        console.log('Tokens guardados en la sesión:', req.session.googleTokens);

        res.redirect('/html/view-contacts.html?auth=success&import=true');
    } catch (err) {
        console.error('Error al obtener el token de acceso:', err);
        res.redirect('/html/view-contacts.html?auth=error');
    }
});
app.post('/google/import-contacts', authenticateToken, async (req, res) => {
    try {
        const tokens = req.session.googleTokens;
        console.log('Tokens en la sesión:', tokens);

        if (!tokens) {
            console.error('No se encontraron tokens en la sesión.');
            return res.status(401).json({ error: 'No autenticado con Google. Por favor, autentíquese nuevamente.' });
        }

        googleAuth.oAuth2Client.setCredentials(tokens);
        console.log('Tokens configurados en oAuth2Client.');

        const contacts = await googleAuth.getGoogleContacts();
        console.log('Contactos obtenidos desde Google:', contacts);

        if (!contacts || contacts.length === 0) {
            console.warn('No se encontraron contactos en la cuenta de Google.');
            return res.status(404).json({ error: 'No se encontraron contactos en la cuenta de Google.' });
        }

        // Aquí puedes guardar los contactos en la base de datos si es necesario
        res.status(200).json({ message: 'Contactos importados correctamente', contacts });
    } catch (err) {
        console.error('Error al importar contactos:', err);
        res.status(500).json({ error: 'Error al importar contactos' });
    }
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