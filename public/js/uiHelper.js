function renderContacts(contacts) {
    if (!Array.isArray(contacts)) {
        console.error("Contacts no es un array", contacts);
        return;
    }

    const tableBody = document.querySelector('#contactList tbody');
    if (!tableBody) {
        console.error('Elemento de la tabla no encontrado');
        return;
    }

    tableBody.innerHTML = ''; // Limpia el contenido actual

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
        editButton.onclick = () => {
            toggleEditMode(row, contact.id);
            
            const token = localStorage.getItem('token');
            fetch(`/contacts/${contact.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(response => response.json())
                .then(contact => {
                    if (!contact) {
                        console.error('Contacto no encontrado');
                        return;
                    }

            // Cargar los datos del contacto en el formulario de edición
                document.querySelector('#editNombre').value = contact.nombre;
                document.querySelector('#editTelefono').value = contact.telefono;
                document.querySelector('#editEmail').value = contact.email;
                document.querySelector('#editNotas').value = contact.notas;
                document.querySelector('#editCategoria').value = contact.categoria;

            // Mostrar el formulario de edición
            const editForm = document.querySelector('#editForm');
            editForm.style.display = 'block';

            // Desplazar la página para que el formulario sea visible
            console.log('Desplazando hacia el formulario de edición...');
            editForm.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Guardar los cambios
            document.querySelector('#saveEditButton').onclick = () => {
                saveEdits(contactId);
                    };
                })
                .catch(error => {
                    console.error('Error al obtener el contacto:', error);
                });
        };
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