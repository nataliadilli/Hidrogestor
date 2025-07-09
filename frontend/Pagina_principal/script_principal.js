// Verificação de autenticação e carregamento da página
document.addEventListener('DOMContentLoaded', function () {

    // Carregar informações do usuário
    carregarInformacoesUsuario();

    // Adicionar animações aos elementos
    inicializarAnimacoes();

    // Configurar visibilidade dos botões baseado no tipo de usuário
    configurarVisibilidadeBotoes();
});

// Função para carregar informações do usuário
function carregarInformacoesUsuario() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');

    if (usuarioLogado) {
        try {
            const dadosUsuario = JSON.parse(usuarioLogado);
            // Verificar diferentes possíveis campos de nome
            const nomeUsuario = dadosUsuario.tx_nome || dadosUsuario.nome || 'Usuário';

            // Atualizar nome do usuário na interface
            const elementoNome = document.getElementById('usuario-nome');
            if (elementoNome) {
                elementoNome.textContent = `Olá, ${nomeUsuario}`;
            }

            // Armazenar tipo de usuário para verificações posteriores
            window.tipoUsuario = dadosUsuario.tipo_usuario;

        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
        }
    }
}

// Função para configurar visibilidade dos botões baseado no tipo de usuário
function configurarVisibilidadeBotoes() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');

    if (usuarioLogado) {
        try {
            const dadosUsuario = JSON.parse(usuarioLogado);
            const tipoUsuario = dadosUsuario.tipo_usuario;

            // Mostrar botões exclusivos para contadores (tipo_usuario = 0)
            if (tipoUsuario === 0) {
                const botoesContador = document.querySelectorAll('.contador-only');
                botoesContador.forEach(botao => {
                    botao.style.display = 'flex';
                });
            }

        } catch (error) {
            console.error('Erro ao verificar tipo de usuário:', error);
        }
    }
}

// Função para inicializar animações
function inicializarAnimacoes() {
    // Adicionar classe de animação aos itens do menu
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });
}

// Função para Lista de Residentes (apenas contadores)
function listaResidentes() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');

    if (!usuarioLogado) {
        alert('Erro: Usuário não encontrado. Por favor, faça login novamente.');
        window.location.href = '../Pagina_inicial/index_inicial.html';
        return;
    }

    try {
        const dadosUsuario = JSON.parse(usuarioLogado);
        const tipoUsuario = dadosUsuario.tipo_usuario;

        // Verifica se é contador (tipo_usuario = 0)
        if (tipoUsuario === 0) {
            // Usuário é contador - pode acessar
            mostrarMensagemCarregamento('Carregando lista de residentes...');

            setTimeout(() => {
                window.location.href = '../Lista_residentes/index_lista.html';
            }, 1000);
        } else {
            // Usuário não é contador
            alert('Acesso negado!\nEsta área é restrita aos contadores do sistema.');
        }
    } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        alert('Erro ao verificar permissões. Por favor, tente novamente.');
    }
}

// Função para Adicionar Leitura (apenas contadores)
function adicionarLeitura() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');

    if (!usuarioLogado) {
        alert('Erro: Usuário não encontrado. Por favor, faça login novamente.');
        window.location.href = '../Pagina_inicial/index_inicial.html';
        return;
    }

    try {
        const dadosUsuario = JSON.parse(usuarioLogado);
        const tipoUsuario = dadosUsuario.tipo_usuario;

        // Verifica se é contador (tipo_usuario = 0)
        if (tipoUsuario === 0) {
            // Usuário é contador - pode acessar
            mostrarMensagemCarregamento('Carregando página de leitura...');

            setTimeout(() => {
                window.location.href = '../.html';
                removerMensagemCarregamento();
            }, 1000);

            //  Direcionando usuário do tipo 0 para página de regsitro de leitura
            window.location.href = '../Registrar_leitura/index_leitura.html';

        } else {
            // Usuário não é contador
            alert('Acesso negado!\nEsta área é restrita aos contadores do sistema.');
        }
    } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        alert('Erro ao verificar permissões. Por favor, tente novamente.');
    }
}

// Função para Leituras Anteriores (apenas contadores)
function leiturasAnteriores() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');

    if (!usuarioLogado) {
        alert('Erro: Usuário não encontrado. Por favor, faça login novamente.');
        window.location.href = '../Pagina_inicial/index_inicial.html';
        return;
    }

    try {
        const dadosUsuario = JSON.parse(usuarioLogado);
        const tipoUsuario = dadosUsuario.tipo_usuario;

        // Verifica se é contador (tipo_usuario = 0)
        if (tipoUsuario === 0) {
            // Usuário é contador - pode acessar
            mostrarMensagemCarregamento('Carregando leituras anteriores...');

            setTimeout(() => {
                window.location.href = '../.html';
                removerMensagemCarregamento();
            }, 1000);
        } else {
            // Usuário não é contador
            alert('Acesso negado!\nEsta área é restrita aos contadores do sistema.');
        }
    } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        alert('Erro ao verificar permissões. Por favor, tente novamente.');
    }
}

