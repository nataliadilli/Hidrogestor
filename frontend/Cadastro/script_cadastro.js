async function registrar() {

    let nome = document.getElementById("nome").value;
    let nr_unidadeconsumidora = document.getElementById("nr_unidadeconsumidora").value;
    let cpf = document.getElementById("cpf").value;
    let tipo_usuario = document.querySelector('input[name="tipo_usuario"]:checked').value;
    let senha = document.getElementById("senha").value;
    let confirmarSenha = document.getElementById("confirmarSenha").value;

    //Validaçoes
    if (!nome) {
        return alert("Por favor preencha o campo Nome");
    }

    if (!nr_unidadeconsumidora) {
        return alert("Por favor preencha o campo Numero da Unidade Consumidora");
    }

    if (!cpf) {
        return alert("Por favor preencha o campo CPF");
    }

    if (!tipo_usuario) {
        return alert("Por favor preencha o campo Tipo de Cliente");
    }

    if (!senha) {
        return alert("Por favor preencha o campo Senha");
    }

    if (!confirmarSenha) {
        return alert("Por favor preencha o campo Confirmar Senha");
    }

    if (senha !== confirmarSenha) {
        return alert("As senhas devem ser iguais");
    }

    // Verificar duplicatas antes de cadastrar
    try {
        const verificacao = await fetch("https://hidrogestor-api.onrender.com/verificarDuplicatas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cpf, nr_unidadeconsumidora, nome })
        });
        
        const dados = await verificacao.json();
        console.log("Dados recebidos:", dados); // Debug
        
        if (dados.cpf_existe) {
            return alert("Este CPF já está cadastrado no sistema!");
        }
     
     

        // Verificar limite de contadores
        if (tipo_usuario === '0' && dados.total_contadores >= 2) {
            return alert("Já existe o máximo permitido de contadores cadastrados no sistema!");
        }
    } catch (error) {
        console.error("Erro na verificação:", error);
        return alert("Erro ao verificar dados. Tente novamente.");
    }

    // Obtém a data atual no formato compatível com MySQL TIMESTAMP
    let data_cadastro = new Date().toISOString().slice(0, 19).replace('T', ' ');

    let objetoCadastro = {
        nome: nome,
        nr_unidadeconsumidora: nr_unidadeconsumidora,
        cpf: cpf,
        tipo_usuario: tipo_usuario,
        senha: senha,
        data_cadastro: data_cadastro
    };

    alert("Seja bem-vindo " + nome);

    fetch("https://hidrogestor-api.onrender.com/gravarNovoUsuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(objetoCadastro)
    })
    .then(response => response.json())
    .then(async data => {
        alert("Residente adicionado com sucesso!");

        // Realizar login automático após o cadastro
        try {
            const loginResponse = await fetch("https://hidrogestor-api.onrender.com/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cpf, senha })
            });

            if (!loginResponse.ok) {
                throw new Error("Erro ao realizar login automático.");
            }

            const loginData = await loginResponse.json();
            const usuarioLogado = loginData.usuario;

            if (usuarioLogado) {
                localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));
                alert(`Bem-vindo, ${usuarioLogado.tx_nome}!`);
                window.location.href = '../Pagina_principal/index_principal.html';
            } else {
                throw new Error("Usuário não encontrado após o cadastro.");
            }
        } catch (error) {
            console.error("Erro no login automático:", error);
            alert("Erro ao realizar login automático. Por favor, faça login manualmente.");
            window.location.href = '../Login/index_login.html';
        }
    })
    .catch(error => {
        console.error("Erro ao adicionar residente:", error);
        alert("Erro ao conectar com o servidor. Tente novamente.");
    });

    document.getElementById("formulario").reset();
}


