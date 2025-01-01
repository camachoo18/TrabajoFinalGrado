// Función para mostrar feedback
function showFeedback(message, success = true) {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.className = success ? 'feedback success' : 'feedback error';
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 3000); // Eliminar feedback después de 3 segundos
}
