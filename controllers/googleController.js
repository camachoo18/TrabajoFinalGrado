const googleAuth = require('../services/googleAuth');
const Contact = require('../models/Contact');

class GoogleController {
    async getAuthUrl(req, res) {
        try {
            const authUrl = googleAuth.getAuthUrl();
            res.json({ authUrl });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener URL de autenticación' });
        }
    }

    async handleCallback(req, res) {
        try {
            const { code } = req.query;
            const { tokens } = await googleAuth.getOAuth2Client().getToken(code);
            
            // Guardar tokens en la sesión
            req.session.googleTokens = tokens;
            
            res.redirect('/contacts');
        } catch (error) {
            res.status(500).json({ error: 'Error en la autenticación con Google' });
        }
    }

    async importContacts(req, res) {
        try {
            const oauth2Client = googleAuth.getOAuth2Client();
            oauth2Client.setCredentials(req.session.googleTokens);

            const people = google.people({ version: 'v1', auth: oauth2Client });
            const response = await people.people.connections.list({
                resourceName: 'people/me',
                personFields: 'names,emailAddresses,phoneNumbers'
            });

            const contacts = response.data.connections || [];
            const importedContacts = [];

            for (const contact of contacts) {
                const newContact = {
                    name: contact.names?.[0]?.displayName || '',
                    email: contact.emailAddresses?.[0]?.value || '',
                    phone: contact.phoneNumbers?.[0]?.value || '',
                    user_id: req.user.id
                };

                if (newContact.name || newContact.email || newContact.phone) {
                    const savedContact = await Contact.create(newContact);
                    importedContacts.push(savedContact);
                }
            }

            res.json({ 
                message: 'Contactos importados exitosamente',
                contacts: importedContacts 
            });
        } catch (error) {
            res.status(500).json({ error: 'Error al importar contactos' });
        }
    }
}

module.exports = new GoogleController(); 