// Función para mostrar feedback
function showFeedback(message, success = true) {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.className = success ? 'feedback success' : 'feedback error';
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 3000); // Eliminar feedback después de 3 segundos
}

// Función para cargar categorías desde el servidor
async function loadCategories() {
    try {
        const response = await fetch('/categories', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error al cargar categorías');
        }

        const categories = await response.json();
        renderCategories(categories); // Renderizar las categorías en el DOM
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        showFeedback('Error al cargar categorías', false);
    }
}

// Función para renderizar categorías en el DOM
function renderCategories(categories) {
    const categoriaSelect = document.getElementById('categoria');
    const filtroCategoria = document.getElementById('filtroCategoria');

    if (categoriaSelect) {
        categoriaSelect.innerHTML = ''; // Limpiar opciones previas
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Seleccionar categoría';
        categoriaSelect.appendChild(defaultOption);
    }

    if (filtroCategoria) {
        filtroCategoria.innerHTML = ''; // Limpiar opciones previas
        const allOption = document.createElement('option');
        allOption.value = 'Todas';
        allOption.textContent = 'Todas';
        filtroCategoria.appendChild(allOption);
    }

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.nombre;
        option.textContent = category.nombre;

        if (categoriaSelect) categoriaSelect.appendChild(option);
        if (filtroCategoria) filtroCategoria.appendChild(option.cloneNode(true));
    });
}

// Función para agregar una nueva categoría
async function addCategory(categoryData) {
    try {
        const response = await fetch('/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(categoryData)
        });

        if (!response.ok) {
            throw new Error('Error al agregar categoría');
        }

        await loadCategories(); // Recargar categorías después de agregar
        showFeedback('Categoría agregada exitosamente');
    } catch (error) {
        console.error('Error al agregar categoría:', error);
        showFeedback('Error al agregar categoría', false);
    }
}

// Función para actualizar una categoría existente
async function updateCategory(id, categoryData) {
    try {
        const response = await fetch(`/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(categoryData)
        });

        if (!response.ok) {
            throw new Error('Error al actualizar categoría');
        }

        await loadCategories(); // Recargar categorías después de actualizar
        showFeedback('Categoría actualizada exitosamente');
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        showFeedback('Error al actualizar categoría', false);
    }
}

// Función para eliminar una categoría
async function deleteCategory(id) {
    try {
        const response = await fetch(`/categories/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error al eliminar categoría');
        }

        await loadCategories(); // Recargar categorías después de eliminar
        showFeedback('Categoría eliminada exitosamente');
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        showFeedback('Error al eliminar categoría', false);
    }
}

// Mostrar/ocultar el campo de nueva categoría
function handleCategoryChange() {
    const categoriaSelect = document.getElementById('categoria');
    const nuevaCategoriaInput = document.getElementById('nuevaCategoria');

    if (categoriaSelect) {
        categoriaSelect.addEventListener('change', function () {
            if (this.value === 'Otra') {
                nuevaCategoriaInput.style.display = 'block'; // Mostrar campo para nueva categoría
            } else {
                nuevaCategoriaInput.style.display = 'none'; // Ocultar campo para nueva categoría
                nuevaCategoriaInput.value = ''; // Limpiar el campo
            }
        });
    }
}

// Llamar a las funciones al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    loadCategories(); // Cargar categorías desde el servidor
    handleCategoryChange(); // Configurar el manejo del cambio de categoría
});