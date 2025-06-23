// Sistema de Pagamento com QR Codes por VIP e Comprovante
document.addEventListener('DOMContentLoaded', function() {
    // Configurações do PIX
    const PIX_KEY = "074.252.931-29";
    const PIX_KEY_TYPE = "CPF";
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

    // Valores e QR Codes dos VIPs
    const VIP_VALUES = {
        'engineer': {
            name: 'VIP Tech Genesis',
            price: 14.99,
            qrcode: 'assets/pix-engineer.png',
            discountedQrcode: 'assets/pix-engineer-discounted.png', // Novo QR Code para desconto
            pixCodeTemplate: '00020126580014BR.GOV.BCB.PIX0136123e4567-e12b-12d1-a456-42665544000052040000530398654{amount}5802BR5913FULANO DE TAL6008BRASILIA62070503***6304'
        },
        'mechanic': {
            name: 'VIP Tech Master',
            price: 19.99,
            qrcode: 'assets/pix-mechanic.png',
            discountedQrcode: 'assets/pix-mechanic-discounted.png',
            pixCodeTemplate: '00020126580014BR.GOV.BCB.PIX0136123e4567-e12b-12d1-a456-42665544000052040000530398654{amount}5802BR5913FULANO DE TAL6008BRASILIA62070503***6304'
        },
        'industrialist': {
            name: 'VIP Tech God',
            price: 29.99,
            qrcode: 'assets/pix-industrialist.png',
            discountedQrcode: 'assets/pix-industrialist-discounted.png',
            pixCodeTemplate: '00020126580014BR.GOV.BCB.PIX0136123e4567-e12b-12d1-a456-42665544000052040000530398654{amount}5802BR5913FULANO DE TAL6008BRASILIA62070503***6304'
        }
    };

    // Cupons de desconto válidos
    const VALID_COUPONS = {
        'TECH10': { discount: 10, type: 'percent' },
        'TECH5': { discount: 5, type: 'percent' },
        'GOD': { discount: 5, type: 'fixed' },
        'CYPHER': { 
            discount: 15, 
            type: 'percent',
            special: true // Marca este cupom como especial
        }
    };

    // Elementos da página
    const elements = {
        vipName: document.getElementById('vipName'),
        vipPrice: document.getElementById('vipPrice'),
        amountDisplay: document.getElementById('amountDisplay'),
        pixKeyInput: document.getElementById('pixKey'),
        confirmBtn: document.getElementById('confirmPayment'),
        paymentContent: document.querySelector('.payment-content'),
        paymentSuccess: document.getElementById('paymentSuccess'),
        discordCodeInput: document.getElementById('discordCode'),
        paymentProofSection: document.getElementById('paymentProofSection'),
        uploadArea: document.getElementById('uploadArea'),
        proofInput: document.getElementById('proofInput'),
        filePreview: document.getElementById('filePreview'),
        pixQrCodeImg: document.getElementById('pixQrCode'),
        qrMethod: document.getElementById('pixQrMethod'),
        keyMethod: document.getElementById('pixKeyMethod'),
        codeMethod: document.getElementById('pixCodeMethod'),
        qrSection: document.getElementById('qrCodeSection'),
        keySection: document.getElementById('pixKeySection'),
        codeSection: document.getElementById('pixCodeSection'),
        pixCodeDisplay: document.getElementById('pixCodeDisplay'),
        couponInput: document.getElementById('couponInput'),
        applyCouponBtn: document.getElementById('applyCoupon'),
        couponMessage: document.getElementById('couponMessage'),
        originalPriceDisplay: document.getElementById('originalPrice'),
        discountDisplay: document.getElementById('discount'),
        finalPriceDisplay: document.getElementById('finalPrice')
    };
    
    let proofFile = null;
    let currentCoupon = null;
    let originalPrice = 0;
    let finalPrice = 0;
    let currentVipType = null;

    // Recupera o tipo de VIP da URL
    const urlParams = new URLSearchParams(window.location.search);
    currentVipType = urlParams.get('vip');

    // Configura a página com os dados do VIP
    if (currentVipType && VIP_VALUES[currentVipType]) {
        const vip = VIP_VALUES[currentVipType];
        originalPrice = vip.price;
        finalPrice = originalPrice;
        
        // Atualiza os textos
        elements.vipName.textContent = vip.name;
        elements.vipPrice.textContent = `R$ ${originalPrice.toFixed(2).replace('.', ',')}`;
        elements.amountDisplay.textContent = `R$ ${originalPrice.toFixed(2).replace('.', ',')}`;
        elements.originalPriceDisplay.textContent = `R$ ${originalPrice.toFixed(2).replace('.', ',')}`;
        elements.finalPriceDisplay.textContent = `R$ ${originalPrice.toFixed(2).replace('.', ',')}`;
        
        // Configura a chave PIX e QR Code
        elements.pixKeyInput.value = PIX_KEY;
        updatePaymentData(currentVipType, finalPrice);
        
        // Configura métodos de pagamento
        setupPaymentMethods();
        
        // Configura botões de cópia
        setupCopyButtons();
        
        // Configura eventos de upload
        setupUploadHandlers();
        
        // Botão de confirmação de pagamento
        elements.confirmBtn.addEventListener('click', handlePaymentConfirmation);

        // Botão de aplicação de cupom
        elements.applyCouponBtn.addEventListener('click', applyCoupon);
        elements.couponInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') applyCoupon();
        });
    } else {
        // Se não tiver VIP selecionado, redireciona
        window.location.href = 'index.html';
    }

    // Atualiza os dados de pagamento (QR Code e código PIX) com o valor correto
    function updatePaymentData(vipType, amount) {
        const vip = VIP_VALUES[vipType];
        
        // Verifica se é o cupom CYPHER e usa o QR Code especial se existir
        if (currentCoupon && currentCoupon.code === 'CYPHER' && vip.discountedQrcode) {
            elements.pixQrCodeImg.src = vip.discountedQrcode;
        } else {
            elements.pixQrCodeImg.src = vip.qrcode;
        }
        
        // Atualiza o código PIX com o valor correto
        const amountFormatted = Math.floor(amount * 100).toString().padStart(2, '0');
        const pixCode = vip.pixCodeTemplate.replace('{amount}', amountFormatted);
        elements.pixCodeDisplay.textContent = formatPixCode(pixCode);
    }

    // Formata o código PIX para exibição
    function formatPixCode(code) {
        return code.match(/.{1,4}/g).join(' ');
    }

    // Configura os botões de cópia
    function setupCopyButtons() {
        // Copiar chave PIX
        document.getElementById('copyPixKey').addEventListener('click', function() {
            elements.pixKeyInput.select();
            document.execCommand('copy');
            showMessage('Chave PIX copiada!');
        });
        
        // Copiar código PIX
        document.getElementById('copyPixCode').addEventListener('click', function() {
            const range = document.createRange();
            range.selectNode(elements.pixCodeDisplay);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            document.execCommand('copy');
            window.getSelection().removeAllRanges();
            showMessage('Código PIX copiado!');
        });
    }

    // Configura a alternância entre métodos de pagamento
    function setupPaymentMethods() {
        elements.qrMethod.addEventListener('click', () => {
            setActiveMethod(elements.qrMethod, elements.qrSection);
        });
        
        elements.keyMethod.addEventListener('click', () => {
            setActiveMethod(elements.keyMethod, elements.keySection);
        });
        
        elements.codeMethod.addEventListener('click', () => {
            setActiveMethod(elements.codeMethod, elements.codeSection);
        });
    }

    function setActiveMethod(methodElement, sectionElement) {
        // Remove a classe active de todos os métodos
        [elements.qrMethod, elements.keyMethod, elements.codeMethod].forEach(el => {
            el.classList.remove('active');
        });
        
        // Esconde todas as seções
        [elements.qrSection, elements.keySection, elements.codeSection].forEach(el => {
            el.style.display = 'none';
        });
        
        // Ativa o método selecionado
        methodElement.classList.add('active');
        sectionElement.style.display = 'block';
    }

    // Função para aplicar cupom de desconto
    function applyCoupon() {
        const couponCode = elements.couponInput.value.trim().toUpperCase();
        
        if (!couponCode) {
            showCouponMessage('Por favor, insira um código de cupom', 'error');
            return;
        }
        
        if (currentCoupon && currentCoupon.code === couponCode) {
            showCouponMessage('Este cupom já está aplicado', 'info');
            return;
        }
        
        if (VALID_COUPONS[couponCode]) {
            const coupon = VALID_COUPONS[couponCode];
            currentCoupon = {
                code: couponCode,
                discount: coupon.discount,
                type: coupon.type,
                special: coupon.special || false
            };
            
            calculateDiscount();
            showCouponMessage('Cupom aplicado com sucesso!', 'success');
            updatePriceDisplay();
            
            // Atualiza os dados de pagamento se for um cupom especial
            if (coupon.special) {
                updatePaymentData(currentVipType, finalPrice);
            }
        } else {
            showCouponMessage('Cupom inválido ou expirado', 'error');
            currentCoupon = null;
            resetPriceToOriginal();
            // Restaura os dados de pagamento originais
            updatePaymentData(currentVipType, originalPrice);
        }
    }

    // Calcula o desconto com base no cupom aplicado
    function calculateDiscount() {
        if (!currentCoupon) {
            finalPrice = originalPrice;
            return;
        }
        
        if (currentCoupon.type === 'percent') {
            const discountAmount = originalPrice * (currentCoupon.discount / 100);
            finalPrice = originalPrice - discountAmount;
        } else {
            finalPrice = originalPrice - currentCoupon.discount;
            if (finalPrice < 0) finalPrice = 0;
        }
        
        // Garante que o preço final tenha no máximo 2 casas decimais
        finalPrice = parseFloat(finalPrice.toFixed(2));
    }

    // Atualiza a exibição dos preços na página
    function updatePriceDisplay() {
        if (currentCoupon) {
            const discountText = currentCoupon.type === 'percent' 
                ? `${currentCoupon.discount}%` 
                : `R$ ${currentCoupon.discount.toFixed(2).replace('.', ',')}`;
            
            elements.discountDisplay.textContent = `-${discountText}`;
            elements.finalPriceDisplay.textContent = `R$ ${finalPrice.toFixed(2).replace('.', ',')}`;
            elements.amountDisplay.textContent = `R$ ${finalPrice.toFixed(2).replace('.', ',')}`;
            
            document.querySelector('.price-breakdown').style.display = 'block';
        } else {
            document.querySelector('.price-breakdown').style.display = 'none';
        }
    }

    // Reseta o preço para o original (sem desconto)
    function resetPriceToOriginal() {
        finalPrice = originalPrice;
        elements.amountDisplay.textContent = `R$ ${originalPrice.toFixed(2).replace('.', ',')}`;
        elements.finalPriceDisplay.textContent = `R$ ${originalPrice.toFixed(2).replace('.', ',')}`;
        elements.discountDisplay.textContent = 'R$ 0,00';
        document.querySelector('.price-breakdown').style.display = 'none';
    }

    // Mostra mensagem de status do cupom
    function showCouponMessage(message, type) {
        elements.couponMessage.textContent = message;
        elements.couponMessage.className = 'coupon-message ' + type;
        
        setTimeout(() => {
            elements.couponMessage.textContent = '';
            elements.couponMessage.className = 'coupon-message';
        }, 3000);
    }

    // Configura os handlers de upload
    function setupUploadHandlers() {
        elements.uploadArea.addEventListener('click', () => elements.proofInput.click());
        elements.proofInput.addEventListener('change', handleFileSelect);

        // Drag and drop
        elements.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            elements.uploadArea.classList.add('dragover');
        });

        elements.uploadArea.addEventListener('dragleave', () => {
            elements.uploadArea.classList.remove('dragover');
        });

        elements.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            elements.uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                elements.proofInput.files = e.dataTransfer.files;
                handleFileSelect({ target: elements.proofInput });
            }
        });
    }

    function handleFileSelect(event) {
        const file = event.target.files[0];
        
        if (!file) return;
        
        if (!ALLOWED_TYPES.includes(file.type)) {
            showMessage('Tipo de arquivo não permitido. Use JPG, PNG ou PDF');
            return;
        }
        
        if (file.size > MAX_FILE_SIZE) {
            showMessage('Arquivo muito grande. Tamanho máximo: 5MB');
            return;
        }
        
        proofFile = file;
        showFilePreview(file);
    }

    function showFilePreview(file) {
        elements.filePreview.innerHTML = '';
        
        if (file.type.includes('image')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                elements.filePreview.innerHTML = `
                    <div class="preview-item">
                        <img src="${e.target.result}" alt="Preview">
                        <span>${file.name}</span>
                        <button class="btn-remove" id="removeProof">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                document.getElementById('removeProof').addEventListener('click', removeProof);
            };
            reader.readAsDataURL(file);
        } else {
            elements.filePreview.innerHTML = `
                <div class="preview-item">
                    <i class="fas fa-file-pdf"></i>
                    <span>${file.name}</span>
                    <button class="btn-remove" id="removeProof">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            document.getElementById('removeProof').addEventListener('click', removeProof);
        }
    }

    function removeProof() {
        proofFile = null;
        elements.proofInput.value = '';
        elements.filePreview.innerHTML = '';
    }

    function handlePaymentConfirmation() {
        if (!proofFile) {
            elements.paymentProofSection.style.display = 'block';
            this.textContent = 'Enviar comprovante e gerar código';
            showMessage('Por favor, envie o comprovante de pagamento');
            return;
        }
        
        generateAndShowCode();
    }

    async function generateAndShowCode() {
        const formData = new FormData();
        formData.append('proof', proofFile);
        formData.append('vipType', currentVipType);
        formData.append('coupon', currentCoupon ? currentCoupon.code : '');
        formData.append('finalPrice', finalPrice);
        
        try {
            elements.confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
            elements.confirmBtn.disabled = true;
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const discordCode = generateDiscordCode();
            elements.discordCodeInput.value = discordCode;
            
            elements.paymentContent.style.display = 'none';
            elements.paymentSuccess.style.display = 'block';
            
            savePurchase(currentVipType, discordCode, proofFile.name);
            
            document.getElementById('copyDiscordCode').addEventListener('click', function() {
                elements.discordCodeInput.select();
                document.execCommand('copy');
                showMessage('Código copiado!');
            });
        } catch (error) {
            showMessage('Erro ao processar comprovante. Tente novamente');
            elements.confirmBtn.textContent = 'Enviar comprovante e gerar código';
            elements.confirmBtn.disabled = false;
        }
    }

    function generateDiscordCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        
        for (let i = 0; i < 16; i++) {
            if (i > 0 && i % 4 === 0) code += '-';
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return code;
    }
    
    function showMessage(message) {
        const msg = document.createElement('div');
        msg.className = 'flash-message';
        msg.textContent = message;
        document.body.appendChild(msg);
        
        setTimeout(() => {
            msg.remove();
        }, 2000);
    }
    
    function savePurchase(vipType, discordCode, proofName) {
        const loggedInUser = localStorage.getItem('loggedInUser');
        const purchases = JSON.parse(localStorage.getItem('ifmine_purchases')) || [];
        const purchase = {
            username: loggedInUser || 'guest',
            date: new Date().toISOString(),
            vip: vipType,
            code: discordCode,
            status: 'pending_review',
            proof: proofName || 'No proof',
            amount: finalPrice,
            originalAmount: VIP_VALUES[vipType].price,
            coupon: currentCoupon ? currentCoupon.code : null,
            paymentMethod: getActivePaymentMethod()
        };
        
        purchases.push(purchase);
        localStorage.setItem('ifmine_purchases', JSON.stringify(purchases));
    }

    function getActivePaymentMethod() {
        if (elements.qrMethod.classList.contains('active')) return 'QR Code';
        if (elements.keyMethod.classList.contains('active')) return 'Chave PIX';
        if (elements.codeMethod.classList.contains('active')) return 'Código PIX';
        return 'Desconhecido';
    }
});