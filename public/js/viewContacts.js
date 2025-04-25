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
        nombreCell.textContent = contact.nombre || 'Sin Nombre';
        row.appendChild(nombreCell);

        const telefonoCell = document.createElement('td');
        telefonoCell.textContent = contact.telefono || 'Sin Teléfono';
        row.appendChild(telefonoCell);

        const emailCell = document.createElement('td');
        emailCell.textContent = contact.email || 'Sin Email';
        row.appendChild(emailCell);

        const categoriaCell = document.createElement('td');
        categoriaCell.textContent = contact.categoria || 'Sin Categoría';
        row.appendChild(categoriaCell);

        const notasCell = document.createElement('td');
        notasCell.textContent = contact.notas || '';
        row.appendChild(notasCell);

        const actionsCell = document.createElement('td');
        actionsCell.className = 'actions'; // Clase para alinear los botones

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

    document.getElementById('importGoogleContacts')?.addEventListener('click', async () => {
        console.log('Botón "Importar Contactos de Google" pulsado'); // Log para depuración
    
        try {
            // Solicitar la URL de autenticación al servidor
            const response = await fetch('/google/auth-url');
            if (response.ok) {
                const { authUrl } = await response.json();
                console.log('Redirigiendo a:', authUrl); // Log para verificar la URL de autenticación
                window.location.href = authUrl; // Redirigir al flujo de autenticación de Google
            } else {
                throw new Error('Error al obtener la URL de autenticación');
            }
        } catch (err) {
            console.error('Error al manejar la autenticación de Google:', err);
            alert('Error al iniciar sesión con Google');
        }
    });
    

