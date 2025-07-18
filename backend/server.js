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
    const { nome, nr_unidadeconsumidora, cpf, tipo_usuario, senha, data_cadastro } = req.body;
    
    db.query("INSERT INTO tb_residente(tx_nome, nr_unidadeconsumidora, tx_cpf, tipo_usuario, tx_senha, data_cadastro) VALUES(?, ?, ?, ?, ?, ?)", 
    [nome, nr_unidadeconsumidora, cpf, tipo_usuario, senha, data_cadastro], (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: "CPF ou Unidade Consumidora já cadastrados" });
            }
            return res.status(500).json(err);
        }
        res.json({ message: "Novo usuario adicionado", id: results.insertId });
    });
});

// Endpoint para verificar duplicatas 
app.post("/verificarDuplicatas", (req, res) => {
    const { cpf, nr_unidadeconsumidora, nome } = req.body;

    // Verificar CPF
    db.query("SELECT COUNT(*) as count FROM tb_residente WHERE tx_cpf = ?", [cpf], (err, cpfResults) => {
        if (err) return res.status(500).json({ erro: true });

        // Verificar Unidade Consumidora
        db.query("SELECT COUNT(*) as count FROM tb_residente WHERE nr_unidadeconsumidora = ?", [nr_unidadeconsumidora], (err, unidadeResults) => {
            if (err) return res.status(500).json({ erro: true });

            // Verificar Nome
            db.query("SELECT COUNT(*) as count FROM tb_residente WHERE tx_nome = ?", [nome], (err, nomeResults) => {
                if (err) return res.status(500).json({ erro: true });

                // Verificar total de contadores
                db.query("SELECT COUNT(*) as count FROM tb_residente WHERE tipo_usuario = 0", (err, contadorResults) => {
                    if (err) return res.status(500).json({ erro: true });

                    res.json({
                        cpf_existe: cpfResults[0].count > 0,
                        unidade_existe: unidadeResults[0].count > 0,
                        nome_existe: nomeResults[0].count > 0,
                        total_contadores: contadorResults[0].count
                    });
                });
            });
        });
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

  db.query("select fatura.nr_mes mesLido,fatura.vl_fatura valorFatura, fatura.dt_leitura dataLeitura from tb_fatura fatura where fatura.nr_unidadeconsumidora = ? order by nr_mes asc", [id], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json({ error: "Residente não encontrado" });
    res.json(results);
  });
});

app.post("/gravarNovaLeitura", (req, res) => {
  let { nr_unidadeconsumidora, qt_consumo, nr_mes, data_registro } = req.body;

  let calculoFatura = qt_consumo * 45.72;

  console.log("Registrando leitura...");

  db.query(
    "INSERT INTO tb_leitura(nr_unidadeconsumidora, qt_consumo, nr_mes, data_registro) VALUES(?, ?, ?, ?)",
    [nr_unidadeconsumidora, qt_consumo, nr_mes, data_registro],
    (err, results) => {
      if (err) {
        console.error("Erro ao gravar leitura:", err);
        return res.status(500).json({ erro: "Erro ao gravar leitura", detalhes: err });
      }

      console.log("Leitura registrada. Criando fatura...");

      db.query(
        "INSERT INTO tb_fatura(nr_mes, vl_fatura, nr_unidadeconsumidora) VALUES(?, ?, ?);",
        [nr_mes, calculoFatura, nr_unidadeconsumidora],
        (err2, results2) => {
          if (err2) {
            console.error("Erro ao gravar fatura:", err2);
            return res.status(500).json({ erro: "Erro ao gravar fatura", detalhes: err2 });
          }

          console.log("Fatura criada com sucesso");
          res.json({ message: "Nova leitura e fatura adicionadas com sucesso" });
        }
      );
    }
  );
});

app.get("/listarLeitura/:id", (req, res) => {
  const id = req.params.id;

  db.query("select qt_consumo as quantidadeConsumida, nr_mes as mesLido, data_registro as dataLeitura from tb_leitura tl where tl.nr_unidadeconsumidora = ? order by nr_mes asc;", [id], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json({ error: "Leitura não encontrado" });
    res.json(results);
  });
});