// viewContacts.js

// Cargar y mostrar todos los contactos en la tabla
async function loadContacts() {
    try {
        const response = await fetch('/contacts'); // Asegúrate de que este endpoint te devuelve los contactos
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
        showError('Error al cargar los contactos.');
    }
}

// Llamar la función para cargar los contactos cuando se cargue la página
document.addEventListener('DOMContentLoaded', loadContacts);

// Función para mostrar el mensaje de error
function showError(message) {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.className = 'feedback error';
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 3000);
}
