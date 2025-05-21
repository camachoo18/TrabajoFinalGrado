// Redirigir a logout.html al hacer clic en el botón de cerrar sesión

const VIEW_CONTACTS_FEEDBACK_ID = 'global-feedback';

async function editContact(contactId) {
    try {
        const response = await fetch(`/contacts/${contactId}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error al cargar datos del contacto');
        }

        const contact = await response.json();

        // Cargar los datos del contacto en el formulario de edición
        const editFormContainer = document.getElementById('editFormContainer');
        const editForm = document.getElementById('editForm');
        if (!editFormContainer || !editForm) {
            showFeedback('Error al inicializar el formulario de edición.', 'error', VIEW_CONTACTS_FEEDBACK_ID);
            return;
        }

        editForm.dataset.id = contact.id; // Store contactId for saving
        document.getElementById('editNombre').value = contact.nombre;
        document.getElementById('editTelefono').value = contact.telefono;
        document.getElementById('editEmail').value = contact.email;
        document.getElementById('editNotas').value = contact.notas;
        document.getElementById('editCategoria').value = contact.categoria;
        
        // Handle 'Otra' category display for edit form
        const categoriaSelect = document.getElementById('editCategoria');
        const nuevaCategoriaGroup = document.getElementById('editNuevaCategoriaGroup');
        const nuevaCategoriaInput = document.getElementById('editNuevaCategoria');
        if (categoriaSelect && nuevaCategoriaGroup && nuevaCategoriaInput) {
            if (contact.categoria === 'Otra' || !['Trabajo', 'Amigos', 'Familia', 'Sin Categoría'].includes(contact.categoria) ) {
                categoriaSelect.value = 'Otra'; // Select 'Otra' if custom category
                nuevaCategoriaGroup.style.display = 'block';
                nuevaCategoriaInput.value = contact.categoria === 'Otra' ? '' : contact.categoria; // Pre-fill if it was a custom one not named 'Otra'
            } else {
                nuevaCategoriaGroup.style.display = 'none';
                nuevaCategoriaInput.value = '';
            }
        }

        // Ensure the form itself is also set to display block
        editForm.style.display = 'block'; 

        // Mostrar el formulario de edición
        editFormContainer.style.display = 'block';
        // editForm.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Temporarily commented out

    } catch (error) {
        showFeedback('Error al cargar datos del contacto', 'error', VIEW_CONTACTS_FEEDBACK_ID);
    }
}

// Función para cargar contactos
async function loadContacts(isRefreshAfterAction = false) {
    try {
        // Only show 'Cargando contactos...' if it's not a refresh after another action.
        if (!isRefreshAfterAction) {
            //showFeedback('Cargando contactos2...', 'loading', VIEW_CONTACTS_FEEDBACK_ID, 0);
        }
        
        const response = await fetch('/contacts', {
            credentials: 'include'
        });

        if (!response.ok) {
            // Clear any persistent loading messages specific to this function if they were shown
            // This part is tricky without specific IDs for messages to clear.
            // For now, a new error message will stack or replace based on uiHelper logic.
            throw new Error('Error al cargar contactos');
        }

        const contacts = await response.json();
        displayContacts(contacts);

        // Only show 'Contactos cargados.' if it's not a refresh.
        if (!isRefreshAfterAction) {
            //showFeedback('Contactos cargados.', 'success', VIEW_CONTACTS_FEEDBACK_ID);
        }
        // If it is a refresh, the success message from the preceding action (e.g., 'Contacto actualizado')
        // will remain as the primary feedback.

    } catch (error) {
        console.error('Error:', error);
        // Error feedback should always be shown, regardless of isRefreshAfterAction.
        showFeedback('Error al cargar contactos: ' + error.message, 'error', VIEW_CONTACTS_FEEDBACK_ID);
    }
}

// Confirmation for deleting a contact, then calls performDeleteContact from uiHelper.js
async function deleteContactLocal(contactId) {
    const actions = [
        {
            text: 'Eliminar',
            className: 'btn-danger',
            callback: () => {
                // Ensure performDeleteContact is available (from uiHelper.js)
                if (typeof performDeleteContact === 'function') {
                    performDeleteContact(contactId, VIEW_CONTACTS_FEEDBACK_ID);
                } else {
                    console.error('performDeleteContact function is not defined.');
                    showFeedback('Error: La función para eliminar no está disponible.', 'error', VIEW_CONTACTS_FEEDBACK_ID);
                }
            }
        },
        {
            text: 'Cancelar',
            className: 'btn-secondary',
            callback: () => { /* No action, feedback will close */ }
        }
    ];
    showFeedback(
        '¿Estás seguro de que deseas eliminar este contacto?',
        'confirmation',
        VIEW_CONTACTS_FEEDBACK_ID,
        0, // Duration 0, actions will keep it open
        actions
    );
}

// Event listener for the edit form submission
document.addEventListener('DOMContentLoaded', () => {
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const contactId = editForm.dataset.id;
            if (!contactId) {
                showFeedback('No se pudo obtener el ID del contacto para actualizar.', 'error', VIEW_CONTACTS_FEEDBACK_ID);
                return;
            }

            let categoriaFinal = document.getElementById('editCategoria').value;
            if (categoriaFinal === 'Otra') {
                const nuevaCategoria = document.getElementById('editNuevaCategoria').value.trim();
                if (!nuevaCategoria) {
                    showFeedback('Por favor, especifica el nombre de la nueva categoría.', 'warning', VIEW_CONTACTS_FEEDBACK_ID);
                    return;
                }
                categoriaFinal = nuevaCategoria;
            }

            const updatedContactData = {
                nombre: document.getElementById('editNombre').value,
                telefono: document.getElementById('editTelefono').value,
                email: document.getElementById('editEmail').value,
                notas: document.getElementById('editNotas').value,
                categoria: categoriaFinal,
            };
            // showFeedback is now called within saveEdits in uiHelper.js
            // showFeedback('Guardando...', 'loading', VIEW_CONTACTS_FEEDBACK_ID, 0);
            if (typeof saveEdits === 'function') {
                await saveEdits(contactId, updatedContactData, VIEW_CONTACTS_FEEDBACK_ID);
            } else {
                console.error('saveEdits function is not defined. Make sure uiHelper.js is loaded correctly.');
                showFeedback('Error al guardar: función no disponible.', 'error', VIEW_CONTACTS_FEEDBACK_ID);
            }
        });
    }

    const cancelEditButton = document.getElementById('cancelEditButton');
    if (cancelEditButton) {
        cancelEditButton.addEventListener('click', () => {
            const editFormContainer = document.getElementById('editFormContainer');
            if (editFormContainer) {
                editFormContainer.style.display = 'none';
            }
            const feedbackContainer = document.getElementById(VIEW_CONTACTS_FEEDBACK_ID);
            if (feedbackContainer) {
                feedbackContainer.style.display = 'none'; // Hide feedback on cancel
            }
        });
    }
    
    // Listener for category change in edit form to show/hide new category input
    const editCategoriaSelect = document.getElementById('editCategoria');
    const editNuevaCategoriaGroup = document.getElementById('editNuevaCategoriaGroup');
    if (editCategoriaSelect && editNuevaCategoriaGroup) {
        editCategoriaSelect.addEventListener('change', function() {
            if (this.value === 'Otra') {
                editNuevaCategoriaGroup.style.display = 'block';
            } else {
                editNuevaCategoriaGroup.style.display = 'none';
            }
        });
    }

    loadContacts(true); // Initial load of contacts, suppress feedback messages
});

// Función para mostrar contactos en la tabla
function displayContacts(contacts) {
    const tableBody = document.getElementById('contactsTableBody');
    if (!tableBody) {
      console.error('contactsTableBody not found');
      return;
    }
    tableBody.innerHTML = ''; // Limpiar la tabla antes de añadir nuevos contactos

    if (!contacts || contacts.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-5">No hay contactos para mostrar.</td></tr>`;
        return;
    }

    // Crear conjuntos para rastrear los números de teléfono y nombres ya presentes
    const existingPhoneNumbers = new Set();
    const existingNames = new Set();

    // Ordenar los contactos alfabéticamente por nombre
    contacts.sort((a, b) => {
        const nameA = a.nombre?.toLowerCase() || ''; // Convertir a minúsculas para comparación
        const nameB = b.nombre?.toLowerCase() || '';
        return nameA.localeCompare(nameB); // Comparar alfabéticamente
    });

    contacts.forEach(contact => {
        // Normalizar el número de teléfono y el nombre
        const normalizedPhone = contact.telefono?.replace(/\D/g, '') || ''; // Eliminar caracteres no numéricos
        const normalizedName = contact.nombre?.trim().toLowerCase() || ''; // Normalizar el nombre (sin espacios y en minúsculas)

        // Evitar duplicados: solo añadir contactos cuyo teléfono o nombre no estén ya en los conjuntos
        if ((normalizedPhone && existingPhoneNumbers.has(normalizedPhone)) || (normalizedName && existingNames.has(normalizedName))) {
            // console.log(`Contacto duplicado ignorado: ${contact.nombre} (${contact.telefono})`);
            return; // Saltar este contacto si ya existe un duplicado por teléfono o nombre
        }

        const row = tableBody.insertRow();
        row.dataset.id = contact.id; // Guardar el ID en el atributo `data-id`
        // row.dataset.phone = normalizedPhone; // Guardar el teléfono normalizado en el atributo `data-phone`
        // row.dataset.name = normalizedName; // Guardar el nombre normalizado en el atributo `data-name`

        row.innerHTML = `
            <td>${contact.nombre || 'Sin Nombre'}</td>
            <td>${contact.telefono || 'Sin Teléfono'}</td>
            <td>${contact.email || 'Sin Email'}</td>
            <td>${contact.categoria || 'Sin Categoría'}</td>
            <td>${contact.notas || ''}</td>
            <td>
                <button class="btn btn-sm btn-info edit" onclick="editContact('${contact.id}')">Editar</button>
                <button class="btn btn-sm btn-danger delete" onclick="deleteContactLocal('${contact.id}')">Eliminar</button>
            </td>
        `;

        // Añadir el teléfono y el nombre normalizados a los conjuntos para evitar duplicados
        if (normalizedPhone) existingPhoneNumbers.add(normalizedPhone);
        if (normalizedName) existingNames.add(normalizedName);
    });
}

// Evento para importar contactos desde Google
document.getElementById('importGoogleContacts')?.addEventListener('click', async () => {

    try {
        // Solicitar la URL de autenticación al servidor
        const response = await fetch('/google/auth-url');
        if (response.ok) {
            const { authUrl } = await response.json();
            
            window.location.href = authUrl; // Redirigir al flujo de autenticación de Google
        } else {
            throw new Error('Error al obtener la URL de autenticación');
        }
    } catch (err) {
        console.error('Error al manejar la autenticación de Google:', err);
        alert('Error al iniciar sesión con Google');
    }
});

// Verificar si venimos de una autenticación exitosa y proceder a importar contactos
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    const shouldImport = urlParams.get('import');

    if (authStatus === 'success' && shouldImport === 'true') {
        //console.log('Autenticación exitosa, intentando importar contactos...');
        window.history.replaceState({}, document.title, window.location.pathname); // Limpiar la URL
        importGoogleContacts(); // Llamar automáticamente a la función de importación
    } else if (authStatus === 'error') {
        alert('Error en la autenticación con Google');
        window.history.replaceState({}, document.title, window.location.pathname); // Limpiar la URL
    }
});


async function importGoogleContacts() {
    try {
        //console.log('Iniciando importación de contactos desde Google...');
        const response = await fetch('/google/import-contacts', {
            method: 'POST',
            credentials: 'include', // Incluir cookies en la solicitud
        });

        if (response.ok) {
            const data = await response.json();
            alert(data.message || 'Contactos importados correctamente');

            // Llamar a loadContacts para recargar todos los contactos (previos e importados)
            await loadContacts();
        } else if (response.status === 401) {
            const data = await response.json();
            if (data.needsReauth && data.authUrl) {
                window.location.href = data.authUrl; // Redirigir al flujo de autenticación
            } else {
                alert('Error de autenticación');
            }
        } else {
            alert('Error al importar contactos');
        }
    } catch (err) {
        console.error('Error al importar contactos:', err);
        alert('Error al importar contactos de Google en viewcontacts.js');
    }
}
