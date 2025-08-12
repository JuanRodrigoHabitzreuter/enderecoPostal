const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Objeto para armazenar os CEPs consultados em memória
const cepCache = {};

// Função para validar e formatar o CEP
function formatAndValidateCEP(cep) {
  const cleanedCEP = cep.replace(/\D/g, "");
  if (cleanedCEP.length !== 8) {
    throw new Error("CEP inválido. Deve conter 8 dígitos.");
  }
  return cleanedCEP.replace(/(\d{5})(\d{3})/, "$1-$2");
}

// Rota inicial
app.get("/api", (req, res) => {
  res.json({ message: "Olá do backend!" });
});

// Rota para consultar o ViaCEP
app.get("/api/cep/:cep", async (req, res) => {
  const { cep } = req.params;

  try {
    const formattedCEP = formatAndValidateCEP(cep);

    if (cepCache[formattedCEP]) {
      console.log(`CEP ${formattedCEP} recuperado do cache.`);
      return res.json(cepCache[formattedCEP]);
    }

    const response = await axios.get(
      `https://viacep.com.br/ws/${formattedCEP}/json/`
    );

    // Verifica se a resposta contém erro (ex: CEP não encontrado)
    if (response.data.erro) {
      throw new Error("CEP não encontrado.");
    }

    cepCache[formattedCEP] = response.data;
    console.log(`CEP ${formattedCEP} armazenado no cache.`);
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao consultar o ViaCEP:", error.message);
    res.status(404).json({ error: error.message }); // Retorna 404 se o CEP não for encontrado
  }
});

// Rota para retornar todos os CEPs consultados com ordenação
app.get("/api/ceps", (req, res) => {
  const { sortBy, order } = req.query; // Parâmetros de consulta

  let ceps = Object.values(cepCache); // Retorna um array com todos os CEPs armazenados

  // Função de comparação para ordenação
  const compareFunction = (a, b) => {
    let fieldA, fieldB;

    // Comparando cidade, bairro, estado e CEP conforme a ordem hierárquica
    if (a.localidade === b.localidade) {
      if (a.bairro === b.bairro) {
        if (a.uf === b.uf) {
          // Comparação pelo CEP quando todos os outros campos forem iguais
          fieldA = a.cep;
          fieldB = b.cep;
        } else {
          // Se os estados forem diferentes, compara os estados
          fieldA = a.uf;
          fieldB = b.uf;
        }
      } else {
        // Se os bairros forem diferentes, compara os bairros
        fieldA = a.bairro;
        fieldB = b.bairro;
      }
    } else {
      // Se as cidades forem diferentes, compara as cidades
      fieldA = a.localidade;
      fieldB = b.localidade;
    }

    // Ordenação crescente ou decrescente
    if (order === "desc") {
      return fieldA < fieldB ? 1 : fieldA > fieldB ? -1 : 0; // Ordem decrescenteF
    }
    return fieldA > fieldB ? 1 : fieldA < fieldB ? -1 : 0; // Ordem crescente
  };

  // Ordena os CEPs se sortBy for fornecido
  if (sortBy) {
    ceps.sort(compareFunction);
  }

  res.json(ceps); // Retorna os CEPs ordenados como resposta da requisição
});

// Iniciando o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
