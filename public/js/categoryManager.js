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
        const token = localStorage.getItem('token');
        const response = await fetch('/categories', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const categories = await response.json();
            //console.log('Categorías recibidas:', categories); // Depuración
            const categorySelect = document.getElementById('categoria');
            const filterSelect = document.getElementById('filtroCategoria');

            // Limpiar las opciones existentes
            if (categorySelect) {
                categorySelect.innerHTML = '<option value="">Seleccionar categoría</option>';
            }
            if (filterSelect) {
                filterSelect.innerHTML = '<option value="">Todas las categorías</option>';
            }

            // Agregar categorías dinámicas desde el servidor
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
        console.error('Error al cargar categorías:', err); // Depuración
        showFeedback(`Error de conexión: ${err.message}`, false);
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