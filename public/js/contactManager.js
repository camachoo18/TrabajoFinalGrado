// Función para mostrar feedback
function showFeedback(message, success = true) {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.className = success ? 'feedback success' : 'feedback error';
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 3000); // Eliminar feedback después de 3 segundos
}

// Función para alternar el modo de edición
function toggleEditMode(row, contactId) {
    // Realizar una solicitud al servidor para obtener los datos del contacto por su ID
    fetch(`/contacts/${contactId}`)
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
            document.querySelector('#editForm').style.display = 'block';

            // Guardar los cambios
            document.querySelector('#saveEditButton').onclick = () => {
                saveEdits(contactId);
            };
        })
        .catch(error => {
            console.error('Error al obtener el contacto:', error);
        });
}


async function saveEdits(contactId) {
    const updatedContact = {
        nombre: document.querySelector('#editNombre').value,
        telefono: document.querySelector('#editTelefono').value,
        email: document.querySelector('#editEmail').value,
        notas: document.querySelector('#editNotas').value,
        categoria: document.querySelector('#editCategoria').value,
    };

    const response = await fetch(`/contacts/edit/${contactId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedContact),
    });

    if (response.ok) {
        showFeedback('Contacto actualizado correctamente');
        renderContacts(); // Recargar la lista de contactos
    } else {
        showFeedback('Tienes que rellenar los datos correctamente', false);
    }
}


// Verificar si un teléfono ya está registrado
async function isDuplicatePhone(phone) {
    try {
        const response = await fetch('/contacts');
        if (response.ok) {
            const contacts = await response.json();
            return contacts.some(contact => contact.telefono.trim() === phone.trim());
        }
    } catch (err) {
        showFeedback(`Error de conexión1: ${err.message}`, false);
    }
    return false;
}



async function loadContacts() {
    console.log("Cargando contactos...");
    try {
        const response = await fetch('/contacts');
        if (response.ok) {
            const contacts = await response.json();
            console.log("Contactos cargados:", contacts);
            
            const tableBody = document.querySelector('#contactsTableBody');
            if (!tableBody) {
                console.error('Elemento de la tabla no encontrado');
                return;
            }

            tableBody.innerHTML = ''; // Limpiar el contenido actual

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
                categoriaCell.textContent = contact.categoria;
                row.appendChild(categoriaCell);

                const notasCell = document.createElement('td');
                notasCell.textContent = contact.notas;
                row.appendChild(notasCell);

                const actionsCell = document.createElement('td');

                const editButton = document.createElement('button');
                editButton.textContent = 'Editar';
                editButton.className = 'edit';
                editButton.dataset.id = contact.id; // Añadir el ID al botón
                editButton.addEventListener('click', () => {
                    console.log('Edit button clicked for ID:', contact.id);
                    toggleEditMode(row, contact.id);
                });
                actionsCell.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Eliminar';
                deleteButton.className = 'delete';
                deleteButton.dataset.id = contact.id; // Añadir el ID al botón
                deleteButton.addEventListener('click', () => {
                    console.log('Delete button clicked for ID:', contact.id);
                    deleteContact(contact.id);
                });
                actionsCell.appendChild(deleteButton);

                

                row.appendChild(actionsCell);
                tableBody.appendChild(row);
            });
        } else {
            showFeedback('Error al cargar contactos', false);
        }
    } catch (err) {
        console.error('Error al cargar los contactos:', err);
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


// Editar un contacto (mostrar datos en el formulario)
async function editContact(id) {
    try {
        const response = await fetch(`/contacts/${id}`);
        if (response.ok) {
            const contact = await response.json();
            document.getElementById('editForm').dataset.id = contact.id;
            document.getElementById('editNombre').value = contact.nombre;
            document.getElementById('editTelefono').value = contact.telefono;
            document.getElementById('editEmail').value = contact.email;
            document.getElementById('editNotas').value = contact.notas;

            //document.getElementById('contactForm').style.display = 'none';
            document.getElementById('editForm').style.display = 'block';
        } else {
            showFeedback('Error al cargar datos del contacto', false);
        }
    } catch (err) {
        showFeedback(`Error de conexión4: ${err.message}`, false);
    }
}

// Función para guardar los cambios en el contacto
document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('editForm').dataset.id;
    const nombre = document.getElementById('editNombre').value.trim();
    const telefono = document.getElementById('editTelefono').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const categoria = document.getElementById('editCategoria').value;
    const notas = document.getElementById('editNotas').value.trim();

    const contact = { nombre, telefono, email, categoria, notas };

    try {
        const response = await fetch(`/contacts/edit/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contact),
        });

        if (response.ok) {
            loadContacts(); // Recargar lista de contactos
            showFeedback('Contacto actualizado correctamente');
            document.getElementById('editForm').style.display = 'none'; // Ocultar formulario
        } else {
            const error = await response.json();
            showFeedback(error.error || 'Error al actualizar contacto', false);
        }
    } catch (err) {
        showFeedback(`Error de conexión: ${err.message}`, false);
    }
});




// Función para eliminar un contacto
function deleteContact(contactId) {
    fetch(`/contacts/delete/${contactId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error al eliminar el contacto:', data.error);
            return;
        }

        showFeedback('Contacto eliminado con éxito');
        loadContacts(); // Aquí pasas los contactos actualizados a loadContacts
    })
    .catch(error => {
        showFeedback('Error al eliminar el contacto:', error);
    });
}



document.addEventListener('DOMContentLoaded', loadContacts);

