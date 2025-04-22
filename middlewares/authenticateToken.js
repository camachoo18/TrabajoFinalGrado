const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        console.log('Token no proporcionado'); // Depuración
        return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Adjuntar el usuario decodificado al objeto `req`
        console.log('Token válido, usuario decodificado:', decoded); // Depuración
        next();
    } catch (error) {
        console.error('Error al verificar el token:', error); // Depuración
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

module.exports = authenticateToken;