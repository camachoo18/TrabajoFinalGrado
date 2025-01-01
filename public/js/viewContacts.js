// Función para mostrar los contactos en la tabla
async function renderContacts() {
    try {
        const response = await fetch('/contacts');
        if (!response.ok) {
            throw new Error('Error al obtener los contactos');
        }
        const contacts = await response.json();

        const tableBody = document.getElementById('contactsTableBody');
        tableBody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos contactos

        contacts.forEach(contact => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${contact.nombre}</td>
                <td>${contact.telefono}</td>
                <td>${contact.email}</td>
                <td>${contact.categoria}</td>
                <td>
                    <button class="edit-contact" data-id="${contact.id}">Editar</button>
                    <button class="delete-contact" data-id="${contact.id}">Eliminar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        showFeedback('Error al cargar los contactos.', false); // Mensaje de error
    }
}

// Función para mostrar feedback (éxito o error)
function showFeedback(message, success = true) {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.className = success ? 'feedback success' : 'feedback error';
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 3000); // Eliminar feedback después de 3 segundos
}

// Llamar la función para cargar los contactos cuando se cargue la página
document.addEventListener('DOMContentLoaded', renderContacts);
