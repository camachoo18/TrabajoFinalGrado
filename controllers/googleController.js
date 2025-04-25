const { google } = require('googleapis');
const googleAuth = require('../services/googleAuth');
const Contact = require('../models/Contact');

class GoogleController {

    async checkAuthStatus(req, res) {
        try {
            const tokens = req.session.googleTokens;
            if (tokens && tokens.access_token) {
                res.json({ authenticated: true });
            } else {
                res.json({ authenticated: false });
            }
        } catch (error) {
            res.status(500).json({ error: 'Error al verificar el estado de autenticación' });
        }
    }
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
            console.log('Código de autorización recibido:', code);
    
            const { tokens } = await googleAuth.getOAuth2Client().getToken(code);
            console.log('Tokens obtenidos:', tokens);
    
            req.session.googleTokens = tokens; // Guardar tokens en la sesión
            console.log('Tokens guardados en la sesión:', req.session.googleTokens);
    
            res.redirect('/html/view-contacts.html');
        } catch (error) {
            console.error('Error en el callback de Google:', error);
            res.status(500).json({ error: 'Error en la autenticación con Google' });
        }
    }

    async importContacts(req, res) {
        try {
            console.log('Iniciando importación de contactos desde Google...');
            const oauth2Client = googleAuth.getOAuth2Client();
            oauth2Client.setCredentials(req.session.googleTokens);
    
            console.log('Tokens configurados en oAuth2Client:', req.session.googleTokens);
    
            const people = google.people({ version: 'v1', auth: oauth2Client });
            const response = await people.people.connections.list({
                resourceName: 'people/me',
                personFields: 'names,emailAddresses,phoneNumbers',
            });
    
            console.log('Respuesta de Google API:', response.data);
    
            const contacts = response.data.connections || [];
            console.log('Contactos obtenidos:', contacts);
    
            const importedContacts = [];
    
            for (const contact of contacts) {
                const newContact = {
                    nombre: contact.names?.[0]?.displayName || '',
                    email: contact.emailAddresses?.[0]?.value || '',
                    telefono: contact.phoneNumbers?.[0]?.value || '',
                    user_id: req.user.id,
                };
    
                console.log('Procesando contacto:', newContact);
    
                if (newContact.nombre || newContact.email || newContact.telefono) {
                    const savedContactId = await Contact.create(newContact);
                    importedContacts.push({ id: savedContactId, ...newContact });
                }
            }
    
            console.log('Contactos importados al frontend:', importedContacts);
    
            res.json({
                message: 'Contactos importados correctamente',
                contacts: importedContacts,
            });
        } catch (error) {
            console.error('Error al importar contactos:', error);
            res.status(500).json({ error: 'Error al importar contactos' });
        }
    }
}

module.exports = new GoogleController(); 