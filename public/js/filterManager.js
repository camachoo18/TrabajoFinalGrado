// Función para filtrar contactos por categoría
async function filterContactsByCategory(categoria) {
    try {
        const token = localStorage.getItem('token');

        // Validar la categoría
        if (!categoria || categoria === 'Todas') {
            await loadContacts(); // Cargar todos los contactos si la categoría es "Todas"
            return;
        }

        showLoadingIndicator(); // Mostrar indicador de carga

        const url = `/contacts/category/${encodeURIComponent(categoria)}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const contacts = await response.json();
            renderContacts(contacts); // Renderizar los contactos filtrados
        } else if (response.status === 404) {
            renderContacts([]); // Mostrar mensaje de "No se encontraron contactos"
        } else {
            throw new Error('Error al filtrar contactos');
        }
    } catch (err) {
        console.error('Error al filtrar contactos:', err);
        showFeedback(`Error de conexión: ${err.message}`, false);
    }
}

// Mostrar indicador de carga
function showLoadingIndicator() {
    const tableBody = document.querySelector('#contactsTableBody');
    if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="6">Cargando...</td></tr>';
    }
}

// Event listener para el filtro por categoría
document.getElementById('filtroCategoria')?.addEventListener('change', (e) => {
    const categoria = e.target.value;
    filterContactsByCategory(categoria);
});

async function applyFilters(filters) {
    try {
        const response = await fetch('/contacts/filter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(filters)
        });
        
        if (!response.ok) {
            throw new Error('Error al aplicar filtros');
        }
        
        const contacts = await response.json();
        displayContacts(contacts);
    } catch (error) {
        console.error('Error:', error);
        showFeedback('Error al aplicar filtros', false);
    }
}