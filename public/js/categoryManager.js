// Función para mostrar feedback
function showFeedback(message, success = true) {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.className = success ? 'feedback success' : 'feedback error';
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 3000); // Eliminar feedback después de 3 segundos
}

async function loadCategories() {
    try {
        const response = await fetch('/categories', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar categorías');
        }
        
        const categories = await response.json();
        loadCategories(categories);
    } catch (error) {
        console.error('Error:', error);
        showFeedback('Error al cargar categorías', false);
    }
}

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
        
        await loadCategories();
        showFeedback('Categoría agregada exitosamente');
    } catch (error) {
        console.error('Error:', error);
        showFeedback('Error al agregar categoría', false);
    }
}

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
        
        await loadCategories();
        showFeedback('Categoría actualizada exitosamente');
    } catch (error) {
        console.error('Error:', error);
        showFeedback('Error al actualizar categoría', false);
    }
}

async function deleteCategory(id) {
    try {
        const response = await fetch(`/categories/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar categoría');
        }
        
        await loadCategories();
        showFeedback('Categoría eliminada exitosamente');
    } catch (error) {
        console.error('Error:', error);
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