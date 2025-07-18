// Configuração da API
const API_BASE_URL = 'http://localhost:3000';

// Variável para armazenar os dados dos residentes
let residentsData = [];

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

// Função para determinar o tipo de usuário
function getUserType(tipo_usuario) {
    if (tipo_usuario == 0) {
        return 'admin';
    } else {
        return 'user';
    }
}

// Função para obter o texto do tipo de usuário
function getUserTypeText(tipo_usuario) {
    return tipo_usuario == 0 ? 'Contador/Tesoureiro' : 'Residente';
}

// Função para criar um card de residente
function createResidentCard(resident) {
    const userTypeClass = getUserType(resident.tipo_usuario);
    const userTypeText = getUserTypeText(resident.tipo_usuario);
    
    return `
        <div class="resident-card">
            <div class="resident-icon"></div>
            <div class="resident-info">
                <h3>${resident.tx_nome}</h3>
                <div class="resident-details">
                    <div class="detail-item">
                        <span class="detail-label">ID:</span>
                        <span class="detail-value">#${resident.id_residente.toString().padStart(3, '0')}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Unidade:</span>
                        <span class="detail-value">${resident.nr_unidadeconsumidora}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Tipo:</span>
                        <span class="detail-value">
                            <span class="user-type ${userTypeClass}">${userTypeText}</span>
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Cadastrado em:</span>
                        <span class="detail-value">${formatDate(resident.data_cadastro)}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-delete" onclick="openDeleteModal(${resident.id_residente}, '${resident.tx_nome}')">
                         Excluir
                    </button>
                    <button class="btn-edit" onclick="openEditModal(${resident.id_residente})">
                         Editar
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Função para carregar e exibir os residentes
async function loadResidents() {
    const loadingElement = document.getElementById('loading');
    const emptyStateElement = document.getElementById('emptyState');
    const residentsListElement = document.getElementById('residentsList');
    
    // Mostrar indicador de carregamento
    loadingElement.style.display = 'block';
    emptyStateElement.style.display = 'none';
    residentsListElement.innerHTML = '';
    
    try {
        // Buscar dados da API
        residentsData = await fetchResidentsFromAPI();
        
        // Esconder indicador de carregamento
        loadingElement.style.display = 'none';
        
        if (residentsData.length === 0) {
            emptyStateElement.style.display = 'block';
        } else {
            const residentsHTML = residentsData.map(createResidentCard).join('');
            residentsListElement.innerHTML = residentsHTML;
            
            // Animação de entrada
            const cards = document.querySelectorAll('.resident-card');
            cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.transition = 'all 0.5s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar residentes:', error);
        loadingElement.style.display = 'none';
        emptyStateElement.innerHTML = '<p style="color: #e53e3e;">Erro ao carregar dados. Tente novamente mais tarde.</p>';
        emptyStateElement.style.display = 'block';
    }
}

// Função para buscar dados da API do servidor
async function fetchResidentsFromAPI() {
    try {
        console.log('Buscando residentes da API...');
        
        const response = await fetch(`${API_BASE_URL}/listarUsuarios`);
        
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
});

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

// Função para abrir a página de edição de residente
function openEditModal(id) {
    window.location.href = `../Editar_residentes/index_editar.html?id=${id}`;
}

// Fechar modal quando clicar fora dele
window.onclick = function(event) {
    const modal = document.getElementById('deleteModal');
    if (event.target === modal) {
        closeDeleteModal();
    }
}
