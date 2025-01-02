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
