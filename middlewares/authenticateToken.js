const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No se proporcionó un token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Agregar el usuario decodificado al objeto req
        next();
    } catch (error) {
        console.error('Error al autenticar el token:', error);
        res.status(403).json({ error: 'Token inválido o expirado' });
    }
};

module.exports = authenticateToken;