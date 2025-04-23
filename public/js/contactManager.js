// Función para buscar contactos dinámicamente
async function searchContacts(query) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/contacts/search?q=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const contacts = await response.json();
            renderContacts(contacts);
        } else if (response.status === 404) {
            renderContacts([]); // Mostrar mensaje de "No se encontraron contactos"
        } else {
            const error = await response.json();
            console.error('Error al buscar contactos:', error);
            showFeedback(error.error || 'Error al buscar contactos', false);
        }
    } catch (err) {
        console.error('Error al buscar contactos:', err);
        showFeedback(`Error de conexión: ${err.message}`, false);
    }
}

// Event listener para la búsqueda dinámica
document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    searchContacts(query);
});

// Función para cargar todos los contactos
async function loadContacts() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/contacts', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const contacts = await response.json();
            renderContacts(contacts); // Renderizar todos los contactos
        } else {
            showFeedback('Error al cargar contactos', false);
        }
    } catch (err) {
        console.error('Error al cargar contactos:', err);
        showFeedback(`Error de conexión: ${err.message}`, false);
    }
}

// Función para renderizar contactos en la tabla
function renderContacts(contacts) {
    const tableBody = document.querySelector('#contactsTableBody');
    if (!tableBody) {
        console.error('Elemento de la tabla no encontrado');
        return;
    }

    tableBody.innerHTML = ''; // Limpiar el contenido actual

    if (contacts.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">No se encontraron contactos</td></tr>';
        return;
    }

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
        categoriaCell.textContent = contact.categoria || 'Sin Categoría';
        row.appendChild(categoriaCell);

        const notasCell = document.createElement('td');
        notasCell.textContent = contact.notas || '';
        row.appendChild(notasCell);

        const actionsCell = document.createElement('td');
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

// Manejar el evento submit del formulario de agregar contacto
document.getElementById('contactForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obtener valores del formulario
    const nombre = document.getElementById('nombre').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const email = document.getElementById('email').value.trim();
    const notas = document.getElementById('notas').value.trim();
    const categoria = document.getElementById('categoria').value.trim();
    const nuevaCategoria = document.getElementById('nuevaCategoria')?.value.trim();

    // Si la categoría es "Otra", usar la nueva categoría
    const finalCategoria = categoria === 'Otra' && nuevaCategoria ? nuevaCategoria : categoria;

    // Crear el objeto del contacto
    const contact = { nombre, telefono, email, notas, categoria: finalCategoria };

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(contact)
        });

        if (response.ok) {
            showFeedback(`Contacto "${nombre}" añadido correctamente`);
            document.getElementById('contactForm').reset(); // Limpiar el formulario
        } else {
            const error = await response.json();
            showFeedback(error.error || 'Error al agregar contacto', false);
        }
    } catch (err) {
        console.error('Error al agregar contacto:', err);
        showFeedback(`Error de conexión: ${err.message}`, false);
    }
});

document.getElementById('editForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('editForm').dataset.id;
    const nombre = document.getElementById('editNombre').value.trim();
    const telefono = document.getElementById('editTelefono').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const notas = document.getElementById('editNotas').value.trim();
    const categoria = document.getElementById('editCategoria').value.trim();
    const nuevaCategoria = document.getElementById('editNuevaCategoria')?.value.trim();

    // Si la categoría es "Otra", usar la nueva categoría
    const finalCategoria = categoria === 'Otra' && nuevaCategoria ? nuevaCategoria : categoria;

    // Crear el objeto del contacto
    const contact = { nombre, telefono, email, notas, categoria: finalCategoria };

    const token = localStorage.getItem('token');
    if (!token) {
        showFeedback('No se proporcionó un token. Por favor, inicia sesión nuevamente.', false);
        window.location.href = '/html/login.html'; // Redirigir al inicio de sesión
        return;
    }

    try {
        const response = await fetch(`/contacts/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(contact)
        });

        if (response.ok) {
            loadContacts(); // Recargar la lista de contactos
            showFeedback('Contacto actualizado correctamente'); // Mostrar mensaje de éxito

            const editForm = document.getElementById('editForm');
            if (editForm) {
                editForm.style.display = 'none'; // Ocultar el formulario de edición
            } else {
                console.error('El formulario de edición no se encontró en el DOM.');
            }

            const contactForm = document.getElementById('contactForm');
            if (contactForm) {
                contactForm.style.display = 'block'; // Mostrar el formulario de agregar
            }
        } else if (response.status === 401) {
            showFeedback('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', false);
            localStorage.removeItem('token'); // Eliminar el token expirado
            window.location.href = '/html/login.html'; // Redirigir al inicio de sesión
        } else {
            const responseBody = await response.json();
            showFeedback(responseBody.error || 'Error al actualizar contacto', false); // Mostrar mensaje de error
        }
    } catch (err) {
        console.error('Error al actualizar contacto:', err);
        showFeedback(`Error de conexión: ${err.message}`, false);
    }
});

// Mostrar/ocultar el campo de nueva categoría
document.getElementById('categoria')?.addEventListener('change', function () {
    const nuevaCategoriaInput = document.getElementById('nuevaCategoria');
    if (this.value === 'Otra') {
        nuevaCategoriaInput.style.display = 'block';
    } else {
        nuevaCategoriaInput.style.display = 'none';
        nuevaCategoriaInput.value = ''; // Limpiar el campo
    }
});

// Llamar a loadContacts() al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si estamos en una página que requiere cargar contactos
    const tableBody = document.querySelector('#contactsTableBody');
    if (tableBody) {
        console.log('Elemento #contactsTableBody encontrado. Cargando contactos...');
        loadContacts(); // Cargar todos los contactos al inicio solo si existe la tabla
    } else {
        console.log('No se encontró el elemento #contactsTableBody. Esta página no requiere cargar contactos.');
    }
});