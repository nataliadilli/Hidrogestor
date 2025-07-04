
function registrar() {

    let nome = document.getElementById("nome").value;
    let nr_unidadeconsumidora = document.getElementById("nr_unidadeconsumidora").value;
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

    // Obtém a data atual no formato compatível com MySQL TIMESTAMP
    let data_cadastro = new Date().toISOString().slice(0, 19).replace('T', ' ');

    let objetoCadastro = {
        nome: nome,
        nr_unidadeconsumidora: nr_unidadeconsumidora,
        tipo_usuario: tipo_usuario,
        senha: senha,
        data_cadastro: data_cadastro
    };

    alert("Seja bem-vindo " + objetoCadastro.nome);

    fetch("http://localhost:3000/gravarNovoUsuario", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(objetoCadastro),
    })
        .then(response => response.json())
        .then(data => {
            alert("Residente adicionado com sucesso!");
            setTimeout(() => {
                window.location.href = '../Login/index_login.html';
            });
            
        })
        
        .catch(error => {
            console.error("Erro ao adicionar residente:", error);
        });



    document.getElementById("formulario").reset();
}

