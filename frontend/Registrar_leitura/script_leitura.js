// Verificação de autenticação e carregamento da página
document.addEventListener('DOMContentLoaded', function() {
    
    // Carregar informações do usuário
    carregarInformacoesUsuario();
    
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
                elementoNome.textContent = `${nomeUsuario}, você está acessando a área de registro de consumo!`;
            }
            
            // Armazenar tipo de usuário para verificações posteriores
            window.tipoUsuario = dadosUsuario.tipo_usuario;
            
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
        }
    }
}


function registrar_leitura() {

    event.preventDefault();

    let nr_mes = document.getElementById("nr_mes").value;
    let qt_consumo = document.getElementById("qt_consumo").value;
    let nr_unidadeconsumidora = document.getElementById("nr_unidadeconsumidora").value;

    //Validaçoes
    if (!nr_mes) {
        return alert("Por favor informe o mês da leitura");
    }

    if (!qt_consumo) {
        return alert("Por favor preencha o valor de água consumido (m³)");
    }

    if (!nr_unidadeconsumidora) {
        return alert("Por favor preencha o campo Número da Unidade Consumidora");
    }


    // Obtém a data atual no formato compatível com MySQL TIMESTAMP
    let data_registro = new Date().toISOString().slice(0, 19).replace('T', ' ');


    // Objeto organizado conforme colunas do banco de dados
    let objetoLeitura = {
        nr_unidadeconsumidora: nr_unidadeconsumidora,
        qt_consumo: qt_consumo,
        nr_mes: nr_mes,
        data_registro: data_registro
    };

    alert('Enviando leitura:', objetoLeitura);

    fetch("http://localhost:3000/gravarNovaLeitura", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(objetoLeitura),
    })
        .then(response => response.json())
        .then(data => {
            alert("Leitura adicionada com sucesso!");
            setTimeout(() => {
                window.location.href = '../Login/index_login.html';
            });
            
        })
        
        .catch(error => {
            console.error("Erro ao adicionar leitura:", error);
        });

    
    document.getElementById("formulario").reset();
}


