const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 10 * 1000, // 10 segundos
    max: 1000000000, // Límite de 1000000 solicitudes por IP
    message: { error: 'Demasiadas solicitudes, por favor inténtalo más tarde.' },
});

module.exports = apiLimiter;