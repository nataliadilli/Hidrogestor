// Configuração da API
const API_BASE_URL = 'https://hidrogestor-api.onrender.com';

// Variável para armazenar os dados dos residentes
let residentsData = [];

// adicionar variável global para compatibilidade com modais/exclusão
let residentToDelete = null;

// Função para formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
// Função para criar um card de residente
function createFaturaTableRows(fatura) {

    return `
        <tr>
            <td>${String(fatura.meslido).padStart(2, '0')}</td>
            <td>${parseFloat(fatura.quantidadeconsumida)}</td>
            <td>${formatDate(fatura.dataleitura)}</td>
        </tr>
    `;
}

// Função para carregar e exibir os residentes
async function loadResidents() {
    const loadingElement = document.getElementById('loading');
    const emptyStateElement = document.getElementById('emptyState');
    const residentsListElement = document.getElementById('residentsList');
    const tableElement = document.getElementById('faturasTable');

    loadingElement.style.display = 'block';
    emptyStateElement.style.display = 'none';
    residentsListElement.innerHTML = '';
    tableElement.style.display = 'none';

    try {
        residentsData = await fetchResidentsFromAPI();
        loadingElement.style.display = 'none';

        if (residentsData.length === 0) {
            emptyStateElement.style.display = 'block';
        } else {
            const rowsHTML = residentsData.map(createFaturaTableRows).join('');
            residentsListElement.innerHTML = rowsHTML;
            tableElement.style.display = 'table';
        }
    } catch (error) {
        console.error('Erro ao carregar faturas:', error);
        loadingElement.style.display = 'none';
        emptyStateElement.innerHTML = '<p style="color: #e53e3e;">Erro ao carregar dados. Tente novamente mais tarde.</p>';
        emptyStateElement.style.display = 'block';
    }
}

// Função para buscar dados da API do seu servidor
async function fetchResidentsFromAPI() {
    try {
        console.log('Buscando residentes da API...');

        const usuarioLogado = localStorage.getItem('usuarioLogado');

        const dadosUsuario = JSON.parse(usuarioLogado);

        const response = await fetch(`${API_BASE_URL}/listarLeitura/${dadosUsuario.nr_unidadeconsumidora}`);

        if (!response.ok) {
            if (response.status === 404) {
                console.log('Nenhum residente encontrado');
                return [];
            }
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Residentes carregados:', data);

        return data;
    } catch (error) {
        console.error('Erro ao carregar residentes:', error);

        // Mostrar mensagem de erro para o usuário
        const loadingElement = document.getElementById('loading');
        const emptyStateElement = document.getElementById('emptyState');

        if (loadingElement) {
            loadingElement.innerHTML = '<p style="color: #e53e3e;">Erro ao carregar dados. Verifique se o servidor está rodando.</p>';
        }

        return [];
    }
}

// Inicializar a página quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    loadResidents();
    setupHeaderScroll(); // inicializa comportamento do banner ao rolar a página
});

// Função para criar o comportamento de esconder/exibir o banner conforme scroll
function setupHeaderScroll() {
    const pageHeader = document.querySelector('.page-header');
    if (!pageHeader) return;

    let lastY = window.scrollY || 0;
    let ticking = false;
    const threshold = 40;

    const onTick = () => {
        const currentY = window.scrollY || 0;
        if (currentY > lastY && currentY > threshold) {
            pageHeader.classList.add('hidden');
        } else if (currentY < lastY) {
            pageHeader.classList.remove('hidden');
        }
        lastY = currentY;
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(onTick);
            ticking = true;
        }
    }, { passive: true });
}

// Função para atualizar a lista (pode ser chamada quando novos dados chegarem)
async function refreshResidentsList() {
    const residentsListElement = document.getElementById('residentsList');
    const loadingElement = document.getElementById('loading');

    residentsListElement.innerHTML = '';
    loadingElement.style.display = 'block';

    await loadResidents();
}

// Exportar funções para uso em outros arquivos se necessário
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadResidents,
        refreshResidentsList,
        fetchResidentsFromAPI
    };
}

// Função para excluir residente
async function deleteResident(id) {
    try {
        console.log(`Excluindo residente com ID: ${id}`);

        const response = await fetch(`${API_BASE_URL}/excluirUsuario/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Residente não encontrado');
            }
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const result = await response.json();
        console.log('Residente excluído:', result);

        // Recarregar a lista após exclusão
        await refreshResidentsList();

        return result;
    } catch (error) {
        console.error('Erro ao excluir residente:', error);
        alert(`Erro ao excluir residente: ${error.message}`);
        throw error;
    }
}

// Função para abrir o modal de confirmação de exclusão
function openDeleteModal(id, name) {
    residentToDelete = id;
    document.getElementById('deleteResidentName').textContent = name;
    document.getElementById('deleteModal').style.display = 'block';
}

// Função para fechar o modal de confirmação
function closeDeleteModal() {
    residentToDelete = null;
    document.getElementById('deleteModal').style.display = 'none';
}

// Função para confirmar a exclusão
async function confirmDelete() {
    if (residentToDelete) {
        try {
            // Desabilitar botões durante a exclusão
            const confirmBtn = document.querySelector('.btn-confirm');
            const cancelBtn = document.querySelector('.btn-cancel');

            confirmBtn.disabled = true;
            cancelBtn.disabled = true;
            confirmBtn.textContent = 'Excluindo...';

            await deleteResident(residentToDelete);

            // Fechar modal
            closeDeleteModal();

            // Mostrar mensagem de sucesso
            alert('Residente excluído com sucesso!');

        } catch (error) {
            // Reabilitar botões em caso de erro
            const confirmBtn = document.querySelector('.btn-confirm');
            const cancelBtn = document.querySelector('.btn-cancel');

            confirmBtn.disabled = false;
            cancelBtn.disabled = false;
            confirmBtn.textContent = 'Excluir';
        }
    }
}

// Fechar modal quando clicar fora dele
window.onclick = function (event) {
    const modal = document.getElementById('deleteModal');
    if (event.target === modal) {
        closeDeleteModal();
    }
}
