// Función para mostrar feedback
function showFeedback(message, success = true) {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.className = success ? 'feedback success' : 'feedback error';
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 3000); // Eliminar feedback después de 3 segundos
}

// Cargar categorías desde el servidor
async function loadCategories() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/categories', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const categories = await response.json();
            const categorySelect = document.getElementById('categoria');
            const filterSelect = document.getElementById('filtroCategoria');

            if (categorySelect) {
                categorySelect.innerHTML = '<option value="">Seleccionar categoría</option>';
            }
            if (filterSelect) {
                filterSelect.innerHTML = '<option value="">Todas las categorías</option>';
            }

            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                if (categorySelect) {
                    categorySelect.appendChild(option);
                }
                if (filterSelect) {
                    const filterOption = document.createElement('option');
                    filterOption.value = category;
                    filterOption.textContent = category;
                    filterSelect.appendChild(filterOption);
                }
            });

            // Añadir opción "Otra" al formulario de agregar contacto
            if (categorySelect) {
                const otherOption = document.createElement('option');
                otherOption.value = 'Otra';
                otherOption.textContent = 'Otra';
                categorySelect.appendChild(otherOption);
            }
        } else {
            showFeedback('Error al cargar categorías', false);
        }
    } catch (err) {
        showFeedback(`Error de conexión: ${err.message}`, false);
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