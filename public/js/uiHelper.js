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
        row.dataset.id = contact.id || ''; // Guardar el ID en la fila

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
        categoriaCell.textContent = contact.categoria || 'Sin Categoría'; // Mostrar 'Sin Categoría' si está vacío
        row.appendChild(categoriaCell);

        const notasCell = document.createElement('td');
        notasCell.textContent = contact.notas || '';
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
   // const confirmDelete = confirm('¿Estás seguro de que deseas eliminar este contacto?');
    //if (!confirmDelete) return;

    try {
        const response = await fetch(`/contacts/${contactId}`, {
            method: 'DELETE',
            credentials: 'include' // Incluir cookies en la solicitud
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
    fetch(`/contacts/${contactId}`, {
        credentials: 'include' // Incluir cookies en la solicitud
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener el contacto');
            }
            return response.json();
        })
        .then(contact => {
            if (!contact) {
                console.error('Contacto no encontrado');
                return;
            }

            // Cargar los datos del contacto en el formulario de edición
            const editForm = document.querySelector('#editForm');
            if (!editForm) {
                console.error('Formulario de edición no encontrado');
                return;
            }

            document.querySelector('#editNombre').value = contact.nombre || '';
            document.querySelector('#editTelefono').value = contact.telefono || '';
            document.querySelector('#editEmail').value = contact.email || '';
            document.querySelector('#editNotas').value = contact.notas || '';
            document.querySelector('#editCategoria').value = contact.categoria || '';

            // Mostrar el formulario de edición
            editForm.dataset.id = contactId; // Guardar el ID en el atributo dataset
            editForm.style.display = 'block';

            // Desplazar la página para que el formulario sea visible
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
    const updatedContact = {
        nombre: document.querySelector('#editNombre').value,
        telefono: document.querySelector('#editTelefono').value,
        email: document.querySelector('#editEmail').value,
        notas: document.querySelector('#editNotas').value,
        categoria: document.querySelector('#editCategoria').value,
    };

    try {
        const response = await fetch(`/contacts/${contactId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Incluir cookies en la solicitud
            body: JSON.stringify(updatedContact),
        });

        if (response.ok) {
            showFeedback('Contacto actualizado correctamente');
            loadContacts(); // Recargar la lista de contactos
            document.querySelector('#editForm').style.display = 'none'; // Ocultar el formulario de edición
        } else {
            const error = await response.json();
            showFeedback(error.error || 'Error al actualizar contacto', false);
        }
    } catch (err) {
        console.error('Error al actualizar contacto:', err);
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

// Función para verificar la sesión del usuario
async function checkSession() {
    try {
        const response = await fetch('/auth/isAuthenticated', {
            credentials: 'include'
        });

        if (!response.ok) {
            window.location.href = '/html/login.html';
            return;
        }

        const data = await response.json();
        if (!data.authenticated) {
            window.location.href = '/html/login.html';
        }
    } catch (error) {
        console.error('Error:', error);
        window.location.href = '/html/login.html';
    }
}

// Función para cargar datos del usuario
async function loadUserData() {
    try {
        const response = await fetch('/auth/user', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error al cargar datos del usuario');
        }

        const userData = await response.json();
        displayUserData(userData);
    } catch (error) {
        console.error('Error:', error);
        showFeedback('Error al cargar datos del usuario', false);
    }
}

// Función para actualizar datos del usuario
async function updateUserData(userData) {
    try {
        const response = await fetch('/auth/user', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error('Error al actualizar datos del usuario');
        }

        showFeedback('Datos actualizados exitosamente');
    } catch (error) {
        console.error('Error:', error);
        showFeedback('Error al actualizar datos del usuario', false);
    }

    document.addEventListener('initializeImport', () => {
        const importButton = document.getElementById('importGoogleContacts');
        if (importButton) {
            importButton.addEventListener('click', async () => {
                try {
                    const response = await fetch('/google/auth-url');
                    if (response.ok) {
                        const { authUrl } = await response.json();
                        window.location.href = authUrl;
                    } else {
                        throw new Error('Error al obtener la URL de autenticación');
                    }
                } catch (err) {
                    console.error('Error al manejar la autenticación de Google:', err);
                    alert('Error al iniciar sesión con Google');
                }
            });
        }
    });
}