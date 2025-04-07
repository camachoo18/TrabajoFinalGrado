document.addEventListener('DOMContentLoaded', () => {
    const monitorForm = document.getElementById('monitorForm');
    const stopMonitoringButton = document.getElementById('stopMonitoringButton');
    const logList = document.getElementById('logList');

    // Función para agregar un mensaje al log
    const addLogMessage = (message) => {
        const logItem = document.createElement('li');
        logItem.textContent = message;
        logList.appendChild(logItem);
        logList.scrollTop = logList.scrollHeight; // Desplazar hacia el final del log
    };

    // Conectar al servidor para recibir mensajes en tiempo real
    let eventSource = null;
    if (!eventSource) {
        eventSource = new EventSource('/monitor-stream');
        eventSource.onmessage = (event) => {
            addLogMessage(event.data); // Mostrar los mensajes en el log
        };

        eventSource.onerror = () => {
            console.error('Error en la conexión SSE.');
            eventSource.close(); // Cerrar la conexión en caso de error
            eventSource = null;
        };
    }

    monitorForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const url = document.getElementById('url').value;
        const interval = parseInt(document.getElementById('interval').value, 10) * 1000; // Convertir a milisegundos

        try {
            const response = await fetch('/start-monitoring', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ urls: [url], interval })
            });

            if (response.ok) {
                addLogMessage(`Monitoreo iniciado para ${url} cada ${interval / 1000} segundos.`);
            } else {
                const error = await response.json();
                addLogMessage(`Error al iniciar el monitoreo: ${error.error}`);
            }
        } catch (err) {
            addLogMessage(`Error de conexión: ${err.message}`);
        }
    });

    stopMonitoringButton.addEventListener('click', async () => {
        const url = document.getElementById('url').value;

        try {
            const response = await fetch('/stop-monitoring', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ urls: [url] })
            });

            if (response.ok) {
                addLogMessage(`Monitoreo detenido para ${url}.`);
            } else {
                const error = await response.json();
                addLogMessage(`Error al detener el monitoreo: ${error.error}`);
            }
        } catch (err) {
            addLogMessage(`Error de conexión: ${err.message}`);
        }
    });
});