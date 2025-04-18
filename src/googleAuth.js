const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// filepath: public/js/googleAuth.js
const credentialsPath = path.join(__dirname, './credentials.json'); // Cambiar la ruta // Cambiar la ruta
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

// Ajustar para usar la clave "web" en lugar de "installed"
const { client_id, client_secret, redirect_uris } = credentials.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Generar la URL de autenticación
function getAuthUrl() {
    const SCOPES = ['https://www.googleapis.com/auth/contacts.readonly'];
    return oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
}

// Obtener el token de acceso
async function getAccessToken(code) {
    try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens); // Configurar el token en el cliente
        console.log('Tokens obtenidos:', tokens); // Depuración
        return tokens;
    } catch (err) {
        console.error('Error al obtener el token de acceso:', err);
        throw new Error('Error al obtener el token de acceso');
    }
}

// Obtener contactos desde Google Contacts
async function getGoogleContacts() {
    try {
        const service = google.people({ version: 'v1', auth: oAuth2Client });
        const response = await service.people.connections.list({
            resourceName: 'people/me',
            pageSize: 100,
            personFields: 'names,emailAddresses,phoneNumbers',
        });

        console.log('Contactos obtenidos de Google:', response.data.connections);
        return response.data.connections || [];
    } catch (err) {
        console.error('Error al obtener contactos de Google:', err);
        throw new Error('Error al obtener contactos de Google');
    }
}

module.exports = { getAuthUrl, getAccessToken, getGoogleContacts };