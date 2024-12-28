// Función para mostrar feedback
function showFeedback(message, success = true) {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.className = success ? 'feedback success' : 'feedback error';
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 3000); // Eliminar feedback después de 3 segundos
}

// Cargar contactos
async function loadContacts() {
    try {
        const response = await fetch('/contacts');
        if (response.ok) {
            const contacts = await response.json();

            // Verificar si el elemento de la tabla existe antes de intentar modificarlo
            const tableBody = document.querySelector('#contactList tbody');
            if (!tableBody) {
                console.error('Elemento de la tabla no encontrado');
                return; // Salir de la función si la tabla no está presente
            }

            tableBody.innerHTML = ''; // Limpia el contenido actual

            contacts.forEach(contact => {
                const row = document.createElement('tr');
                row.dataset.id = contact.id; // Guardar el ID en la fila

                // Crear celdas con textContent
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

                // Crear celda para botones
                const actionsCell = document.createElement('td');

                // Botón de editar
                const editButton = document.createElement('button');
                editButton.textContent = 'Editar';
                editButton.className = 'edit';
                editButton.onclick = () => toggleEditMode(row, contact.id);
                actionsCell.appendChild(editButton);

                // Botón de eliminar
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

// Agregar un contacto
document.getElementById('contactForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    let telefono = document.getElementById('telefono').value;
    telefono = telefono.replace(/\D/g, '');  // Elimina todo lo que no sea un número
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const notas = document.getElementById('notas').value;

    // Verificar si el teléfono ya está registrado
    if (await isDuplicatePhone(telefono)) {
        showFeedback('El número de teléfono ya está registrado.', false); // Mostrar mensaje de error
        return; // Detener la ejecución del resto de la función
    }

    const contact = { nombre, telefono, email, notas };

    const response = await fetch('/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
    });

    if (response.ok) {
        loadContacts(); // Recarga la lista de contactos
        showFeedback(`Contacto "${contact.nombre}" añadido correctamente`);
    } else {
        const responseBody = await response.json();
        console.log('Error al agregar contacto:', responseBody);  // Log del error
        showFeedback(responseBody.error || 'Error al agregar contacto', false); // Mostrar mensaje de error
    }
});

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

// Cargar contactos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#contactList')) {
        loadContacts();
    }
});
