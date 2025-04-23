const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    // Obtener el token desde las cookies
    const token = req.cookies?.token;

    if (!token) {
        console.error('No se proporcionó un token');
        return res.status(401).json({ error: 'No se proporcionó un token' });
    }

    try {
        // Verificar el token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Adjuntar el usuario decodificado al objeto req
        next(); // Continuar con la siguiente función de middleware o ruta
    } catch (error) {
        console.error('Error al autenticar el token:', error);
        res.status(403).json({ error: 'Token inválido o expirado' });
    }
};

module.exports = authenticateToken;