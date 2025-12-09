# 💧 Sistema de Leitura e Faturamento de Água

Este repositório contém os diagramas de um sistema completo para gerenciamento de leituras de hidrômetro, cadastro de usuários, geração de faturas e controle de consumo de água em uma comunidade.

---

## 📚 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Diagramas do Sistema e Apresentação](#diagramas-do-sistema)
- [Autores](#autores)

---

## 🧾 Sobre o Projeto

O sistema permite:

- Cadastro de moradores e residências;
- Registro de leituras mensais dos hidrômetros;
- Geração automática de faturas com base no consumo;
- Relatórios de consumo por residência;
- Interface intuitiva para administradores da comunidade.

---

## 🛠 Tecnologias Utilizadas

- **Frontend:** HTML, CSS, JavaScript;
- **Backend:** Node.js;
- **Banco de Dados:** PostgreSQL.
---

## 🧩 Diagramas do Sistema

Todos os diagramas e a apresentação estão organizados na pasta docs:

**Apresentação**

**Diagramas de Atividade:** Fluxo de processos do sistema;

**Casos de Uso:** Funcionalidades principais e interações dos usuários;

**Diagrama de Classes:** Estrutura de classes e relacionamentos;

**Diagrama ER:** Modelo lógico do banco de dados;

**Diagramas de Sequência:** Fluxo de mensagens entre os componentes para cada funcionalidade (leitura, cadastro, fatura).

---

👨‍💻 Autores

Gabriela Aparecida Zanette Nunez;

Giovani Pedro Zanatta;

Natália Carolina Dilli;

Luiz Felipe Degani Demarck;

Projeto desenvolvido para [Curso de análise e desenvolvimento de sistemas /Universidade do Oeste de Santa Catarina– UNOESC/Comunidade Olho D'Água].

## 🗃️ Criação do banco de dados

```sql
CREATE DATABASE gestor;
```

## 📋 Tabelas

### `tb_residente`

```sql
CREATE TABLE tb_residente (
    id_residente INT auto_increment primary key,
    tx_nome VARCHAR(150) NOT NULL,
    nr_unidadeconsumidora VARCHAR(150) NOT NULL,
    tx_cpf VARCHAR(14) NOT NULL,
    tipo_usuario BOOLEAN NOT NULL DEFAULT 1,
    tx_senha VARCHAR(255) NOT NULL,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (nr_unidadeconsumidora, tx_cpf)
);
```

### `tb_leitura`

```sql
CREATE TABLE tb_leitura (
    id_registroconsumo INT AUTO_INCREMENT PRIMARY KEY,
    nr_unidadeconsumidora VARCHAR(150) NOT NULL,
    qt_consumo DECIMAL(10,2) NOT NULL,
    nr_mes TINYINT NOT NULL CHECK (nr_mes BETWEEN 1 AND 12),
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (nr_unidadeconsumidora, nr_mes)
);
```

### `tb_fatura`

```sql
CREATE TABLE tb_fatura (
    id_fatura INT AUTO_INCREMENT PRIMARY KEY,
    nr_mes TINYINT NOT NULL CHECK (nr_mes BETWEEN 1 AND 12),
    dt_leitura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    vl_fatura numeric(18,2) NOT NULL,
    nr_unidadeconsumidora VARCHAR(150) NOT NULL
);
```

## 🔍 Consultas

Para visualizar os dados:

```sql
select * from tb_residente;
select * from tb_leitura;
select * from tb_fatura;
```

---

📝 Observações

- As tabelas tb_residente e tb_leitura possuem restrições de unicidade para evitar duplicações
- O campo tipo_usuario utiliza valor padrão 1 (ativo)
- Todos os campos de data utilizam TIMESTAMP com valor padrão CURRENT_TIMESTAMP
- Os valores monetários são armazenados como DECIMAL para precisão


