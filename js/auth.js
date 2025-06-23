// Sistema de Autenticação com localStorage

// Verifica se já existe um usuário logado ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupAuthForms();
});

// Verifica o status de autenticação
function checkAuthStatus() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    const userPanel = document.getElementById('userPanel');
    
    if (loggedInUser && userPanel) {
        userPanel.innerHTML = `
            <span>Olá, ${loggedInUser}</span>
            <button class="btn btn-outline" id="logoutBtn">Sair</button>
        `;
        document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    }
}

// Configura os formulários de autenticação
function setupAuthForms() {
    // Formulário de Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    // Formulário de Registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegister();
        });
    }
}

// Função para lidar com o login
function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Validação básica
    if (!username || !password) {
        showAuthError('Por favor, preencha todos os campos.');
        return;
    }
    
    // Verifica as credenciais
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Login bem-sucedido
        localStorage.setItem('loggedInUser', user.username);
        
        // Redireciona para a página principal após 1 segundo
        showAuthSuccess('Login bem-sucedido! Redirecionando...');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        showAuthError('Usuário ou senha incorretos.');
    }
}

// Função para lidar com o registro
function handleRegister() {
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    // Validação básica
    if (!username || !email || !password || !confirmPassword) {
        showAuthError('Por favor, preencha todos os campos.');
        return;
    }
    
    if (password !== confirmPassword) {
        showAuthError('As senhas não coincidem.');
        return;
    }
    
    // Verifica se o usuário já existe
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.some(user => user.username === username || user.email === email);
    
    if (userExists) {
        showAuthError('Usuário ou email já cadastrado.');
        return;
    }
    
    // Adiciona o novo usuário
    users.push({ username, email, password });
    localStorage.setItem('users', JSON.stringify(users));
    
    // Registro bem-sucedido
    showAuthSuccess('Registro bem-sucedido! Redirecionando para login...');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

// Função para fazer logout
function handleLogout() {
    localStorage.removeItem('loggedInUser');
    window.location.reload();
}

// Mostra mensagem de erro
function showAuthError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'auth-error';
    errorElement.textContent = message;
    errorElement.style.color = 'var(--error)';
    errorElement.style.marginTop = '1rem';
    errorElement.style.textAlign = 'center';
    
    const forms = document.querySelectorAll('.auth-form');
    forms.forEach(form => {
        // Remove mensagens anteriores
        const oldError = form.querySelector('.auth-error');
        if (oldError) oldError.remove();
        
        form.appendChild(errorElement.cloneNode(true));
    });
}

// Mostra mensagem de sucesso
function showAuthSuccess(message) {
    const successElement = document.createElement('div');
    successElement.className = 'auth-success';
    successElement.textContent = message;
    successElement.style.color = 'var(--primary)';
    successElement.style.marginTop = '1rem';
    successElement.style.textAlign = 'center';
    
    const forms = document.querySelectorAll('.auth-form');
    forms.forEach(form => {
        // Remove mensagens anteriores
        const oldMessage = form.querySelector('.auth-error, .auth-success');
        if (oldMessage) oldMessage.remove();
        
        form.appendChild(successElement.cloneNode(true));
    });
}