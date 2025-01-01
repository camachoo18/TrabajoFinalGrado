// Categorías estáticas
const categories = ['Amigos', 'Familia', 'Trabajo', 'Otros'];  // Añade aquí todas las categorías que necesites

// Cargar categorías
function loadCategories() {
    const categorySelect = document.getElementById('categorySelect');
    categorySelect.innerHTML = '<option value="">Seleccionar categoría</option>';

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// Agregar nueva categoría
function addCategory(categoryName) {
    // Verificar si la categoría ya existe
    if (categories.includes(categoryName)) {
        showError('La categoría ya existe.');
    } else {
        categories.push(categoryName);
        showSuccess('Categoría agregada.');
        loadCategories();  // Recarga las categorías después de agregar una nueva
    }
}

// Cargar categorías al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    // Si estamos en add-contact.html (presencia del elemento 'categoria')
    if (document.getElementById('categorySelect')) {
        loadCategories(); // Carga las categorías para el formulario de agregar
    }
});
