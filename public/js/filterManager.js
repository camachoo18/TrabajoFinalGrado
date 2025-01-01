// Buscar y filtrar contactos
document.getElementById('searchInput')?.addEventListener('input', async (e) => {
    const query = e.target.value; // Obtener el valor del campo de búsqueda
    try {
        const response = await fetch(`/contacts/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
            const contacts = await response.json();

            // Actualiza la tabla con los contactos filtrados
            const tableBody = document.querySelector('#contactsTableBody');
            if (tableBody) {
                tableBody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos contactos

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
                    categoriaCell.textContent = contact.categoria;
                    row.appendChild(categoriaCell);

                    const actionsCell = document.createElement('td');
                    const editButton = document.createElement('button');
                    editButton.textContent = 'Editar';
                    editButton.className = 'edit-contact';
                    editButton.onclick = () => editContact(contact.id);
                    actionsCell.appendChild(editButton);

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Eliminar';
                    deleteButton.className = 'delete-contact';
                    deleteButton.onclick = () => deleteContact(contact.id);
                    actionsCell.appendChild(deleteButton);

                    row.appendChild(actionsCell);
                    tableBody.appendChild(row);
                });
            }
        } else {
            showFeedback('Error al buscar contactos', false);
        }
    } catch (err) {
        showFeedback(`Error de conexión: ${err.message}`, false);
    }
});
