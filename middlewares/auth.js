const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        //console.log('Encabezado Authorization recibido:', authHeader); // Depuración

        const token = authHeader?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Error en la autenticación:', error);
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

module.exports = auth;