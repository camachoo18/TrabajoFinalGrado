document.getElementById('toggle-dark-mode').addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');
    const darkModeEnabled = document.body.classList.contains('dark-mode');
    
    // Guardar preferencia del usuario
    localStorage.setItem('darkMode', darkModeEnabled ? 'enabled' : 'disabled');
});

// Comprobar la preferencia del usuario al cargar la página
window.onload = () => {
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }
};
