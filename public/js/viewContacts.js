// Redirigir a logout.html al hacer clic en el botón de cerrar sesión
document.getElementById('logoutButton')?.addEventListener('click', () => {
    window.location.href = '/html/logout.html';
});

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

// Función para mostrar contactos en la tabla
function displayContacts(contacts) {
    const tableBody = document.getElementById('contactsTableBody');

    // Crear un conjunto con los IDs de los contactos ya presentes en la tabla
    const existingContactIds = new Set(
        Array.from(tableBody.querySelectorAll('tr')).map(row => row.dataset.id)
    );

    contacts.forEach(contact => {
        // Evitar duplicados: solo añadir contactos que no estén ya en la tabla
        if (!existingContactIds.has(String(contact.id))) {
            const row = document.createElement('tr');
            row.dataset.id = contact.id; // Guardar el ID en el atributo `data-id`

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

// Función para importar contactos desde Google
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
            displayContacts(data.contacts); // Renderizar los contactos importados
            alert(data.message || 'Contactos importados correctamente');
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