const db = require('../db/database');

async function validateApiKey(req, res, next) {
    // Obtener la APIKEY desde las cookies o el encabezado
    const apiKey = req.cookies?.apiKey || req.header('APIKEY');

    if (!apiKey) {
        return res.status(401).json({ error: 'APIKEY es requerida' });
    }

    try {
        // Buscar el usuario asociado a la APIKEY
        db.get('SELECT id, username FROM users WHERE APIKEY = ?', [apiKey], (err, row) => {
            if (err) {
                console.error('Error al validar la APIKEY:', err.message);
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            if (!row) {
                console.error('No se encontró un usuario con la APIKEY proporcionada.');
                return res.status(401).json({ error: 'APIKEY inválida' });
            }


            // Adjuntar el ID del usuario al objeto `req`
            req.user = { id: row.id, username: row.username };
            next();
        });
    } catch (error) {
        console.error('Error al validar la APIKEY:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

module.exports = validateApiKey;