// Função para Faturas
function faturas() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');

    if (!usuarioLogado) {
        alert('Erro: Usuário não encontrado. Por favor, faça login novamente.');
        window.location.href = '../Pagina_inicial/index_inicial.html';
        return;
    }

    try {
        const dadosUsuario = JSON.parse(usuarioLogado);
        const tipoUsuario = dadosUsuario.tipo_usuario;

        // Libera acesso aos dois tipos de usuarios
        if (tipoUsuario === 0 || tipoUsuario === 1) {

            mostrarMensagemCarregamento('Carregando lista de residentes...');

            setTimeout(() => {
                window.location.href = '../Lista_faturas/index_lista_fatura.html';
            }, 1000);
        } else {
            alert('Acesso negado!\nEsta área é restrita aos contadores e clientes do sistema.');
        }
    } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        alert('Erro ao verificar permissões. Por favor, tente novamente.');
    }
}

// Função para Histórico de Consumo
function historico() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');

    if (!usuarioLogado) {
        alert('Erro: Usuário não encontrado. Por favor, faça login novamente.');
        window.location.href = '../Pagina_inicial/index_inicial.html';
        return;
    }

    try {
        const dadosUsuario = JSON.parse(usuarioLogado);
        const tipoUsuario = dadosUsuario.tipo_usuario;

        // Libera acesso aos dois tipos de usuarios
        if (tipoUsuario === 0 || tipoUsuario === 1) {

            mostrarMensagemCarregamento('Carregando lista de residentes...');

            setTimeout(() => {
                window.location.href = '../Lista_leituras/index_lista_leitura.html';
            }, 1000);
        } else {
            alert('Acesso negado!\nEsta área é restrita aos contadores e clientes do sistema.');
        }
    } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        alert('Erro ao verificar permissões. Por favor, tente novamente.');
    }
}

// Função para Suporte
function suporte() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');

    if (!usuarioLogado) {
        alert('Erro: Usuário não encontrado. Por favor, faça login novamente.');
        window.location.href = '../Pagina_inicial/index_inicial.html';
        return;
    }

    try {
        const dadosUsuario = JSON.parse(usuarioLogado);
        const tipoUsuario = dadosUsuario.tipo_usuario;

        // Libera acesso aos dois tipos de usuarios
        if (tipoUsuario === 0 || tipoUsuario === 1) {

            mostrarMensagemCarregamento('Carregando lista de residentes...');

            setTimeout(() => {
                window.location.href = '../.html';
            }, 1000);
        } else {
            alert('Acesso negado!\nEsta área é restrita aos contadores e clientes do sistema.');
        }
    } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        alert('Erro ao verificar permissões. Por favor, tente novamente.');
    }
}

// Função para Sair
function sair() {
    const confirmacao = confirm('Tem certeza que deseja sair do sistema?');

    if (confirmacao) {
        // Limpar dados do localStorage
        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('tempoLogin');

        // Mostrar mensagem de saída
        mostrarMensagemCarregamento('Encerrando sessão...');

        // Redirecionar para a página inicial após um breve delay
        setTimeout(() => {
            window.location.href = '../Pagina_inicial/index_inicial.html';
        }, 1000);
    }
}

// Função para mostrar mensagem de carregamento
function mostrarMensagemCarregamento(mensagem) {
    // Remover mensagem existente se houver
    removerMensagemCarregamento();

    // Criar elemento de loading
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-message';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.95);
        padding: 2rem;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        text-align: center;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
    `;

    loadingDiv.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <div style="
                width: 40px;
                height: 40px;
                border: 4px solid #667eea;
                border-top: 4px solid transparent;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto;
            "></div>
        </div>
        <p style="color: #2d3748; font-weight: 500; margin: 0;">${mensagem}</p>
    `;

    // Criar overlay
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(loadingDiv);
}

// Função para remover mensagem de carregamento
function removerMensagemCarregamento() {
    const loadingMessage = document.getElementById('loading-message');
    const loadingOverlay = document.getElementById('loading-overlay');

    if (loadingMessage) {
        loadingMessage.remove();
    }

    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

// Função para lidar com o botão voltar do navegador
window.addEventListener('popstate', function (event) {
    // Verificar se ainda está autenticado
    verificarAutenticacao();
});

// Função para atualizar o tempo de login
function atualizarTempoLogin() {
    const agora = new Date().getTime();
    localStorage.setItem('tempoLogin', agora.toString());
}