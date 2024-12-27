document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const telefono = document.getElementById('telefono').value;
    const email = document.getElementById('email').value;
    const notas = document.getElementById('notas').value;

    const contact = { nombre, telefono, email, notas };

    const response = await fetch('/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
    });

    if (response.ok) {
        loadContacts();
    }
});

document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('editForm').dataset.id;
    const nombre = document.getElementById('editNombre').value;
    const telefono = document.getElementById('editTelefono').value;
    const email = document.getElementById('editEmail').value;
    const notas = document.getElementById('editNotas').value;

    const contact = { nombre, telefono, email, notas };

    const response = await fetch(`/edit/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
    });

    if (response.ok) {
        loadContacts();
        document.getElementById('editForm').style.display = 'none';
        document.getElementById('contactForm').style.display = 'block';
    }
});

async function loadContacts() {
    const response = await fetch('/contacts');
    const contacts = await response.json();
    const tableBody = document.querySelector('#contactList tbody');
    tableBody.innerHTML = '';
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
}

async function editContact(id) {
    const response = await fetch(`/contacts/${id}`);
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
}

async function deleteContact(id) {
    const response = await fetch(`/delete/${id}`, { method: 'DELETE' });
    if (response.ok) {
        loadContacts();
    }
}
// Función para cargar contactos desde el backend
async function fetchContacts() {
    const response = await fetch('/contacts'); // Solicita los contactos al backend
    const contacts = await response.json();   // Convierte la respuesta a JSON
    const tableBody = document.querySelector('#contactList tbody'); // Selecciona la tabla

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
        tableBody.appendChild(row); // Añade la fila a la tabla
    });
}

// Llamar a fetchContacts al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    fetchContacts(); // Carga la lista de contactos al abrir la página
});
