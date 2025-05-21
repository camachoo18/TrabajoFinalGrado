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
        deleteButton.onclick = () => {
            const actions = [
                { text: 'Eliminar', callback: () => performDeleteContact(contact.id, 'global-feedback') },
                { text: 'Cancelar', callback: () => {} }
            ];
            showFeedback('¿Estás seguro de que deseas eliminar este contacto?', 'confirmation', 'global-feedback', 0, actions);
        };
        actionsCell.appendChild(deleteButton);

        row.appendChild(actionsCell);
        tableBody.appendChild(row);
    });
}

// Función para eliminar un contacto
async function performDeleteContact(contactId, containerId = 'global-feedback') {
    try {
        const response = await fetch(`/contacts/${contactId}`, {
            method: 'DELETE',
            credentials: 'include' // Incluir cookies en la solicitud
        });

        if (response.ok) {
            showFeedback('Contacto eliminado correctamente', 'success', containerId);
            if (typeof loadContacts === 'function') {
                loadContacts(true); // Pass true to suppress loadContacts' own feedback
            } else {
                console.warn('loadContacts function is not available to refresh the list.');
            }
        } else {
            const errorData = await response.json().catch(() => ({ error: 'Error desconocido al eliminar.' }));
            showFeedback(errorData.error || 'Error al eliminar contacto', 'error', containerId);
        }
    } catch (err) {
        console.error('Error al eliminar contacto:', err);
        showFeedback(`Error de conexión: ${err.message}`, 'error', containerId);
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
                const updatedContactData = {
                    nombre: document.querySelector('#editNombre').value,
                    telefono: document.querySelector('#editTelefono').value,
                    email: document.querySelector('#editEmail').value,
                    notas: document.querySelector('#editNotas').value,
                    categoria: document.querySelector('#editCategoria').value,
                };
                saveEdits(contactId, updatedContactData);
            };
        })
        .catch(error => {
            console.error('Error al obtener el contacto:', error);
        });
}

