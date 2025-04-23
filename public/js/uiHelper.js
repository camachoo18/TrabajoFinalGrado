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
        categoriaCell.textContent = contact.categoria || 'Sin Categoría';
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
// Función para eliminar un contacto
async function deleteContact(contactId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/contacts/${contactId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            showFeedback('Contacto eliminado correctamente');
            loadContacts(); // Recargar la lista de contactos
        } else {
            const error = await response.json();
            showFeedback(error.error || 'Error al eliminar contacto', false);
        }
    } catch (err) {
        console.error('Error al eliminar contacto:', err);
        showFeedback(`Error de conexión: ${err.message}`, false);
    }
}

// Función para alternar el modo de edición
function toggleEditMode(row, contactId) {
    const token = localStorage.getItem('token');
    fetch(`/contacts/${contactId}`, {
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
            editForm.dataset.id = contactId; // Guardar el ID en el atributo dataset
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
}

// Función para guardar los cambios en el contacto después de editar
async function saveEdits(contactId) {
    //console.log('Iniciando actualización del contacto con ID:', contactId);
    const updatedContact = {
        nombre: document.querySelector('#editNombre').value,
        telefono: document.querySelector('#editTelefono').value,
        email: document.querySelector('#editEmail').value,
        notas: document.querySelector('#editNotas').value,
        categoria: document.querySelector('#editCategoria').value,
    };
    //console.log('Datos del contacto actualizados:', updatedContact);

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/contacts/${contactId}`, { // para editar el contacto y guardarlo
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedContact),
        });

        if (response.ok) {
            //console.log('Contacto actualizado correctamente');
            showFeedback('Contacto actualizado correctamente');
            loadContacts(); // Recargar la lista de contactos
            document.querySelector('#editForm').style.display = 'none'; // Ocultar el formulario de edición
        } else {
            const error = await response.json();
            showFeedback(error.error || 'Error al actualizar contacto', false);
        }
    } catch (err) {
        showFeedback(`Error de conexión: ${err.message}`, false);
    }
}

// Función para mostrar feedback
function showFeedback(message, success = true) {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.className = success ? 'feedback success' : 'feedback error';
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 3000); // Eliminar feedback después de 3 segundos
}