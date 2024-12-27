// Función para mostrar feedback
function showFeedback(message, success = true) {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.className = success ? 'feedback success' : 'feedback error';

    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 3000); // Eliminar feedback después de 3 segundos
}

// Función para cargar contactos desde el backend
async function loadContacts() {

    try {
        const response = await fetch('/contacts');
        if (response.ok) {
            const contacts = await response.json();
            const tableBody = document.querySelector('#contactList tbody');
            tableBody.innerHTML = ''; // Limpia el contenido actual

            contacts.forEach(contact => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${contact.nombre}</td>
                    <td>${contact.telefono}</td>
                    <td>${contact.email}</td>
                    <td>${contact.notas}</td>
                    <td>
                        <button onclick="editContact(${contact.id})">Editar</button>
                        <button onclick="deleteContact(${contact.id})">Eliminar</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            showFeedback('Error al cargar contactos', false);
        }
    } catch (err) {
        showFeedback(`Error de conexión: ${err.message}`, false);
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
document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    let telefono = document.getElementById('telefono').value;
    telefono = telefono.replace(/\D/g, '');  // Elimina todo lo que no sea un número

    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const notas = document.getElementById('notas').value;

    // Verificar si el teléfono ya está registrado
    if (await isDuplicatePhone(telefono)) {
        alert('El número de teléfono ya está registrado.');
        return;
    }

    const contact = { nombre, telefono, email, notas };

    const response = await fetch('/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
    });

    if (response.ok) {
        loadContacts();
    } else {
        const responseBody = await response.json();
        console.log('Error al agregar contacto:', responseBody);  // Log del error
        alert(responseBody.error || 'Error al agregar contacto');
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
document.getElementById('editForm').addEventListener('submit', async (e) => {
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
    loadContacts();
});
