document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginContainer = document.getElementById('login-container');
    const dashboardContainer = document.getElementById('dashboard-container');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');
    const dashboardTableBody = document.getElementById('dashboardTableBody');

    const API_BASE_URL = '/api';

    // Check if session exists
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    if (isAdminLoggedIn) {
        showDashboard();
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const correo = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ correo, password })
                });

                const result = await response.json();

                if (result.success) {
                    localStorage.setItem('isAdminLoggedIn', 'true');
                    localStorage.setItem('adminUser', JSON.stringify(result.user));
                    showDashboard();
                    loginError.style.display = 'none';
                } else {
                    loginError.style.display = 'block';
                    loginError.textContent = result.error || 'Credenciales incorrectas';
                }
            } catch (error) {
                console.error("Error en login:", error);
                loginError.style.display = 'block';
                loginError.textContent = 'Error de conexión con el servidor';
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('isAdminLoggedIn');
            localStorage.removeItem('adminUser');
            showLogin();
        });
    }

    function showDashboard() {
        if (loginContainer) loginContainer.style.display = 'none';
        if (dashboardContainer) dashboardContainer.style.display = 'block';
        loadReservas();
    }

    function showLogin() {
        if (loginContainer) loginContainer.style.display = 'block';
        if (dashboardContainer) dashboardContainer.style.display = 'none';
        if (loginForm) loginForm.reset();
    }

    async function loadReservas() {
        if (!dashboardTableBody) return;
        dashboardTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Cargando reservas...</td></tr>';
        
        try {
            const response = await fetch(`${API_BASE_URL}/admin/reservas`);
            const reservas = await response.json();
            
            dashboardTableBody.innerHTML = '';
            
            if (reservas.length === 0) {
                dashboardTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No hay reservas registradas</td></tr>';
                return;
            }

            reservas.forEach(reserva => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${reserva.nombre_cliente}</td>
                    <td><span class="badge-time">${reserva.fecha} ${reserva.hora}</span></td>
                    <td>${reserva.telefono}</td>
                    <td class="actions-cell">
                        ${reserva.estado === 'pendiente' ? `
                            <button class="btn-action btn-accept" onclick="updateStatus(${reserva.id}, 'aceptada')">Aceptar</button>
                            <button class="btn-action btn-reject" onclick="updateStatus(${reserva.id}, 'rechazada')">Rechazar</button>
                        ` : `<span style="text-transform:uppercase; font-weight:700; color: ${reserva.estado === 'aceptada' ? '#22c55e' : 'var(--primary)'}">${reserva.estado}</span>`}
                    </td>
                `;
                dashboardTableBody.appendChild(tr);
            });
        } catch (error) {
            console.error("Error cargando reservas:", error);
            dashboardTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--primary);">Error al cargar datos</td></tr>';
        }
    }

    // Definir globalmente para los botones generados dinámicamente
    window.updateStatus = async (id, nuevoEstado) => {
        if (nuevoEstado === 'rechazada' && !confirm('¿Estás seguro de rechazar esta reserva?')) return;
        alert('Funcionalidad de actualización de estado pendiente de endpoint en Worker.');
    };
});
