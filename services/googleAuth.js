const { google } = require('googleapis');
const credentials = require('../db/credentials.json');

class GoogleAuth {
    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            credentials.web.client_id,
            credentials.web.client_secret,
            credentials.web.redirect_uris[0]
        );

        this.scopes = [
            'https://www.googleapis.com/auth/contacts.readonly',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ];
    }

    getAuthUrl() {
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: this.scopes,
            prompt: 'consent',
            include_granted_scopes: true
        });
    }

    getOAuth2Client() {
        return this.oauth2Client;
    }

    async verifyToken(idToken) {
        try {
            const ticket = await this.oauth2Client.verifyIdToken({
                idToken,
                audience: credentials.web.client_id
            });
            return ticket.getPayload();
        } catch (error) {
            console.error('Error verificando token:', error);
            return null;
        }
    }

    async refreshAccessToken(refreshToken) {
        try {
            this.oauth2Client.setCredentials({ refresh_token: refreshToken });
            const { credentials } = await this.oauth2Client.refreshAccessToken();
            return credentials;
        } catch (error) {
            console.error('Error refrescando token:', error);
            return null;
        }
    }

    async getUserInfo(accessToken) {
        try {
            const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
            const { data } = await oauth2.userinfo.get();
            return data;
        } catch (error) {
            console.error('Error obteniendo información del usuario:', error);
            return null;
        }
    }

    async getContacts(accessToken) {
        try {
            const people = google.people({ version: 'v1', auth: this.oauth2Client });
            const response = await people.people.connections.list({
                resourceName: 'people/me',
                personFields: 'names,emailAddresses,phoneNumbers,photos',
                pageSize: 1000
            });
            return response.data.connections || [];
        } catch (error) {
            console.error('Error obteniendo contactos:', error);
            return [];
        }
    }
}

module.exports = new GoogleAuth(); 