// Función para mostrar feedback
function showFeedback(message, success = true) {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.className = success ? 'feedback success' : 'feedback error';
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 3000); // Eliminar feedback después de 3 segundos
}




// Función para cargar las categorías en los selects
function loadCategories() {
    // Obtener los selects de categoría
    const categorySelectFilter = document.getElementById('filtroCategoria');
    const categorySelectAddContact = document.getElementById('categoria');

    // Limpiar las opciones anteriores (si existiesen) en el filtro de categorías
    categorySelectFilter.innerHTML = '';  // Limpiar todas las opciones
    categorySelectAddContact.innerHTML = '';  // Limpiar select agregar contacto

    // Añadir la opción "Todos" al filtro
    const optionTodos = document.createElement('option');
    optionTodos.value = "Todos";
    optionTodos.textContent = "Todos";
    categorySelectFilter.appendChild(optionTodos);

    // Añadir las categorías estáticas en el filtro y en el formulario de agregar contacto
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelectFilter.appendChild(option);
        categorySelectAddContact.appendChild(option.cloneNode(true)); // Añadir al formulario de agregar contacto
    });
}





// Manejar el cambio de categoría (nueva categoría)
document.getElementById('categoria')?.addEventListener('change', function () {
    const nuevaCategoriaInput = document.getElementById('nuevaCategoria');
    if (this.value === 'Otra') {
        nuevaCategoriaInput.style.display = 'block';
    } else {
        nuevaCategoriaInput.style.display = 'none';
        nuevaCategoriaInput.value = ''; // Limpiar campo
    }
});

// Función para agregar una nueva categoría
async function addCategory(name) {
    try {
        const response = await fetch('/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: name }),
        });

        if (response.ok) {
            showFeedback(`Categoría "${name}" añadida correctamente`);
            loadCategories('categoria'); // Recargar categorías
        } else {
            showFeedback('Error al añadir categoría', false);
        }
    } catch (err) {
        showFeedback(`Error de conexión: ${err.message}`, false);
    }
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

    // Si el usuario selecciona "Otra", agregar nueva categoría
    if (categoria === 'Otra' && nuevaCategoria) {
        addCategory(nuevaCategoria);  // Agregar la categoría a la lista estática
        nuevaCategoria = nuevaCategoria; // Usar la nueva categoría
    } else {
        nuevaCategoria = categoria; // Usar la categoría seleccionada
    }

    // Crear el contacto
    const contact = { nombre, telefono, email, notas, categoria: nuevaCategoria };

    // Enviar el contacto al backend
    const response = await fetch('/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
    });

    // Manejar respuesta
    if (response.ok) {
        loadContacts(); // Recargar lista de contactos
        showFeedback(`Contacto "${contact.nombre}" añadido correctamente`);
    } else {
        const responseBody = await response.json();
        console.error('Error al agregar contacto:', responseBody);
        showFeedback(responseBody.error || 'Error al agregar contacto', false);
    }
});

function renderContacts(contacts) {
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

        const notasCell = document.createElement('td');
        notasCell.textContent = contact.notas;
        row.appendChild(notasCell);

        const categoriaCell = document.createElement('td'); // Nueva celda para categoría
        categoriaCell.textContent = contact.categoria || 'Sin Categoría'; // Mostrar 'Sin Categoría' si está vacío
        row.appendChild(categoriaCell);

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

async function loadContacts() {
    try {
        const response = await fetch('/contacts');
        if (response.ok) {
            const contacts = await response.json();
            
            
            renderContacts(contacts);
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
        } else {
            showFeedback('Error al cargar contactos', false);
        }
    } catch (err) {
        showFeedback(`Error de conexión: ${err.message}`, false);
    }
}

// Filtrar contactos por categoría
document.getElementById('filtroCategoria').addEventListener('change', async (event) => {
    const selectedCategory = event.target.value;
    try {
        const response = await fetch('/contacts');
        if (response.ok) {
            let contacts = await response.json();

            if (selectedCategory !== 'Todos') {
                contacts = contacts.filter(contact => contact.categoria === selectedCategory);
            }

            renderContacts(contacts); // Renderizar solo los contactos filtrados
        } else {
            showFeedback('Error al filtrar contactos', false);
        }
    } catch (err) {
        showFeedback(`Error de conexión: ${err.message}`, false);
    }
});

// Validación del correo en tiempo real
function validateEmailInput(input) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const value = input.value.trim();
    if (regex.test(value)) {
        input.setCustomValidity(""); // Si el correo es válido, se quita el mensaje de error
    } else {
        input.setCustomValidity("Por favor, ingresa un correo válido (ejemplo@dominio.com)");
    }
}

// Llamar a la función de validación cada vez que el usuario escriba
document.getElementById('editEmail')?.addEventListener('input', function () {
    validateEmailInput(this);
});