// Función para guardar los cambios en el contacto después de editar
async function saveEdits(contactId, updatedContactData, containerId = 'global-feedback') {
    try {
        const response = await fetch(`/contacts/${contactId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Incluir cookies en la solicitud
            body: JSON.stringify(updatedContactData),
        });

        if (response.ok) {
            showFeedback('Contacto actualizado correctamente', 'success', containerId);
            const editFormContainer = document.getElementById('editFormContainer');
            if (editFormContainer) {
                editFormContainer.style.display = 'none'; // Hide the form
            } else {
                console.error('[uiHelper.js] editFormContainer not found when trying to hide after save.');
            }
            if (typeof loadContacts === 'function') {
                loadContacts(true); // Pass true to suppress loadContacts' own feedback
            } else {
                console.warn('loadContacts function is not available to refresh the list.');
            }
        } else {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido al guardar' }));
            showFeedback(errorData.message || 'Error al actualizar contacto', 'error', containerId);
        }
    } catch (err) {
        console.error('Error al actualizar contacto:', err);
        showFeedback(`Error de conexión: ${err.message}`, 'error', containerId);
    }
}

/**
 * Muestra un mensaje de feedback al usuario.
 * @param {string} message El mensaje a mostrar.
 * @param {string} type Tipo de mensaje: 'info', 'success', 'error', 'warning', 'confirmation', 'loading'. Default 'info'.
 * @param {string} containerId ID del contenedor donde se mostrará el feedback. Default 'global-feedback'.
 * @param {number} duration Duración en ms antes de que el mensaje desaparezca. Si es 0 o si hay acciones, no desaparece automáticamente. Default 3000.
 * @param {Array<Object>} actions Array de objetos de acción, ej: [{ text: 'OK', callback: () => {}, className: 'btn-primary' }]. Default null.
 */
function showFeedback(message, type = 'info', containerId = 'global-feedback', duration = 3000, actions = null) {
    console.log('DEBUG: uiHelper.js showFeedback entered. Message:', message, 'Type:', type, 'ContainerID:', containerId);
    const feedbackContainerStack = document.getElementById(containerId);
    console.log('DEBUG: uiHelper.js feedbackContainerStack (getElementById result):', feedbackContainerStack);

    if (!feedbackContainerStack) {
        console.error(`Feedback container #${containerId} not found.`);
        // Fallback to alert for critical feedback if container is missing
        if (type === 'error' || type === 'warning') alert(message);
        return null; // Return null or some indicator of failure
    }

    // Clear previous messages in the container for certain types to avoid stacking confirmations/loadings
    if (type === 'confirmation' || type === 'loading' || (actions && actions.length > 0)) {
        // If clearing all, ensure ongoing operations are considered (e.g. multiple load indicators)
        // For now, simple clear for these types. A more robust system might tag messages.
        feedbackContainerStack.innerHTML = ''; 
    }

    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = `feedback-message feedback-${type}`; // e.g., feedback-success, feedback-error
    feedbackDiv.style.opacity = '0'; // Start transparent for fade-in

    const messageSpan = document.createElement('span');
    messageSpan.className = 'feedback-text-content';

    if (type === 'loading') {
        messageSpan.textContent = message || 'Cargando...'; // Set text first
        feedbackDiv.appendChild(messageSpan); // Append text span first

        const spinner = document.createElement('div');
        spinner.className = 'spinner'; 
        feedbackDiv.appendChild(spinner); // Append spinner after text
    } else {
        messageSpan.textContent = message;
        feedbackDiv.appendChild(messageSpan); // For other types, append text span as before
    }

    if (actions && actions.length > 0) {
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'feedback-actions'; 

        actions.forEach(action => {
            const button = document.createElement('button');
            button.textContent = action.text;
            // Ensure btn-sm is added if not already part of a more specific Bootstrap class set
            let btnClass = action.className || 'btn-secondary';
            if (!btnClass.includes('btn-sm') && !btnClass.includes('btn-lg')) {
                btnClass += ' btn-sm';
            }
            button.className = `btn ${btnClass}`;
            
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event from bubbling up, if necessary
                // Remove this specific feedbackDiv after action
                feedbackDiv.style.opacity = '0';
                setTimeout(() => {
                    if (feedbackContainerStack.contains(feedbackDiv)) {
                        feedbackContainerStack.removeChild(feedbackDiv);
                    }
                    if (feedbackContainerStack.children.length === 0) {
                        feedbackContainerStack.style.display = 'none';
                    }
                }, 300); // Match fade-out time

                if (action.callback && typeof action.callback === 'function') {
                    action.callback();
                }
            });
            actionsContainer.appendChild(button);
        });
        feedbackDiv.appendChild(actionsContainer);
        duration = 0; // Actions imply the message stays until interaction
    }

    feedbackContainerStack.appendChild(feedbackDiv);
    if (window.getComputedStyle(feedbackContainerStack).display === 'none') {
        feedbackContainerStack.style.display = 'flex'; // Or 'block', ensure it's visible
    }
    
    // Force a reflow before adding class for transition to work correctly
    void feedbackDiv.offsetWidth;

    // Fade in
    setTimeout(() => { feedbackDiv.style.opacity = '1'; }, 10); 

    if (duration > 0) {
        setTimeout(() => {
            feedbackDiv.style.opacity = '0';
            setTimeout(() => {
                if (feedbackContainerStack.contains(feedbackDiv)) {
                    feedbackContainerStack.removeChild(feedbackDiv);
                }
                if (feedbackContainerStack.children.length === 0) {
                    feedbackContainerStack.style.display = 'none';
                }
            }, 500); 
        }, duration);
    }
    return feedbackDiv; // Return the created element for potential further manipulation
}

// Función para verificar la sesión del usuario
async function checkSession(containerId = 'global-feedback') {
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
        // showFeedback('Error de sesión, redirigiendo...', false, containerId); // Optional feedback
        window.location.href = '/html/login.html';
    }
}

// Función para cargar datos del usuario
async function loadUserData(containerId = 'global-feedback') {
    try {
        const response = await fetch('/auth/user', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error al cargar datos del usuario');
        }

        const userData = await response.json();
        // displayUserData(userData); // Assuming displayUserData is defined elsewhere or not needed here
    } catch (error) {
        console.error('Error:', error);
        showFeedback('Error al cargar datos del usuario', false, containerId);
    }
}

// Función para actualizar datos del usuario
async function updateUserData(userData, containerId = 'global-feedback') {
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

        showFeedback('Datos actualizados exitosamente', true, containerId);
    } catch (error) {
        console.error('Error:', error);
        showFeedback('Error al actualizar datos del usuario', false, containerId);
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