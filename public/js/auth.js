// Función para verificar el estado de autenticación
async function checkAuth() {
    try {
        const response = await fetch('/auth/isAuthenticated', {
            credentials: 'include' // Incluir cookies en la solicitud
        });

        if (!response.ok) {
            return false; // Usuario no autenticado
        }

        const data = await response.json();
        return data.authenticated; // Retorna true si el usuario está autenticado
    } catch (error) {
        console.error('Error al verificar autenticación:', error);
        return false;
    }
}

// Función para manejar el login
async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    // Mostrar la animación de feedback
    const feedbackContainer = document.getElementById('login-feedback');
    const feedbackMessage = document.getElementById('login-feedback-message');
    feedbackContainer.style.display = 'block';
    feedbackMessage.textContent = 'Iniciando sesión...';

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error en el login');
        }

        // Redirigir al usuario a la página principal después del inicio de sesión
        feedbackMessage.textContent = 'Inicio de sesión exitoso. Redirigiendo...';
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 2000); // Esperar 2 segundos antes de redirigir
    } catch (error) {
        console.error('Error en el login:', error);
        feedbackMessage.textContent = 'Error al iniciar sesión. Inténtalo nuevamente.';
        setTimeout(() => {
            feedbackContainer.style.display = 'none'; // Ocultar el feedback después de 2 segundos
        }, 2000);
    }
}

// Función para manejar el registro
async function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    // Mostrar la animación de feedback
    const feedbackContainer = document.createElement('div');
    feedbackContainer.className = 'feedback-container';

    const feedbackMessage = document.createElement('div');
    feedbackMessage.className = 'feedback-message';
    feedbackMessage.textContent = 'Registrando usuario...';

    const spinner = document.createElement('div');
    spinner.className = 'spinner';

    feedbackContainer.appendChild(feedbackMessage);
    feedbackContainer.appendChild(spinner);
    document.body.appendChild(feedbackContainer);

    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error en el registro');
        }

        // Actualizar el mensaje de feedback
        feedbackMessage.textContent = 'Registro exitoso. Redirigiendo...';

        // Redirigir al usuario a la página de login después de 2 segundos
        setTimeout(() => {
            feedbackContainer.remove();
            window.location.href = '/html/login.html';
        }, 2000);
    } catch (error) {
        console.error('Error en el registro:', error);

        // Mostrar mensaje de error en el feedback
        feedbackMessage.textContent = 'Error al registrarse. Inténtalo nuevamente.';
        setTimeout(() => {
            feedbackContainer.remove();
        }, 2000);
    }
}

// Función para manejar el logout
async function handleLogout() {
    try {
        console.log('Enviando solicitud de logout al servidor...');
        const response = await fetch('/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        console.log('Respuesta del servidor:', response); // Depuración

        if (!response.ok) {
            throw new Error('Error al cerrar sesión');
        }

        window.location.href = '/html/home.html';
        window.location.reload(); // Recargar la página para asegurarse de que se borren los datos del usuario
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        showFeedback('Error al cerrar sesión', false);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const logoutButton = document.getElementById('logoutButton');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    // Verificar autenticación al cargar la página
    if (window.location.pathname === '/html/index.html') {
        checkAuth().then(authenticated => {
            if (!authenticated) {
                window.location.href = '/html/home.html'; // Redirigir a home.html si no está autenticado
            }
        });
    }
});

// Función para mostrar feedback
function showFeedback(message, success = true) {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.className = success ? 'feedback success' : 'feedback error';
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 3000); // Eliminar feedback después de 3 segundos
}

// Función para mostrar feedback visual con animación
function showVisualFeedback(message, success = true) {
    const feedbackContainer = document.createElement('div');
    feedbackContainer.className = 'feedback-container';

    const feedbackMessage = document.createElement('div');
    feedbackMessage.className = 'feedback-message';
    feedbackMessage.textContent = message;

    const spinner = document.createElement('div');
    spinner.className = 'spinner';

    feedbackContainer.appendChild(feedbackMessage);
    feedbackContainer.appendChild(spinner);
    document.body.appendChild(feedbackContainer);

    setTimeout(() => {
        feedbackContainer.remove();
        if (success) {
            window.location.href = '/html/index.html'; // Redirigir a la página principal después de 2 segundos
        }
    }, 2000); // 2 segundos de espera para mostrar el feedback
}

async function fetchApiKey() {
    try {
        const response = await fetch('/auth/apikey', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error al obtener la APIKEY');
        }

        const data = await response.json();
        alert(`Tu APIKEY es: ${data.apiKey}`);
    } catch (error) {
        console.error('Error al obtener la APIKEY:', error);
    }
}

async function regenerateApiKey() {
    try {
        const response = await fetch('/auth/regenerate-apikey', {
            method: 'POST',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error al regenerar la APIKEY');
        }

        const data = await response.json();
        alert(`APIKEY regenerada correctamente. Tu nueva APIKEY: ${data.apiKey}`);
    
    } catch (error) {
        console.error('Error al regenerar la APIKEY:', error);
        alert('Error al regenerar la APIKEY');
    }
}

// Estilos para el feedback visual
const style = document.createElement('style');
style.textContent = `
    .feedback-container {
        background-color: #fff;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        width: 300px;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1000;
    }

    .feedback-message {
        font-size: 18px;
        color: #555;
        margin-bottom: 20px;
    }

    .spinner {
        border: 4px solid #f3f3f3; /* Light grey */
        border-top: 4px solid #3498db; /* Blue */
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 20px auto;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);