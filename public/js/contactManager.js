document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#contactList tbody')) {
        loadContacts();
        loadCategories(); // Cargar categorías al iniciar la página
    }
});

// Función para mostrar feedback
function showFeedback(message, success = true) {
    // Crear el contenedor de feedback dinámicamente
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.className = success ? 'feedback success' : 'feedback error';
    document.body.appendChild(feedback);

    // Eliminar el feedback después de 3 segundos
    setTimeout(() => feedback.remove(), 3000);
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
            editForm.style.display = 'block';

            // Calcular la posición del formulario y desplazar la página
            const formPosition = editForm.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
                top: formPosition - 20, // Ajusta el desplazamiento para dejar un margen
                behavior: 'smooth' // Desplazamiento suave
            });

            // Guardar los cambios
            document.querySelector('#saveEditButton').onclick = () => {
                saveEdits(contactId);
            };
        })
        .catch(error => {
            console.error('Error al obtener el contacto:', error);
        });
}

function validateContact(contact) {
    // Validar que el nombre no esté vacío
    if (!contact.nombre.trim()) return 'El nombre no puede estar vacío.';

    // Validar que el nombre no contenga etiquetas HTML o JavaScript
    const scriptRegex = /<script[\s\S]*?>[\s\S]*?<\/script>/gi; // Detecta etiquetas <script>
    const htmlRegex = /<\/?[a-z][\s\S]*>/i; // Detecta cualquier etiqueta HTML
    if (scriptRegex.test(contact.nombre) || htmlRegex.test(contact.nombre)) {
        return 'El nombre no puede contener etiquetas HTML o código malicioso.';
    }

    // Validar que el teléfono tenga 9 dígitos
    if (!/^\d{9}$/.test(contact.telefono)) return 'El teléfono debe tener 9 dígitos.';

    // Validar que el correo tenga un formato válido
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) return 'El correo electrónico no es válido.';

    // Validar que la categoría no esté vacía
    if (!contact.categoria.trim()) return 'Debe seleccionar una categoría.';

    return null; // Devuelve null si todo está bien
}

