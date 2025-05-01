// Redirigir a logout.html al hacer clic en el botón de cerrar sesión
document.getElementById('logoutButton')?.addEventListener('click', () => {
    window.location.href = '/html/logout.html';
});

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
        document.getElementById('editForm').dataset.id = contact.id;
        document.getElementById('editNombre').value = contact.nombre;
        document.getElementById('editTelefono').value = contact.telefono;
        document.getElementById('editEmail').value = contact.email;
        document.getElementById('editNotas').value = contact.notas;
        document.getElementById('editCategoria').value = contact.categoria;

        // Mostrar el formulario de edición y ocultar el de agregar
        
        document.getElementById('editForm').style.display = 'block';
    } catch (error) {
        console.error('Error al cargar datos del contacto:', error);
        showFeedback('Error al cargar datos del contacto', false);
    }
}

// Función para cargar contactos
async function loadContacts() {
    try {
        console.log('Cargando contactos desde el servidor...');
        const response = await fetch('/contacts', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error al cargar contactos');
        }

        const contacts = await response.json();
        console.log('Contactos cargados:', contacts);
        displayContacts(contacts);
    } catch (error) {
        console.error('Error:', error);
        showFeedback('Error al cargar contactos', false);
    }
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
            // Eliminar la fila correspondiente de la tabla
            const row = document.querySelector(`tr[data-id="${contactId}"]`);
            if (row) {
                row.remove(); // Eliminar la fila del DOM
            }

            showFeedback('Contacto eliminado correctamente');
        } else {
            const error = await response.json();
            showFeedback(error.error || 'Error al eliminar contacto', false);
        }
    } catch (err) {
        console.error('Error al eliminar contacto:', err);
        showFeedback(`Error de conexión: ${err.message}`, false);
    }
}

// Función para mostrar contactos en la tabla
function displayContacts(contacts) {
    const tableBody = document.getElementById('contactsTableBody');

    // Limpiar la tabla antes de añadir nuevos contactos
    tableBody.innerHTML = '';

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
        if (!existingPhoneNumbers.has(normalizedPhone) && !existingNames.has(normalizedName)) {
            const row = document.createElement('tr');
            row.dataset.id = contact.id; // Guardar el ID en el atributo `data-id`
            row.dataset.phone = normalizedPhone; // Guardar el teléfono normalizado en el atributo `data-phone`
            row.dataset.name = normalizedName; // Guardar el nombre normalizado en el atributo `data-name`

            row.innerHTML = `
                <td>${contact.nombre || 'Sin Nombre'}</td>
                <td>${contact.telefono || 'Sin Teléfono'}</td>
                <td>${contact.email || 'Sin Email'}</td>
                <td>${contact.categoria || 'Sin Categoría'}</td>
                <td>${contact.notas || ''}</td>
                <td>
                    <button class="edit" onclick="editContact(${contact.id})">Editar</button>
                    <button class="delete" onclick="deleteContact(${contact.id})">Eliminar</button>
                </td>
            `;
            tableBody.appendChild(row); // Añadir la nueva fila a la tabla

            // Añadir el teléfono y el nombre normalizados a los conjuntos para evitar duplicados
            existingPhoneNumbers.add(normalizedPhone);
            existingNames.add(normalizedName);
        } else {
            console.log(`Contacto duplicado ignorado: ${contact.nombre} (${contact.telefono})`);
        }
    });
}
// Evento para importar contactos desde Google
document.getElementById('importGoogleContacts')?.addEventListener('click', async () => {
    console.log('Botón "Importar Contactos de Google" pulsado');

    try {
        // Solicitar la URL de autenticación al servidor
        const response = await fetch('/google/auth-url');
        if (response.ok) {
            const { authUrl } = await response.json();
            console.log('Redirigiendo a:', authUrl);
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
        console.log('Autenticación exitosa, intentando importar contactos...');
        window.history.replaceState({}, document.title, window.location.pathname); // Limpiar la URL
        importGoogleContacts(); // Llamar automáticamente a la función de importación
    } else if (authStatus === 'error') {
        alert('Error en la autenticación con Google');
        window.history.replaceState({}, document.title, window.location.pathname); // Limpiar la URL
    }
});


async function importGoogleContacts() {
    try {
        console.log('Iniciando importación de contactos desde Google...');
        const response = await fetch('/google/import-contacts', {
            method: 'POST',
            credentials: 'include', // Incluir cookies en la solicitud
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Contactos importados desde el backend:', data.contacts);
            alert(data.message || 'Contactos importados correctamente');

            // Llamar a loadContacts para recargar todos los contactos (previos e importados)
            await loadContacts();
        } else if (response.status === 401) {
            const data = await response.json();
            if (data.needsReauth && data.authUrl) {
                console.log('Redirigiendo a:', data.authUrl);
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
