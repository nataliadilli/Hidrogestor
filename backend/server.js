require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Parser } = require("json2csv");

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:3000",  
  "http://localhost:5500",  
  "http://127.0.0.1:5500",
  "https://hidrogestor.onrender.com",
  "https://hidrogestor-api.onrender.com"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(bodyParser.json());

const db = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

db.query("SELECT 1")
  .then(() => console.log("Conectado ao PostgreSQL"))
  .catch((err) => console.error("Erro ao conectar ao PostgreSQL:", err));

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

app.get("/listarUsuarios", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM tb_residente");
    if (rows.length === 0) return res.status(404).json({ error: "Residente não encontrado" });
    res.json(rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post("/login", async (req, res) => {
  const { cpf, senha } = req.body;

  try {
    const { rows } = await db.query(
      "SELECT * FROM tb_residente WHERE tx_cpf = $1 AND tx_senha = $2",
      [cpf, senha]
    );

    if (rows.length > 0) {
      const usuario = rows[0];
      delete usuario.tx_senha;
      return res.json({ message: "Login bem-sucedido", usuario });
    } else {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.post("/gravarNovoUsuario", async (req, res) => {
  const { nome, nr_unidadeconsumidora, cpf, tipo_usuario, senha, data_cadastro } = req.body;

  try {
    const query = `
      INSERT INTO tb_residente(tx_nome, nr_unidadeconsumidora, tx_cpf, tipo_usuario, tx_senha, data_cadastro)
      VALUES($1, $2, $3, $4, $5, $6)
      RETURNING id_residente
    `;

    const values = [nome, nr_unidadeconsumidora, cpf, tipo_usuario, senha, data_cadastro];

    const result = await db.query(query, values);

    res.json({
      message: "Novo usuário adicionado",
      id: result.rows[0].id_residente
    });

  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "CPF ou Unidade Consumidora já cadastrados" });
    }

    res.status(500).json(err);
  }
});

app.post("/verificarDuplicatas", async (req, res) => {
  const { cpf } = req.body;

  try {
    const cpfCheck = await db.query("SELECT COUNT(*) FROM tb_residente WHERE tx_cpf = $1", [cpf]);
    const contadorCheck = await db.query("SELECT COUNT(*) FROM tb_residente WHERE tipo_usuario = 0");

    res.json({
      cpf_existe: Number(cpfCheck.rows[0].count) > 0,
      total_contadores: Number(contadorCheck.rows[0].count)
    });

  } catch (err) {
    res.status(500).json({ erro: true });
  }
});

app.put("/atualizarUsuario/:id", async (req, res) => {
  const id = req.params.id;
  const { nome, nr_unidadeconsumidora, cpf } = req.body;

  try {
    const result = await db.query(
      "UPDATE tb_residente SET tx_nome = $1, nr_unidadeconsumidora = $2, tx_cpf = $3 WHERE id_residente = $4",
      [nome, nr_unidadeconsumidora, cpf, id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: "Residente não encontrado" });

    res.json({ message: "Residente atualizado com sucesso" });

  } catch (err) {
    res.status(500).json(err);
  }
});

app.delete("/excluirUsuario/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const result = await db.query(
      "DELETE FROM tb_residente WHERE id_residente = $1",
      [id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: "Residente não encontrado" });

    res.json({ message: "Residente excluído com sucesso" });

  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/listarFaturas/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const result = await db.query(
      `SELECT fatura.nr_mes AS mesLido, fatura.vl_fatura AS valorFatura, fatura.dt_leitura AS dataLeitura
       FROM tb_fatura fatura
       WHERE fatura.nr_unidadeconsumidora = $1
       ORDER BY nr_mes ASC`,
      [id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Residente não encontrado" });

    res.json(result.rows);

  } catch (err) {
    res.status(500).json(err);
  }
});

app.post("/gravarNovaLeitura", async (req, res) => {
  const { nr_unidadeconsumidora, qt_consumo, nr_mes, data_registro } = req.body;

  try {
    await db.query(
      "INSERT INTO tb_leitura(nr_unidadeconsumidora, qt_consumo, nr_mes, data_registro) VALUES($1, $2, $3, $4)",
      [nr_unidadeconsumidora, qt_consumo, nr_mes, data_registro]
    );

    let mesAnterior = nr_mes > 1 ? nr_mes - 1 : nr_mes;
    let calculoFatura;

    if (nr_mes == 1) {
      calculoFatura = qt_consumo * 8.74;
    } else {
      const consumo = await db.query(
        `SELECT qt_consumo - (
           SELECT qt_consumo FROM tb_leitura WHERE nr_mes = $1 AND nr_unidadeconsumidora = $2
         ) AS consumo
         FROM tb_leitura WHERE nr_unidadeconsumidora = $2 AND nr_mes = $3`,
        [mesAnterior, nr_unidadeconsumidora, nr_mes]
      );

      calculoFatura = Number(consumo.rows[0].consumo) * 8.74;
    }

    await db.query(
      "INSERT INTO tb_fatura(nr_mes, vl_fatura, nr_unidadeconsumidora) VALUES($1, $2, $3)",
      [nr_mes, calculoFatura, nr_unidadeconsumidora]
    );

    res.json({ message: "Nova leitura e fatura adicionadas com sucesso" });

  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/listarLeitura/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const result = await db.query(
      "SELECT qt_consumo AS quantidadeConsumida, nr_mes AS mesLido, data_registro AS dataLeitura FROM tb_leitura WHERE nr_unidadeconsumidora = $1 ORDER BY nr_mes ASC",
      [id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Leitura não encontrada" });

    res.json(result.rows);

  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/exportarLeituras/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const result = await db.query(
      "SELECT qt_consumo AS quantidadeConsumida, nr_mes AS mesLido, data_registro AS dataLeitura FROM tb_leitura WHERE nr_unidadeconsumidora = $1 ORDER BY nr_mes ASC",
      [id]
    );

    if (result.rows.length == 0) {

      return res.status(204).json({ message: "Sem dados para exportar." });
    }

    const json = result.rows;
    const parser = new Parser();
    const csv = parser.parse(json);

    res.header("Content-Type", "text/csv");
    res.attachment(`leituras_${id}.csv`);
    return res.send(csv);

  } catch (err) {
    res.status(500).json({ error: "Erro ao gerar CSV" });
  }
});

app.get("/exportarFaturas/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const result = await db.query(
      `SELECT fatura.nr_mes AS mesLido, fatura.vl_fatura AS valorFatura, fatura.dt_leitura AS dataLeitura
       FROM tb_fatura fatura
       WHERE fatura.nr_unidadeconsumidora = $1
       ORDER BY nr_mes ASC`,
      [id]
    );
    if (result.rows.length == 0) {
      return res.status(204).json({ message: "Sem dados para exportar." });
    }

    const json = result.rows;
    const parser = new Parser();
    const csv = parser.parse(json);

    res.header("Content-Type", "text/csv");
    res.attachment(`leituras_${id}.csv`);
    return res.send(csv);

  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Erro ao gerar CSV" });
  }
});
