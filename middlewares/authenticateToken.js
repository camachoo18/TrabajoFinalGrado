const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    try {
        // Obtener token de la sesión o del header
        const token = req.session.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Agregar usuario al request
        req.user = decoded;
        
        // Actualizar la sesión si es necesario
        if (!req.session.user) {
            req.session.user = decoded;
        }

        next();
    } catch (error) {
        console.error('Error en autenticación:', error);
        
        // Limpiar sesión si el token es inválido
        if (req.session) {
            req.session.destroy();
        }
        
        return res.status(403).json({ error: 'Token inválido o expirado' });
    }
};

module.exports = authenticateToken; 