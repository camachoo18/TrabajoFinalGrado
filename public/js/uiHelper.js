// Función para renderizar los contactos en la tabla (ya no exportada)
function renderContacts(contacts) {
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
}
