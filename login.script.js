document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const licenseStatus = document.getElementById('license-status');
    const licenseKeyInput = document.getElementById('license-key');
    const activateLicenseBtn = document.getElementById('activate-license-btn');

    // --- GENERADOR DE LICENCIAS (SOLO PARA EL DESARROLLADOR) ---
    // Para generar una clave para un cliente, abre la consola del navegador (F12)
    // y ejecuta: generateLicense('Nombre del Negocio', 'RIF del Negocio', 'Dirección del Negocio')
    // Copia la clave generada y envíasela a tu cliente.
    window.generateLicense = (companyName, rif, address, validityDays = 365) => {
        const licenseData = {
            companyName,
            rif,
            address,
            validityDays
        };
        const encodedData = btoa(JSON.stringify(licenseData));
        console.log("Clave de Licencia Generada:", encodedData);
        return encodedData;
    };

    const checkLicense = () => {
        const licenseExpiry = localStorage.getItem('licenseExpiry');
        if (!licenseExpiry) {
            licenseStatus.textContent = 'Sistema no activado. Por favor, ingrese una clave de licencia.';
            licenseStatus.className = 'text-center text-sm p-2 rounded-md bg-red-100 text-red-700';
            loginForm.querySelectorAll('input, button').forEach(el => el.disabled = true);
            return false;
        }

        const expiryDate = new Date(parseInt(licenseExpiry));
        const now = new Date();

        if (now > expiryDate) {
            licenseStatus.textContent = `Licencia expirada el ${expiryDate.toLocaleDateString()}.`;
            licenseStatus.className = 'text-center text-sm p-2 rounded-md bg-red-100 text-red-700';
            loginForm.querySelectorAll('input, button').forEach(el => el.disabled = true);
            return false;
        }

        const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
        licenseStatus.textContent = `Licencia válida. Quedan ${daysLeft} días.`;
        licenseStatus.className = 'text-center text-sm p-2 rounded-md bg-green-100 text-green-700';
        loginForm.querySelectorAll('input, button').forEach(el => el.disabled = false);
        return true;
    };

    const activateLicense = () => {
        const key = licenseKeyInput.value.trim();
        try {
            const decodedData = atob(key);
            const licenseInfo = JSON.parse(decodedData);

            if (licenseInfo.companyName && licenseInfo.rif && licenseInfo.address && licenseInfo.validityDays) {
                const now = new Date();
                const expiryDate = new Date(now.setDate(now.getDate() + licenseInfo.validityDays));
                localStorage.setItem('licenseExpiry', expiryDate.getTime());

                // Guardar datos de la empresa en el estado principal
                let state = JSON.parse(localStorage.getItem('ventasSysState')) || {};
                let settings = state.settings || {};
                settings.companyName = licenseInfo.companyName;
                settings.companyAddress = licenseInfo.address;
                // Puedes añadir un campo para el RIF si lo deseas en el estado principal
                state.settings = settings;
                localStorage.setItem('ventasSysState', JSON.stringify(state));

                alert('¡Licencia activada exitosamente!');
                checkLicense();
            } else {
                throw new Error("Clave inválida.");
            }
        } catch (error) {
            alert('Clave de licencia incorrecta o corrupta.');
        }
        licenseKeyInput.value = '';
    };

    activateLicenseBtn.addEventListener('click', activateLicense);

    // Redirigir si ya está logueado Y la licencia es válida
    if (localStorage.getItem('isLoggedIn') === 'true' && checkLicense()) {
        window.location.href = 'index.html';
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!checkLicense()) {
            errorMessage.textContent = 'Por favor, active su licencia para continuar.';
            errorMessage.classList.remove('hidden');
            return;
        }

        const username = e.target.username.value;
        const password = e.target.password.value;

        try {
            const response = await fetch('api/index.php?action=login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();

            if (data.success) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', data.user.username);
                localStorage.setItem('userRole', data.user.role);
                window.location.href = 'index.html#dashboard';
            } else {
                errorMessage.textContent = data.message || 'Usuario o contraseña incorrectos.';
                errorMessage.classList.remove('hidden');
            }
        } catch (error) {
            errorMessage.textContent = 'Error de conexión con el servidor.';
            errorMessage.classList.remove('hidden');
        }
    });

    // Chequeo inicial de la licencia al cargar la página
    checkLicense();
});
