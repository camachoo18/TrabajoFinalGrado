// contactManager.js

// Agregar un nuevo contacto
async function addContact(contactData) {
    try {
        const response = await fetch('/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contactData),
        });
        if (response.ok) {
            showSuccess('Contacto agregado.');
            loadContacts(); // Re-cargar los contactos después de agregar uno nuevo
        } else {
            const error = await response.json();
            showError(error.error || 'No se pudo agregar el contacto.');
        }
    } catch (error) {
        showError('Error al conectar con el servidor.');
    }
}

// Función para mostrar el mensaje de éxito
function showSuccess(message) {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.className = 'feedback success';
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 3000);
}

// Eliminar un contacto
async function deleteContact(contactId) {
    try {
        const response = await fetch(`/delete/${contactId}`, { method: 'DELETE' });
        if (response.ok) {
            showSuccess('Contacto eliminado.');
            loadContacts(); // Re-cargar los contactos después de eliminar uno
        } else {
            showError('No se pudo eliminar el contacto.');
        }
    } catch (error) {
        showError('Error al conectar con el servidor.');
    }
}

// Editar un contacto
async function editContact(contactId, updatedData) {
    try {
        const response = await fetch(`/edit/${contactId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });
        if (response.ok) {
            showSuccess('Contacto editado correctamente.');
            loadContacts(); // Re-cargar los contactos después de editar uno
        } else {
            const error = await response.json();
            showError(error.error || 'No se pudo editar el contacto.');
        }
    } catch (error) {
        showError('Error al conectar con el servidor.');
    }
}
