# 💧 Sistema de Leitura e Faturamento de Água

Este repositório contém os diagramas de um sistema completo para gerenciamento de leituras de hidrômetro, cadastro de usuários, geração de faturas e controle de consumo de água em uma comunidade.

---

## 📚 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Diagramas do Sistema](#diagramas-do-sistema)
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
- **Banco de Dados:** MySQL.
---

🧩 Diagramas do Sistema
Todos os diagramas estão organizados na pasta docs/diagramas:

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

Projeto desenvolvido para [Curso de análise e desenvolvimento de sistemas /Universidade do Oeste de Santa Catarina– UNOESC/Comunidade Olho D'Água].

# Como utilizar

create database gestor;
drop table tb_fatura;
drop table tb_leitura;
drop table tb_residente;

CREATE TABLE tb_residente (
    id_residente INT auto_increment primary key,
    tx_nome VARCHAR(150) not null,
    nr_unidadeconsumidora VARCHAR(150) not null,
    tipo_usuario BOOLEAN NOT NULL DEFAULT 1,
    tx_senha VARCHAR(255) NOT null,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tb_leitura (
   id_registroconsumo INT AUTO_INCREMENT PRIMARY KEY,
   nr_unidadeconsumidora VARCHAR(150) NOT NULL,
   qt_consumo DECIMAL(10,2) NOT NULL,
   nr_mes TINYINT NOT NULL CHECK (nr_mes BETWEEN 1 AND 12),
   data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   UNIQUE (nr_unidadeconsumidora, nr_mes)
);

CREATE TABLE tb_fatura (
   id_fatura INT AUTO_INCREMENT PRIMARY KEY,
   nr_mes TINYINT NOT NULL CHECK (nr_mes BETWEEN 1 AND 12),
   dt_leitura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   vl_fatura numeric(18,2) NOT NULL,
   nr_unidadeconsumidora VARCHAR(150) NOT NULL
);

