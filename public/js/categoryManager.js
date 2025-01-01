// categoryManager.js

// Cargar categorías
async function loadCategories() {
    try {
        const response = await fetch('/categories');
        const categories = await response.json();

        const categorySelect = document.getElementById('categorySelect');
        categorySelect.innerHTML = '<option value="">Seleccionar categoría</option>';

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.nombre;
            option.textContent = category.nombre;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        showError('Error al cargar las categorías.');
    }
}

// Agregar nueva categoría
async function addCategory(categoryName) {
    try {
        const response = await fetch('/categories/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ categoria: categoryName }),
        });
        if (response.ok) {
            showSuccess('Categoría agregada.');
            loadCategories();
        } else {
            const error = await response.json();
            showError(error.error || 'No se pudo agregar la categoría.');
        }
    } catch (error) {
        showError('Error al conectar con el servidor.');
    }
}

// Cargar contactos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    // Si estamos en add-contact.html (presencia del elemento 'categoria')
    if (document.getElementById('categoria')) {
        
        loadCategories('categoria'); // Carga las categorías para el formulario de agregar
    }
});