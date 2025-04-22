// Función para buscar contactos dinámicamente
async function searchContacts(query) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/contacts/search?q=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const contacts = await response.json();
            renderContacts(contacts);
        } else if (response.status === 404) {
            renderContacts([]); // Mostrar mensaje de "No se encontraron contactos"
        } else {
            const error = await response.json();
            console.error('Error al buscar contactos:', error);
            showFeedback(error.error || 'Error al buscar contactos', false);
        }
    } catch (err) {
        console.error('Error al buscar contactos:', err);
        showFeedback(`Error de conexión: ${err.message}`, false);
    }
}

// Event listener para la búsqueda dinámica
document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    searchContacts(query);
});

// Función para cargar todos los contactos
async function loadContacts() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/contacts', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const contacts = await response.json();
            renderContacts(contacts); // Renderizar todos los contactos
        } else {
            showFeedback('Error al cargar contactos', false);
        }
    } catch (err) {
        console.error('Error al cargar contactos:', err);
        showFeedback(`Error de conexión: ${err.message}`, false);
    }
}

// Función para renderizar contactos en la tabla
function renderContacts(contacts) {
    const tableBody = document.querySelector('#contactsTableBody');
    if (!tableBody) {
        console.error('Elemento de la tabla no encontrado');
        return;
    }

    tableBody.innerHTML = ''; // Limpiar el contenido actual

    if (contacts.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">No se encontraron contactos</td></tr>';
        return;
    }

    contacts.forEach(contact => {
        const row = document.createElement('tr');
        row.dataset.id = contact.id;

        const nombreCell = document.createElement('td');
        nombreCell.textContent = contact.nombre;
        row.appendChild(nombreCell);

        const telefonoCell = document.createElement('td');
        telefonoCell.textContent = contact.telefono;
        row.appendChild(telefonoCell);

        const emailCell = document.createElement('td');
        emailCell.textContent = contact.email;
        row.appendChild(emailCell);

        const categoriaCell = document.createElement('td');
        categoriaCell.textContent = contact.categoria || 'Sin Categoría';
        row.appendChild(categoriaCell);

        const notasCell = document.createElement('td');
        notasCell.textContent = contact.notas || '';
        row.appendChild(notasCell);

        const actionsCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.className = 'edit';
        editButton.onclick = () => toggleEditMode(row, contact.id);
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.className = 'delete';
        deleteButton.onclick = () => deleteContact(contact.id);
        actionsCell.appendChild(deleteButton);

        row.appendChild(actionsCell);
        tableBody.appendChild(row);
    });
}

// Llamar a loadContacts() al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    loadContacts(); // Cargar todos los contactos al inicio
});