// Dados dos VIPs atualizados para Create & Mekanism
const vipData = [
    {
        id: 'engineer',
        name: 'Tech Genesis',
        price: 'R$ 14,99',
        features: [
            'Acesso a máquinas básicas do Create',
            'Acesso a máquinas básicas do Mekanism',
            'Processamento de minérios 2x',
            'Tag [Tech Genesis] no chat'
        ],
        color: 'var(--create)'
    },
    {
        id: 'mechanic',
        name: 'Tech Master',
        price: 'R$ 19,99',
        features: [
            'Todas as vantagens do Tech Genesis',
            'Gerador de energia adicional',
            'Tag [Tech Master] no chat',
        ],
        color: 'var(--secondary)'
    },
    {
        id: 'industrialist',
        name: 'Tech God',
        price: 'R$ 29,99',
        features: [
            'Todas as vantagens anteriores',
            'Reator nuclear compacto',
            'Tag [Tech God] no chat',
            'Suporte prioritário',
            'Itens cosméticos exclusivos'
        ],
        color: 'var(--mekanism)'
    }
];

// Renderiza os cards de VIP
function renderVipCards() {
    const vipOptions = document.getElementById('vipOptions');
    
    vipData.forEach(vip => {
        const card = document.createElement('div');
        card.className = 'vip-card';
        
        card.innerHTML = `
            <div class="vip-card-header" style="background: ${vip.color}">
                <h3>${vip.name}</h3>
                <p>Pacote ${vip.name}</p>
            </div>
            <div class="vip-card-body">
                <ul class="vip-features">
                    ${vip.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                <div class="vip-price">${vip.price}</div>
            </div>
            <div class="vip-card-footer">
                <button class="btn btn-primary btn-block buy-btn" data-vip="${vip.id}">Comprar Agora</button>
            </div>
        `;
        
        vipOptions.appendChild(card);
    });
    
    // Adiciona eventos aos botões de compra
document.querySelectorAll('.buy-btn').forEach(button => {
    button.addEventListener('click', function() {
        const vipType = this.getAttribute('data-vip');
        const loggedInUser = localStorage.getItem('loggedInUser');
        
        if (!loggedInUser) {
            alert('Por favor, faça login para comprar um VIP.');
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
            return;
        }
            
            const selectedVip = vipData.find(vip => vip.id === vipType);
            alert(`Você está comprando o pacote ${selectedVip.name} por ${selectedVip.price}. Em um sistema real, isso levaria você para o pagamento.`);
            
            // Salva a compra no localStorage
            const purchases = JSON.parse(localStorage.getItem('purchases')) || [];
            purchases.push({
                username: loggedInUser,
                vip: vipType,
                date: new Date().toISOString(),
                status: 'pending'
            });
            localStorage.setItem('purchases', JSON.stringify(purchases));
             window.location.href = 'payment.html?vip=' + vipType;
        });
    });
}

// Inicializa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', renderVipCards);