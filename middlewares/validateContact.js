const validateContact = (req, res, next) => {
    const { nombre, telefono, email, categoria } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        return res.status(400).json({ error: 'El nombre es requerido y debe ser una cadena de texto válida' });
    }

    if (telefono && !/^\d{9}$/.test(telefono)) {
        return res.status(400).json({ error: 'El teléfono debe tener 9 dígitos' });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'El correo electrónico no es válido' });
    }

    if (!categoria || typeof categoria !== 'string' || categoria.trim() === '') {
        return res.status(400).json({ error: 'La categoría es requerida y debe ser una cadena de texto válida' });
    }
    //console.log('Middleware validateContact: Cuerpo recibido:', req.body);

    next();
};

module.exports = validateContact;