const API_BASE_URL = 'https://hidrogestor-api.onrender.com';

// Variáveis globais
let faturasData = [];
let leiturasData = [];


function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) return "Data inválida";

    return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}


function createFaturaItem(fatura) {
    return `
        <li>
            <strong>Mês:</strong> ${String(fatura.meslido).padStart(2,'0')} <br>
            <strong>Valor:</strong> R$ ${Number(fatura.valorfatura).toFixed(2)} <br>
            <strong>Data Leitura:</strong> ${formatDate(fatura.dataleitura)}
        </li>
    `;
}

function createLeituraItem(leitura) {
    return `
        <li>
            <strong>Mês:</strong> ${String(leitura.meslido).padStart(2,'0')} <br>
            <strong>Consumo:</strong> ${leitura.quantidadeconsumida} m³ <br>
            <strong>Data Registro:</strong> ${formatDate(leitura.dataleitura)}
        </li>
    `;
}


async function fetchFaturas(nrUC) {
    const response = await fetch(`${API_BASE_URL}/listarFaturas/${nrUC}`);

    if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error(`Erro HTTP: ${response.status}`);
    }

    return await response.json();
}

async function fetchLeituras(nrUC) {
    const response = await fetch(`${API_BASE_URL}/listarLeitura/${nrUC}`);

    if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error(`Erro HTTP: ${response.status}`);
    }

    return await response.json();
}


async function loadData() {
    const listaFaturas = document.getElementById("listaFaturas");
    const listaLeituras = document.getElementById("listaLeituras");

    listaFaturas.innerHTML = "<li>Carregando faturas...</li>";
    listaLeituras.innerHTML = "<li>Carregando leituras...</li>";

    try {
        const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
        if (!usuarioLogado) {
            listaFaturas.innerHTML = "<li>Usuário não encontrado.</li>";
            listaLeituras.innerHTML = "<li>Usuário não encontrado.</li>";
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const nrUC = Number(params.get("id"));

        // Busca paralela (melhor performance)
        const [faturas, leituras] = await Promise.all([
            fetchFaturas(nrUC),
            fetchLeituras(nrUC)
        ]);

        // Renderização Faturas
        if (faturas.length === 0) {
            listaFaturas.innerHTML = "<li>Nenhuma fatura encontrada.</li>";
        } else {
            listaFaturas.innerHTML = faturas.map(createFaturaItem).join("");
        }

        // Renderização Leituras
        if (leituras.length === 0) {
            listaLeituras.innerHTML = "<li>Nenhuma leitura encontrada.</li>";
        } else {
            listaLeituras.innerHTML = leituras.map(createLeituraItem).join("");
        }

    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        listaFaturas.innerHTML = "<li>Erro ao carregar faturas.</li>";
        listaLeituras.innerHTML = "<li>Erro ao carregar leituras.</li>";
    }
}


document.addEventListener("DOMContentLoaded", loadData);
