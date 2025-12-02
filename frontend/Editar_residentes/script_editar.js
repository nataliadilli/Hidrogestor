document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert('ID do residente não encontrado.');
        window.location.href = '../Lista_residentes/index_lista.html';
        return;
    }

    const form = document.getElementById('edit-form');

    // Carregar dados do residente
    try {
        const response = await fetch(`https://hidrogestor-api.onrender.com/listarUsuarios`);
        if (!response.ok) throw new Error('Erro ao carregar dados dos residentes.');

        const residentes = await response.json();
        const residente = residentes.find(r => r.id_residente == id);

        if (!residente) {
            throw new Error('Residente não encontrado.');
        }

        form.nome.value = residente.tx_nome;
        form.nr_unidadeconsumidora.value = residente.nr_unidadeconsumidora;
        form.cpf.value = residente.tx_cpf;
    } catch (error) {
        console.error(error);
        alert('Erro ao carregar dados do residente.');
        window.location.href = '../Lista_residentes/index_lista.html';
    }

    // Atualizar dados do residente
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const updatedData = {
            nome: form.nome.value,
            nr_unidadeconsumidora: form.nr_unidadeconsumidora.value,
            cpf: form.cpf.value
        };

        try {
            const response = await fetch(`https://hidrogestor-api.onrender.com/atualizarUsuario/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) throw new Error('Erro ao atualizar residente.');

            alert('Residente atualizado com sucesso!');
            window.location.href = '../Lista_residentes/index_lista.html';
        } catch (error) {
            console.error(error);
            alert('Erro ao atualizar residente.');
        }
    });
});

