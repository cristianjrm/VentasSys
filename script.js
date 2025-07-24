document.addEventListener('DOMContentLoaded', () => {

    // --- SECURITY GUARD ---
    // If user is not logged in, redirect to login page
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return; // Stop executing the rest of the script
    }

    // --- LICENSE CHECK ---
    const licenseExpiry = localStorage.getItem('licenseExpiry');
    if (!licenseExpiry || new Date() > new Date(parseInt(licenseExpiry))) {
        // If license is invalid or expired, log out and redirect
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('userRole');
        window.location.href = 'login.html';
        return;
    }

    let state = {};
    
    const defaultState = {
        inventory: [],
        sales: [],
        expenses: [],
        users: [
            { id: 1, username: 'admin', password: 'admin123', role: 'Administrador' }
        ],
        exchangeRate: 36.50,
        currentSale: { items: [], subtotal: 0, tax: 0, total: 0 },
        settings: {
            companyName: 'Mi Negocio',
            companyAddress: 'Calle Principal 123, Ciudad',
            companyPhone: '0412-345-6789',
            primaryCurrencySymbol: '$',
            secondaryCurrencySymbol: 'Bs.',
            taxEnabled: false,
            taxRate: 16
        }
    };

    const pageTitle = document.getElementById('page-title');
    const menuButton = document.getElementById('menu-button');
    const sidebar = document.getElementById('sidebar');
    const formModal = document.getElementById('form-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    
    const saveState = () => {
        try {
            localStorage.setItem('ventasSysState', JSON.stringify(state));
        } catch (error) {
            console.error("Error saving state to localStorage", error);
        }
    };

    const loadState = () => {
        try {
            const savedState = localStorage.getItem('ventasSysState');
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                state = {
                    ...defaultState,
                    ...parsedState,
                    settings: { ...defaultState.settings, ...(parsedState.settings || {}) },
                    users: (parsedState.users && parsedState.users.length > 0) ? parsedState.users : defaultState.users,
                    currentSale: JSON.parse(JSON.stringify(defaultState.currentSale))
                };
            } else {
                state = JSON.parse(JSON.stringify(defaultState));
            }
        } catch (error) {
            console.error("Could not load or parse state from localStorage. Reverting to default state.", error);
            state = JSON.parse(JSON.stringify(defaultState));
        }
    };
    
    const handleNavigation = () => {
        const hash = window.location.hash || '#dashboard';
        document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('bg-gray-900'));

        const activePage = document.querySelector(hash);
        const activeLink = document.querySelector(`a[href="${hash}"]`);

        if (activePage && activeLink) {
            activePage.classList.remove('hidden');
            pageTitle.textContent = activeLink.querySelector('span').textContent;
            activeLink.classList.add('bg-gray-900');
            
            const renderMap = {
                '#dashboard': renderDashboard,
                '#inventario': renderInventory,
                '#reportes': renderSalesReport,
                '#gastos': renderExpenses,
                '#precios': renderPriceList,
                '#tasa': renderTasa,
                '#ventas': renderVenta,
                '#configuraciones': renderConfiguraciones
            };
            if (renderMap[hash]) {
                renderMap[hash]();
            }

        } else {
            window.location.hash = '#dashboard';
        }
    };

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            window.location.hash = link.getAttribute('href');
            if (window.innerWidth < 640) {
                sidebar.classList.add('-translate-x-full');
            }
        });
    });

    menuButton.addEventListener('click', () => sidebar.classList.toggle('-translate-x-full'));
    
    const openModal = (title, contentHTML) => {
        modalTitle.textContent = title;
        modalContent.innerHTML = contentHTML;
        formModal.classList.remove('hidden');
    };

    const closeModal = () => {
        formModal.classList.add('hidden');
        modalContent.innerHTML = '';
    };

    modalCloseBtn.addEventListener('click', closeModal);
    formModal.addEventListener('click', (e) => (e.target === formModal) && closeModal());

    const formatCurrency = (amount, currencySymbol) => {
        const symbol = currencySymbol || state.settings.primaryCurrencySymbol;
        const formattedNumber = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
        return `${symbol} ${formattedNumber}`;
    };
    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const renderDashboard = () => {
        const today = new Date().toISOString().split('T')[0];
        const salesToday = state.sales.filter(s => s.date.startsWith(today));
        
        const totalSalesTodayPrimary = salesToday.reduce((sum, s) => sum + s.total, 0);
        const totalSalesTodaySecondary = salesToday.reduce((sum, s) => sum + (s.totalSecondary || 0), 0);

        const expensesToday = state.expenses.filter(e => e.date.startsWith(today));
        
        const totalExpensesTodayPrimary = expensesToday
            .filter(e => e.currency === state.settings.primaryCurrencySymbol)
            .reduce((sum, e) => sum + e.amount, 0);
            
        const totalExpensesTodaySecondary = expensesToday
            .filter(e => e.currency === state.settings.secondaryCurrencySymbol)
            .reduce((sum, e) => sum + e.amount, 0);

        const totalProducts = state.inventory.reduce((sum, p) => sum + p.quantity, 0);

        document.getElementById('ventas-hoy').textContent = formatCurrency(totalSalesTodayPrimary, state.settings.primaryCurrencySymbol);
        document.getElementById('ventas-hoy-bs').textContent = formatCurrency(totalSalesTodaySecondary, state.settings.secondaryCurrencySymbol);
        document.getElementById('gastos-hoy').textContent = formatCurrency(totalExpensesTodayPrimary, state.settings.primaryCurrencySymbol);
        document.getElementById('gastos-hoy-bs').textContent = formatCurrency(totalExpensesTodaySecondary, state.settings.secondaryCurrencySymbol);
        document.getElementById('productos-stock').textContent = totalProducts;
    };

    // --- El resto de las funciones (renderInventory, renderVenta, etc.) se mantienen aquí ---
    // ... (El código completo de las demás funciones va aquí) ...

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('userRole');
        window.location.href = 'login.html';
    };

    const applyPermissions = () => {
        const userRole = localStorage.getItem('userRole');
        if (userRole !== 'Administrador') {
            document.querySelectorAll('a[href="#inventario"], a[href="#reportes"], a[href="#gastos"], a[href="#precios"], a[href="#tasa"], a[href="#configuraciones"]').forEach(el => el.style.display = 'none');
        }
    };

    const init = () => {
        loadState();
        
        const username = localStorage.getItem('username');
        if (username) {
            document.getElementById('username-display').textContent = username;
        }

        document.getElementById('logout-btn').addEventListener('click', handleLogout);

        applyPermissions();
        lucide.createIcons();
        window.addEventListener('hashchange', handleNavigation);
        handleNavigation();
    };

    init();
});
