// Función para descargar contactos en formato CSV
document.getElementById('downloadCsvButton')?.addEventListener('click', async () => {
    try {
        const response = await fetch('/contacts', {
            credentials: 'include' // Incluir cookies en la solicitud
        });

        if (response.ok) {
            const contacts = await response.json();
            const csvContent = convertToCSV(contacts);
            downloadCSV(csvContent, 'contacts.csv');
        } else {
            showFeedback('Error al descargar contactos', false);
        }
    } catch (err) {
        showFeedback(`Error de conexión: ${err.message}`, false);
    }
});

// Función para convertir contactos a CSV
function convertToCSV(contacts) {
    const headers = ['Nombre', 'Teléfono', 'Email', 'Categoría', 'Notas'];
    const rows = contacts.map(contact => [
        contact.nombre,
        contact.telefono,
        contact.email,
        contact.categoria,
        contact.notas
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    return csvContent;
}

// Función para descargar el archivo CSV
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

async function downloadContacts(format) {
    try {
        const response = await fetch(`/contacts/download/${format}`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Error al descargar contactos');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contactos.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error:', error);
        showFeedback('Error al descargar contactos', false);
    }
}