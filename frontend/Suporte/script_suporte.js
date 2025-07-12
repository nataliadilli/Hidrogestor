// Aguarda o DOM estar carregado
document.addEventListener('DOMContentLoaded', function() {
    
    // Adicionar efeito de hover mais suave nos cartões
    const supportCards = document.querySelectorAll('.support-card');
    
    supportCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });


    // Efeito de loading nos links do WhatsApp
    supportCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Adicionar uma pequena animação de click
            this.style.transform = 'translateY(-3px) scale(0.98)';
            
            setTimeout(() => {
                this.style.transform = 'translateY(-5px) scale(1.02)';
            }, 100);
        });
    });

    //Adicionar animação de entrada para os cartões
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    // Inicializar animação de entrada
    supportCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s ease';
        card.style.transitionDelay = `${index * 0.1}s`;
        
        observer.observe(card);
    });
});