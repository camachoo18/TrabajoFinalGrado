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

    // Updated feedback element targeting
    const feedbackCard = document.getElementById('login-feedback-card');
    const feedbackTextElement = document.getElementById('login-feedback-text');
    
    if (feedbackCard && feedbackTextElement) {
        feedbackTextElement.textContent = 'Iniciando sesión...'; // Set initial message
        feedbackCard.style.display = 'flex'; // Make it part of the layout
        // Force a reflow to ensure the transition takes place
        void feedbackCard.offsetWidth;
        // Trigger animation by adding .active class
        feedbackCard.classList.add('active');
    } else {
        console.error('Login feedback elements not found!');
        return; // Stop if elements are missing
    }

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const error = await response.json();
            if (feedbackTextElement) feedbackTextElement.textContent = error.error || 'Error en el login';
            throw new Error(error.error || 'Error en el login'); // Throw after setting message
        }

        if (feedbackTextElement) feedbackTextElement.textContent = 'Inicio de sesión exitoso. Redirigiendo...';
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 2000);
    } catch (error) {
        console.error('Error en el login:', error);
        // The error message is already set if it came from !response.ok
        // If it's another type of error, set a generic one:
        if (feedbackTextElement && feedbackTextElement.textContent === 'Iniciando sesión...') {
             feedbackTextElement.textContent = 'Error al iniciar sesión. Inténtalo nuevamente.';
        }
        // Animate out on error
        if (feedbackCard) {
            feedbackCard.classList.remove('active'); // Animate out
            setTimeout(() => {
                feedbackCard.style.display = 'none'; // Hide after animation
            }, 300); // Match transition duration (0.3s)
        }
    }
}

// Función para manejar el registro
async function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    const feedbackCard = document.getElementById('register-feedback-card');
    const feedbackTextElement = document.getElementById('register-feedback-text');

    if (feedbackCard && feedbackTextElement) {
        feedbackTextElement.textContent = 'Registrando usuario...';
        feedbackCard.style.display = 'flex'; // Make it visible and part of layout
        void feedbackCard.offsetWidth; // Force reflow for animation
        feedbackCard.classList.add('active');
    } else {
        console.error('Register feedback elements not found!');
        // Fallback or simple alert if main feedback UI is not present
        alert('Procesando registro...'); 
        return; // Stop if critical elements are missing
    }

    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Error desconocido durante el registro.' }));
            if (feedbackTextElement) feedbackTextElement.textContent = error.error || 'Error en el registro.';
            // Keep the card visible to show the error
            // No automatic redirection or hiding on server-side error, user might need to see the message
            // Consider adding a close button or timeout for error messages if desired
            return; // Stop execution if registration failed
        }

        // Registro exitoso
        if (feedbackTextElement) feedbackTextElement.textContent = 'Usuario registrado correctamente. Redirigiendo...';
        
        setTimeout(() => {
            window.location.href = '/html/login.html'; // Redirigir a la página de login
        }, 2500); // Wait 2.5 seconds before redirecting

    } catch (error) {
        console.error('Error en el registro:', error);
        if (feedbackTextElement) {
            feedbackTextElement.textContent = 'Error de conexión o al procesar el registro. Inténtalo nuevamente.';
        }
        // On network or other unexpected errors, ensure the card is visible to show the message.
        // If it was already active, it remains. If not (e.g. error before fetch), this ensures it's shown.
        if (feedbackCard && !feedbackCard.classList.contains('active')) {
            feedbackCard.style.display = 'flex';
            void feedbackCard.offsetWidth;
            feedbackCard.classList.add('active');
        }
        // Do not automatically hide the card on error, so the user can read it.
    }
}

// Función para manejar el logout
async function handleLogout() {
    try {
        //console.log('Enviando solicitud de logout al servidor...');
        const response = await fetch('/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
       

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
            // Adjusted redirection to login.html as per new registration flow
            window.location.href = '/html/login.html'; 
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