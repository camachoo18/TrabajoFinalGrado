document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            showVisualFeedback('Inicio de sesión exitoso');
        } else {
            showFeedback(data.error, false);
        }
    } catch (err) {
        showFeedback('Error al iniciar sesión', false);
    }
});

document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            showFeedback('Registro exitoso');
            setTimeout(() => {
                window.location.href = '/html/login.html'; // Redirigir a la página de inicio de sesión después de 2 segundos
            }, 2000);
        } else {
            showFeedback(data.error, false);
        }
    } catch (err) {
        showFeedback('Error al registrarse', false);
    }
});

// Redirigir a logout.html al hacer clic en el botón de cerrar sesión
document.getElementById('logoutButton')?.addEventListener('click', () => {
    window.location.href = '/html/logout.html';
});

// Verificar si el usuario está autenticado al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    const currentPath = window.location.pathname;
    const protectedPaths = ['/html/index.html', '/html/view-contacts.html', '/html/add-contact.html'];

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/checkAuth', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.authenticated) {
            // Si el usuario está autenticado y está en la página de inicio o login, redirigir a index.html
            if (currentPath === '/' || currentPath === '/html/login.html' || currentPath === '/html/register.html') {
                window.location.href = '/html/index.html';
            }
        } else {
            // Si el usuario no está autenticado y está en una página protegida, redirigir a la página de inicio
            if (protectedPaths.includes(currentPath)) {
                window.location.href = '/';
            }
        }
    } catch (err) {
        console.error('Error al verificar autenticación:', err);
        if (protectedPaths.includes(currentPath)) {
            window.location.href = '/';
        }
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