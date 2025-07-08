async function Entrar() {
    // Coletar dados de entrada
    const nome = document.getElementById('nome').value;
    const senha = document.getElementById('senha').value;

    // Validação básica
    if (!nome || !senha) {
        alert('Por favor, preencha todos os campos');
        return;
    }

    try {
        // Buscar todos os usuários
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: nome,
                senha: senha
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar usuários');
        }

        const usuarioResponse = await response.json();
        const usuarioEncontrado = usuarioResponse.usuario;

        if (usuarioEncontrado) {
            alert(`Bem-vindo, ${usuarioEncontrado.tx_nome}!`);

            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioEncontrado));

            window.location.href = '../Pagina_principal/index_principal.html';
        } else {
            alert('Nome ou senha incorretos');
        }

    } catch (error) {
        console.error('Erro no login:', error);
        alert('Erro ao tentar fazer login. Tente novamente.');
    }
}

// Adicionar evento de Enter nos campos
document.addEventListener('DOMContentLoaded', () => {
    const nomeInput = document.getElementById('nome');
    const senhaInput = document.getElementById('senha');

    nomeInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            senhaInput.focus();
        }
    });

    senhaInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            Entrar();
        }
    });
});

// Verificar se usuário já está logado ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    const paginaAtual = window.location.pathname;

    // Redirecionar apenas se não estiver na página de login
    if (usuarioLogado && !paginaAtual.includes('index_login.html')) {
        window.location.href = '../Pagina_inicial/index.html';
    }
});

