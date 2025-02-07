// Buscar y filtrar contactos
document.getElementById('searchInput')?.addEventListener('input', async (e) => {
    const query = e.target.value; // Obtener el valor del campo de búsqueda
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/contacts/search?q=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const contacts = await response.json();
            renderContacts(contacts);
            // Actualiza la tabla con los contactos filtrados
            const tableBody = document.querySelector('#contactsTableBody');
            if (!tableBody) {
                console.error('Elemento de la tabla no encontrado');
                return;
            }

            tableBody.innerHTML = ''; // Limpiar el contenido actual

            contacts.forEach(contact => {
                const row = document.createElement('tr');
                row.dataset.id = contact.id; // Guardar el ID en la fila

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

                const notasCell = document.createElement('td');
                notasCell.textContent = contact.notas;
                row.appendChild(notasCell);

                const actionsCell = document.createElement('td');

                const editButton = document.createElement('button');
                editButton.textContent = 'Editar';
                editButton.className = 'edit';
                editButton.dataset.id = contact.id; // Añadir el ID al botón
                editButton.addEventListener('click', () => {
                    console.log('Edit button clicked for ID:', contact.id);
                    toggleEditMode(row, contact.id);
                });
                actionsCell.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Eliminar';
                deleteButton.className = 'delete';
                deleteButton.dataset.id = contact.id; // Añadir el ID al botón
                deleteButton.addEventListener('click', () => {
                    console.log('Delete button clicked for ID:', contact.id);
                    deleteContact(contact.id);
                });
                actionsCell.appendChild(deleteButton);

                row.appendChild(actionsCell);
                tableBody.appendChild(row);
            });
        } else {
            showFeedback('Error al cargar contactos', false);
        }
    } catch (err) {
        console.error('Error al cargar los contactos:', err);
        showFeedback(`Error de conexión: ${err.message}`, false);
    }
});

// Filtrar por categoría
document.getElementById('filtroCategoria')?.addEventListener('change', async (e) => {
    const categoria = e.target.value; // Obtener el valor de la categoría seleccionada
    try {
        const token = localStorage.getItem('token');
        let url = '/contacts/filter';
        if (categoria && categoria !== 'Todas') {
            url += `?categoria=${encodeURIComponent(categoria)}`;
        }
        // Hacer la solicitud al backend para obtener los contactos filtrados por categoría
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const contacts = await response.json();

            // Actualiza la tabla con los contactos filtrados por categoría
            const tableBody = document.querySelector('#contactsTableBody');
            if (!tableBody) {
                console.error('Elemento de la tabla no encontrado');
                return;
            }

            tableBody.innerHTML = ''; // Limpiar el contenido actual

            contacts.forEach(contact => {
                const row = document.createElement('tr');
                row.dataset.id = contact.id; // Guardar el ID en la fila

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

                const notasCell = document.createElement('td');
                notasCell.textContent = contact.notas;
                row.appendChild(notasCell);

                const actionsCell = document.createElement('td');

                const editButton = document.createElement('button');
                editButton.textContent = 'Editar';
                editButton.className = 'edit';
                editButton.dataset.id = contact.id; // Añadir el ID al botón
                editButton.addEventListener('click', () => {
                    console.log('Edit button clicked for ID:', contact.id);
                    toggleEditMode(row, contact.id);
                });
                actionsCell.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Eliminar';
                deleteButton.className = 'delete';
                deleteButton.dataset.id = contact.id; // Añadir el ID al botón
                deleteButton.addEventListener('click', () => {
                    console.log('Delete button clicked for ID:', contact.id);
                    deleteContact(contact.id);
                });
                actionsCell.appendChild(deleteButton);

                row.appendChild(actionsCell);
                tableBody.appendChild(row);
            });
        } else {
            showFeedback('Error al cargar contactos filtrados por categoría', false);
        }
    } catch (err) {
        console.error('Error al cargar los contactos:', err);
        showFeedback(`Error de conexión: ${err.message}`, false);
    }
});