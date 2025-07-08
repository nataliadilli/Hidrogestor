require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// Configuração da porta de execução do servidor Node
const PORT = 3000;

// Configuracao do servidor node
app.use(cors());
app.use(bodyParser.json());

// Criando o objeto de conexao
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Conectando com o banco de dados
db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao MySQL:", err);
    return;
  }
  console.log("Conectado ao MySQL");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// ROTAS

//Listagem de usuarios

//GET
app.get("/listarUsuarios", (req, res) => {
  db.query("SELECT * FROM tb_residente", (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json({ error: "Residente não encontrado" });
    res.json(results);
  });
});

// Rota de login 

//POST
app.post("/login", (req, res) => {
  const { nome, senha } = req.body;

  // Consulta segura para verificar credenciais
  db.query("SELECT * FROM tb_residente WHERE tx_nome = ? AND tx_senha = ?", [nome, senha], (err, results) => {
    if (err) {
      console.error("Erro na verificação de login:", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }

    if (results.length > 0) {
      const usuario = results[0];
      delete usuario.tx_senha;
      return res.json({
        message: "Login bem-sucedido",
        usuario: usuario
      });
    } else {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }
  });
});

// Cadastro de usuarios

//POST
app.post("/gravarNovoUsuario", (req, res) => {

  const { nome, nr_unidadeconsumidora, tipo_usuario, senha, data_cadastro } = req.body;
  db.query("INSERT INTO tb_residente( tx_nome, nr_unidadeconsumidora, tipo_usuario, tx_senha, data_cadastro) VALUES(?, ?, ?, ?, ?);", [nome, nr_unidadeconsumidora, tipo_usuario, senha, data_cadastro], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Novo usuario adicionado", id: results.insertId });
  });
});

//Exclusão de usuarios

//DELETE
app.delete("/excluirUsuario/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM tb_residente WHERE id_residente = ?", [id], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.affectedRows === 0) return res.status(404).json({ error: "Residente não encontrado" });
    res.json({ message: "Residente excluido com sucesso" });
  });
});

//GET
app.get("/listarFaturas/:id", (req, res) => {
  const id = req.params.id;

  db.query("select fatura.nr_mes mesLido,fatura.vl_fatura valorFatura, fatura.dt_leitura dataLeitura from tb_fatura fatura inner join tb_residente residente on residente.id_residente = fatura.cd_residente where residente.nr_unidadeconsumidora = ?", [id], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json({ error: "Residente não encontrado" });
    res.json(results);
  });
});

