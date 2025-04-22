// Función para verificar el estado de autenticación
async function checkAuth() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return false;
        }

        const response = await fetch('http://localhost:3000/auth/isAuthenticated', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                return false;
            }
            throw new Error('Error al verificar autenticación');
        }

        const data = await response.json();
        return data.authenticated;
    } catch (error) {
        console.error('Error al verificar autenticación:', error);
        localStorage.removeItem('token');
        return false;
    }
}

// Función para manejar el login
async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error en el login');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        window.location.href = '/index.html';
    } catch (error) {
        console.error('Error en el login:', error);
        alert(error.message);
    }
}

// Función para manejar el registro
async function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value

    try {
        const response = await fetch('http://localhost:3000/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error en el registro');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        window.location.href = '/index.html';
    } catch (error) {
        console.error('Error en el registro:', error);
        alert(error.message);
    }
}

// Función para manejar el logout
async function handleLogout() {
    try {
        const token = localStorage.getItem('token');
        if (token) {
            await fetch('http://localhost:3000/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        }
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Error en el logout:', error);
        localStorage.removeItem('token');
        window.location.href = '/login.html';
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
    if (window.location.pathname !== '/login.html' && window.location.pathname !== '/register.html') {
        checkAuth().then(authenticated => {
            if (!authenticated) {
                window.location.href = '/login.html';
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