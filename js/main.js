// Arquivo principal para inicialização e funções comuns

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Verifica se há um usuário logado e atualiza o painel
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        updateUserPanel(loggedInUser);
    }
});

// Função compartilhada para atualizar o painel do usuário
function updateUserPanel(username) {
    document.getElementById('userPanel').innerHTML = `
        <span>Olá, ${username}</span>
        <button class="btn" id="logoutBtn">Sair</button>
    `;
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

// Função compartilhada para logout
function handleLogout() {
    localStorage.removeItem('loggedInUser');
    document.getElementById('userPanel').innerHTML = `
        <button class="btn" id="loginBtn">Login</button>
        <button class="btn" id="registerBtn">Registrar</button>
    `;
    // Reatribuir eventos aos novos botões
    document.getElementById('loginBtn').addEventListener('click', showLoginForm);
    document.getElementById('registerBtn').addEventListener('click', showRegisterForm);
}

// Funções compartilhadas para mostrar formulários
function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('loginForm').style.display = 'none';
}