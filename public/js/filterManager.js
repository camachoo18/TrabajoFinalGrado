// filterManager.js

// Filtrar contactos por búsqueda
async function searchContacts(query) {
    try {
        const response = await fetch(`/contacts/search?q=${encodeURIComponent(query)}`);
        const contacts = await response.json();

        const tableBody = document.getElementById('contactsTableBody');
        tableBody.innerHTML = ''; // Limpiar la tabla

        contacts.forEach(contact => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${contact.nombre}</td>
                <td>${contact.telefono}</td>
                <td>${contact.email}</td>
                <td>${contact.categoria}</td>
                <td>
                    <button class="edit-contact" data-id="${contact.id}">Editar</button>
                    <button class="delete-contact" data-id="${contact.id}">Eliminar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        showError('Error al filtrar contactos.');
    }
}

// Event listener para el campo de búsqueda
document.getElementById('searchInput').addEventListener('input', (event) => {
    const query = event.target.value;
    searchContacts(query);
});
