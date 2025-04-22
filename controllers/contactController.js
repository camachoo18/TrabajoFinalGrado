const Contact = require('../models/Contact');
const validateContact = require('../middlewares/validateContact');

class ContactController {
    static async getAll(req, res) {
        try {
            const contacts = await Contact.getAll(req.user.id);
            res.json(contacts);
        } catch (error) {
            console.error('Error al obtener contactos:', error);
            res.status(500).json({ error: 'Error al obtener contactos' });
        }
    }

    static async getById(req, res) {
        try {
            const contact = await Contact.getById(req.params.id, req.user.id);
            if (!contact) {
                return res.status(404).json({ error: 'Contacto no encontrado' });
            }
            res.json(contact);
        } catch (error) {
            console.error('Error al obtener contacto:', error);
            res.status(500).json({ error: 'Error al obtener contacto' });
        }
    }

    static async create(req, res) {
        try {
            // Depuración: Verificar el cuerpo de la solicitud
            //console.log('Controlador create: Cuerpo recibido:', req.body);

            const { nombre, telefono, email, notas, categoria } = req.body;

            // Depuración: Verificar el valor de nombre
            //console.log('Nombre recibido en el backend:', nombre);

            // Validar que el nombre sea una cadena de texto válida
            if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
                return res.status(400).json({ error: 'El nombre es requerido y debe ser una cadena de texto válida' });
            }

            // Crear el contacto
            const contactData = {
                nombre: nombre.trim(),
                telefono: telefono?.trim(),
                email: email?.trim(),
                notas: notas?.trim(),
                categoria: categoria?.trim(),
                user_id: req.user.id // Asegúrate de que el middleware `verifyToken` esté configurado
            };

            const id = await Contact.create(contactData);
            res.status(201).json({ id, ...contactData });
        } catch (error) {
            console.error('Error al crear contacto:', error);
            res.status(500).json({ error: 'Error al crear contacto' });
        }
    }


    static async update(req, res) {
        try {
            const { nombre, telefono, email, notas, categoria } = req.body;
            const contactData = {
                nombre: nombre.trim(),
                telefono: telefono?.trim(),
                email: email?.trim(),
                notas: notas?.trim(),
                categoria: categoria?.trim()
            };
    
            const changes = await Contact.update(req.params.id, contactData, req.user.id);
            if (changes === 0) {
                return res.status(404).json({ error: 'Contacto no encontrado' });
            }
    
            res.json({ message: 'Contacto actualizado correctamente' });
        } catch (error) {
            console.error('Error al actualizar contacto:', error);
            res.status(500).json({ error: 'Error al actualizar contacto' });
        }
    }

    static async delete(req, res) {
        try {
            const changes = await Contact.delete(req.params.id, req.user.id);
            if (changes === 0) {
                return res.status(404).json({ error: 'Contacto no encontrado' });
            }
            res.json({ message: 'Contacto eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar contacto:', error);
            res.status(500).json({ error: 'Error al eliminar contacto' });
        }
    }

    static async search(req, res) {
        try {
            const { q } = req.query;
            if (!q) {
                return res.status(400).json({ error: 'Se requiere un término de búsqueda' });
            }
            const contacts = await Contact.search(q, req.user.id);
            res.json(contacts);
        } catch (error) {
            console.error('Error al buscar contactos:', error);
            res.status(500).json({ error: 'Error al buscar contactos' });
        }
    }

    static async filterByCategory(req, res) {
        try {
            const { categoryId } = req.params;
            const contacts = await Contact.filterByCategory(categoryId, req.user.id);
            res.json(contacts);
        } catch (error) {
            console.error('Error al filtrar contactos:', error);
            res.status(500).json({ error: 'Error al filtrar contactos' });
        }
    }
}

module.exports = ContactController; 