async function saveEdits(contactId) {
    const updatedContact = {
        nombre: document.querySelector('#editNombre').value,
        telefono: document.querySelector('#editTelefono').value,
        email: document.querySelector('#editEmail').value,
        notas: document.querySelector('#editNotas').value,
        categoria: document.querySelector('#editCategoria').value,
    };

    const validationError = validateContact(updatedContact);
    if (validationError) {
        showFeedback(validationError, false);
        return; // Detener el flujo si hay un error de validación
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`/contacts/edit/${contactId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedContact),
    });

    if (response.ok) {
        showFeedback('Contacto actualizado correctamente');
        loadContacts(); // Recargar la lista de contactos
    } else {
        showFeedback('Error al actualizar el contacto', false);
    }
}
document.getElementById('importGoogleContacts')?.addEventListener('click', async () => {
    try {
        const response = await fetch('/import-google-contacts', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        if (response.ok) {
            showFeedback('Contactos importados correctamente');
            loadContacts(); // Recargar la lista de contactos
        } else {
            //showFeedback('Error al importar contactos', false);
        }
    } catch (err) {
        showFeedback(`Error de conexión: ${err.message}`, false);
    }
});

// Verificar si un teléfono ya está registrado
async function isDuplicatePhone(phone) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/contacts', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const contacts = await response.json();
            return contacts.some(contact => contact.telefono.trim() === phone.trim());
        }
    } catch (err) {
        showFeedback(`Error de conexión: ${err.message}`, false);
    }
    return false;
}

// Función para cargar contactos
async function loadContacts() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/contacts', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const contacts = await response.json();
            renderContacts(contacts); // Renderizar los contactos en la tabla
        } else {
            showFeedback('Error al cargar contactos', false);
        }
    } catch (err) {
        showFeedback(`Error de conexión: ${err.message}`, false);
    }
}

// Función para renderizar contactos
function renderContacts(contacts) {
    const tableBody = document.querySelector('#contactsTableBody');
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

// Función para agregar un contacto
document.getElementById('contactForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obtener valores del formulario
    const nombre = document.getElementById('nombre').value.trim();
    let telefono = document.getElementById('telefono').value.trim();
    const email = document.getElementById('email').value.trim();
    const notas = document.getElementById('notas').value.trim();
    const categoria = document.getElementById('categoria').value;
    let nuevaCategoria = document.getElementById('nuevaCategoria')?.value.trim(); // Puede ser opcional

    // Limpiar el número de teléfono de caracteres no numéricos
    telefono = telefono.replace(/\D/g, '');

    // Verificar duplicados por teléfono
    if (await isDuplicatePhone(telefono)) {
        showFeedback('El número de teléfono ya está registrado.', false);
        return;
    }

    // Si el usuario selecciona "Otra", usar la nueva categoría
    const categoriaFinal = (categoria === 'Otra' && nuevaCategoria) ? nuevaCategoria : categoria;

    // Crear el contacto
    const contact = { nombre, telefono, email, notas, categoria: categoriaFinal };

    // Enviar el contacto al backend
    const token = localStorage.getItem('token');
    const response = await fetch('/add', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(contact),
    });

    // Manejar respuesta
    if (response.ok) {
        const responseBody = await response.json();
        loadContacts(); // Recargar lista de contactos
        showFeedback(`Contacto "${contact.nombre}" añadido correctamente`);

        // Si se agregó una nueva categoría, recargar las categorías
        if (categoria === 'Otra' && nuevaCategoria) {
            loadCategories();
        }
    } else {
        const responseBody = await response.json();
        console.error('Error al agregar contacto:', responseBody);
        showFeedback(responseBody.error || 'Error al agregar contacto', false);
    }
});

// Editar un contacto (mostrar datos en el formulario)
function toggleEditMode(row, contactId) {
    console.log('toggleEditMode llamado para el contacto con ID:', contactId); // Depuración
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

            // Establecer el ID del contacto en el formulario de edición
            const editForm = document.querySelector('#editForm');
            editForm.dataset.id = contactId; // Guardar el ID en el atributo dataset

            // Mostrar el formulario de edición
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

// Función para guardar los cambios en el contacto despues de editar
document.getElementById('editForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('editForm').dataset.id; // Obtener el ID del contacto
    if (!id) {
        showFeedback('Error: No se pudo identificar el contacto a editar.', false);
        return;
    }

    const nombre = document.getElementById('editNombre').value.trim();
    const telefono = document.getElementById('editTelefono').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const notas = document.getElementById('editNotas').value.trim();
    const categoria = document.getElementById('editCategoria').value;

    const contact = { nombre, telefono, email, notas, categoria };

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/contacts/edit/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(contact),
        });

        if (response.ok) {
            showFeedback('Contacto actualizado correctamente');
            loadContacts(); // Recargar la lista de contactos
            document.getElementById('editForm').style.display = 'none'; // Ocultar el formulario de edición
        } else {
            const error = await response.json();
            showFeedback(error.error || 'Error al actualizar contacto', false);
        }
    } catch (err) {
        showFeedback(`Error de conexión: ${err.message}`, false);
    }
});

// Función para filtrar contactos por categoría
async function filterContactsByCategory(categoria) {
    try {
        const token = localStorage.getItem('token');
        let url = '/contacts/filter';
        if (categoria && categoria !== 'Todas') {
            url += `?categoria=${encodeURIComponent(categoria)}`;
        }
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const contacts = await response.json();
            renderContacts(contacts);
        } else {
            showFeedback('Error al cargar contactos filtrados por categoría', false);
        }
    } catch (err) {
        showFeedback(`Error de conexión: ${err.message}`, false);
    }
}
// Función para eliminar un contacto
async function deleteContact(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`/contacts/delete/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
        const selectedCategory = document.getElementById('filtroCategoria').value;
        if (selectedCategory && selectedCategory !== 'Todas') {
            filterContactsByCategory(selectedCategory); // Volver a aplicar el filtro
        } else {
            loadContacts(); // Recargar todos los contactos si no hay filtro
        }
        showFeedback('Contacto eliminado correctamente');
    } else {
        showFeedback('Error al eliminar contacto', false);
    }
}
// Filtrar por categoría
document.getElementById('filtroCategoria')?.addEventListener('change', (e) => {
    const categoria = e.target.value;
    filterContactsByCategory(categoria);
});