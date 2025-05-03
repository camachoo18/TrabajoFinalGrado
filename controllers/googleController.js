const { google } = require('googleapis');
const googleAuth = require('../services/googleOAuthService');
const Contact = require('../models/Contact');
const db = require('../db/database'); // Asegúrate de que esta referencia sea correcta

class GoogleController {
    // Verificar el estado de autenticación
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

    // Obtener la URL de autenticación de Google
    async getAuthUrl(req, res) {
        try {
            const authUrl = googleAuth.getAuthUrl();
            res.json({ authUrl });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener URL de autenticación' });
        }
    }

    // Manejar el callback de Google después de la autenticación
    async handleCallback(req, res) {
        try {
            const { code } = req.query;
           

            const { tokens } = await googleAuth.getOAuth2Client().getToken(code);
           

            req.session.googleTokens = tokens; // Guardar tokens en la sesión
            
            res.redirect('/html/view-contacts.html?auth=success&import=true');
        } catch (error) {
            console.error('Error en el callback de Google:', error);
            res.redirect('/html/view-contacts.html?auth=error');
        }
    }

    // Importar contactos desde Google
    async importContacts(req, res) {
        try {
            const oauth2Client = googleAuth.getOAuth2Client();
            oauth2Client.setCredentials(req.session.googleTokens);

            const people = google.people({ version: 'v1', auth: oauth2Client });
            const response = await people.people.connections.list({
                resourceName: 'people/me',
                personFields: 'names,emailAddresses,phoneNumbers',
            });

            const contacts = response.data.connections || [];
            //console.log('Contactos obtenidos desde Google:', contacts);

            const userId = req.user.id; // ID del usuario autenticado

            // Preparar las consultas SQL
            const checkDuplicateQuery = 'SELECT COUNT(*) AS count FROM contacts WHERE telefono = ? AND user_id = ?';
            const insertContactQuery = `
                INSERT INTO contacts (nombre, email, telefono, user_id)
                VALUES (?, ?, ?, ?)
            `;

            const stmtCheckDuplicate = db.prepare(checkDuplicateQuery);
            const stmtInsertContact = db.prepare(insertContactQuery);

            const importedContacts = [];

            for (const contact of contacts) {
                try {
                    const nombre = contact.names?.[0]?.displayName || 'Sin Nombre';
                    const email = contact.emailAddresses?.[0]?.value || '';
                    const telefono = contact.phoneNumbers?.[0]?.value?.replace(/\D/g, '') || ''; // Normalizar el número de teléfono

                    if (!telefono) {
                        continue; // Omitir contactos sin número de teléfono
                    }

                    // Verificar si el contacto ya existe por número de teléfono
                    const row = await new Promise((resolve, reject) => {
                        stmtCheckDuplicate.get([telefono, userId], (err, row) => {
                            if (err) reject(err);
                            else resolve(row);
                        });
                    });

                    if (row.count === 0) {
                        // Si no existe, insertar el contacto
                        await new Promise((resolve, reject) => {
                            stmtInsertContact.run([nombre, email, telefono, userId], function (err) {
                                if (err) reject(err);
                                else {
                                    //console.log(`Contacto "${nombre}" insertado con éxito.`);
                                    importedContacts.push({ id: this.lastID, nombre, email, telefono });
                                    resolve();
                                }
                            });
                        });
                    } else {
                       // console.log(`El contacto con teléfono ${telefono} ya existe. No se insertará.`);
                    }
                } catch (err) {
                    console.error('Error al procesar contacto:', err);
                }
            }

            stmtCheckDuplicate.finalize();
            stmtInsertContact.finalize();

            res.json({
                message: 'Importación de contactos completada',
                contacts: importedContacts,
            });
        } catch (error) {
            console.error('Error al importar contactos:', error);
            res.status(500).json({ error: 'Error al importar contactos' });
        }
    }
}

module.exports = new GoogleController();