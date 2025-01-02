// Función para mostrar feedback
function showFeedback(message, success = true) {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.className = success ? 'feedback success' : 'feedback error';
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 3000); // Eliminar feedback después de 3 segundos
}

// Categorías estáticas
const categories = ['Amigos', 'Familia', 'Trabajo', 'Sin categoria', 'Otra'];  // Añade aquí todas las categorías que necesites

// Cargar categorías
function loadCategories() {
    const categorySelect = document.getElementById('categoria');
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
        showFeedback('La categoría ya existe.');
    } else {
        categories.push(categoryName);
        showFeedback('Categoría agregada.');
        loadCategories();  // Recarga las categorías después de agregar una nueva
    }
}

// Mostrar u ocultar el campo de nueva categoría
document.addEventListener('DOMContentLoaded', () => {
    const categoriaSelect = document.getElementById('categoria');
    const nuevaCategoriaInput = document.getElementById('nuevaCategoria');

    if (categoriaSelect) {
        // Cargar las categorías iniciales
        loadCategories();

        // Mostrar/ocultar el campo de nueva categoría cuando el usuario selecciona "Otra"
        categoriaSelect.addEventListener('change', function () {
            if (this.value === 'Otra') {
                nuevaCategoriaInput.style.display = 'block'; // Mostrar campo para nueva categoría
            } else {
                nuevaCategoriaInput.style.display = 'none'; // Ocultar campo para nueva categoría
            }
        });
    }
});
