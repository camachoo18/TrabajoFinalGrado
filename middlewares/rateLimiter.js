const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de 100 solicitudes por IP
    message: { error: 'Demasiadas solicitudes, por favor inténtalo más tarde.' },
});

module.exports = apiLimiter;