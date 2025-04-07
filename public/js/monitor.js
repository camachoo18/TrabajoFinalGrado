const axios = require('axios');

// Función para hacer ping a un sitio web
const pingWebsite = async (url) => {
    console.log(`Haciendo ping a ${url}...`);
    try {
        const response = await axios.get(url, {
            timeout: 5000 // Timeout de 5 segundos
        });
        if (response.status === 200) {
            console.log(`Respuesta de ${url}: 200 OK`);
            return '200 OK'; // Devolver el estado de la respuesta
        } else {
            console.log(`Respuesta de ${url}: ${response.status}`);
            return response.status.toString(); // Devolver el código de estado
        }
    } catch (error) {
        console.error(`Error al hacer la petición a ${url}: ${error.message}`);
        throw new Error(error.message); // Lanzar el error para manejarlo en el backend
    }
};

// Exportar la función para usarla en otros archivos
module.exports = { pingWebsite };