// Cambia vista edicion
function toggleEditMode(row, id) {
    const isEditing = row.classList.contains('editing');
    const cells = row.querySelectorAll('td');

    if (isEditing) {
        // Obtener los valores de los campos editados
        const updatedContact = {
            nombre: cells[0].querySelector('input').value.trim(),
            telefono: cells[1].querySelector('input').value.trim(),
            email: cells[2].querySelector('input').value.trim(),
            notas: cells[3].querySelector('input').value.trim(),
        };

        // Validar que los campos no estén vacíos
        if (!updatedContact.nombre || !updatedContact.telefono || !updatedContact.email) {
            showFeedback('Los campos de nombre, teléfono y correo son obligatorios.', false);
            return;  // No guardar si hay campos vacíos
        }

        // Validación del correo
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(updatedContact.email)) {
            showFeedback('El correo electrónico debe tener el formato correcto: ejemplo@dominio.com.', false);
            return;  // No guardar si el correo no es válido
        }

        saveContact(id, updatedContact, row);
    } else {
        // Cambiar a modo edición
        cells[0].innerHTML = `<input type="text" value="${cells[0].textContent}">`;
        cells[1].innerHTML = `<input type="text" value="${cells[1].textContent}" maxlength="9" oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0, 9);">`;
        cells[2].innerHTML = `<input type="email" value="${cells[2].textContent}" required>`;  // Asegúrate de mantener el tipo "email"
        cells[3].innerHTML = `<input type="text" value="${cells[3].textContent}">`;

        const editButton = row.querySelector('.edit');
        editButton.textContent = 'Guardar';
    }
    
    row.classList.toggle('editing');
}

// Guarda los datos editados en el backend
async function saveContact(id, updatedContact, row) {
    try {
        const response = await fetch(`/edit/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedContact),
        });

        if (response.ok) {
            const cells = row.querySelectorAll('td');
            // Volver al modo de solo lectura
            cells[0].textContent = updatedContact.nombre;
            cells[1].textContent = updatedContact.telefono;
            cells[2].textContent = updatedContact.email;
            cells[3].textContent = updatedContact.notas;

            row.querySelector('.edit').textContent = 'Editar';
            row.classList.remove('editing');
            showFeedback('Contacto actualizado correctamente');
        } else {
            const error = await response.json();
            showFeedback(error.message || 'Error al actualizar el contacto', false);
        }
    } catch (err) {
        showFeedback(`Error al guardar contacto: ${err.message}`, false);
    }
}

// Función para verificar si el teléfono ya está registrado
async function isDuplicatePhone(phone) {
    const response = await fetch('/contacts');
    if (response.ok) {
        const contacts = await response.json();
        return contacts.some(contact => contact.telefono.trim() === phone.trim()); // Asegúrate de que no haya espacios
    }
    return false;
}


// Eliminar un contacto
async function deleteContact(id) {
    const response = await fetch(`/delete/${id}`, { method: 'DELETE' });
    if (response.ok) {
        loadContacts();
        showFeedback('Contacto eliminado correctamente');
    } else {
        showFeedback('Error al eliminar contacto', false);
    }
}

// Editar un contacto (mostrar en el formulario)
async function editContact(id) {
    const response = await fetch(`/contacts/${id}`);
    if (response.ok) {
        const contact = await response.json();

        // Cargar los datos del contacto en el formulario de edición
        document.getElementById('editForm').dataset.id = contact.id;
        document.getElementById('editNombre').value = contact.nombre;
        document.getElementById('editTelefono').value = contact.telefono;
        document.getElementById('editEmail').value = contact.email;
        document.getElementById('editNotas').value = contact.notas;

        // Mostrar el formulario de edición y ocultar el de agregar
        document.getElementById('contactForm').style.display = 'none';
        document.getElementById('editForm').style.display = 'block';
    } else {
        showFeedback('Error al cargar datos del contacto', false);
    }
}

// Función para actualizar un contacto
document.getElementById('editForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('editForm').dataset.id;
    const nombre = document.getElementById('editNombre').value;
    const telefono = document.getElementById('editTelefono').value;
    const email = document.getElementById('editEmail').value;
    const notas = document.getElementById('editNotas').value;

    // Enviar la solicitud PUT al backend para actualizar el contacto
    const contact = { nombre, telefono, email, notas };
    const response = await fetch(`/edit/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
    });

    if (response.ok) {
        loadContacts(); // Recargar la lista de contactos
        showFeedback('Contacto actualizado correctamente'); // Mostrar mensaje de éxito
        document.getElementById('editForm').style.display = 'none'; // Ocultar el formulario de edición
        document.getElementById('contactForm').style.display = 'block'; // Mostrar el formulario de agregar
    } else {
        const responseBody = await response.json();
        showFeedback(responseBody.error || 'Error al actualizar contacto', false); // Mostrar mensaje de error
    }
});

// Buscar y filtrar contactos
document.getElementById('searchInput')?.addEventListener('input', async (e) => {
    const query = e.target.value; // Obtener el valor del campo de búsqueda
    try {
        const response = await fetch(`/contacts/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
            const contacts = await response.json();

            // Actualiza la tabla con los contactos filtrados
            const tableBody = document.querySelector('#contactList tbody');
            if (tableBody) {
                tableBody.innerHTML = ''; // Limpia el contenido actual

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
        } else {
            showFeedback('Error al buscar contactos', false);
        }
    } catch (err) {
        showFeedback(`Error de conexión: ${err.message}`, false);
    }
});





// Cargar contactos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    // Si estamos en add-contact.html (presencia del elemento 'categoria')
    if (document.getElementById('categoria')) {
        
        loadCategories('categoria'); // Carga las categorías para el formulario de agregar
    }

    // Si estamos en view-contact.html (presencia del elemento 'filtroCategoria' o 'contactList')
    if (document.getElementById('filtroCategoria') || document.querySelector('#contactList tbody')) {
        
        loadCategories('filtroCategoria'); // Carga las categorías para el filtro
        loadContacts(); // Carga los contactos en la tabla
    }
});


