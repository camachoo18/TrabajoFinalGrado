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
            alert('Inicio de sesión exitoso');
            window.location.href = '/html/index.html'; // Redirigir a la página de inicio
        } else {
            alert(data.error);
        }
    } catch (err) {
        alert('Error al iniciar sesión');
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
            alert('Registro exitoso');
            window.location.href = '/html/login.html'; // Redirigir a la página de inicio de sesión
        } else {
            alert(data.error);
        }
    } catch (err) {
        alert('Error al registrarse');
    }
});

document.getElementById('logoutButton')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    alert('Sesión cerrada');
    window.location.href = '/';
});