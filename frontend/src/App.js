import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input, Button, Table, Typography, Select } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "antd/dist/reset.css";
import "./App.css";

const { Title } = Typography;
const { Option } = Select;

function App() {
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cepsConsultados, setCepsConsultados] = useState([]);
  const [ordenacao, setOrdenacao] = useState({
    campo: "localidade",
    ordem: "asc",
  });

  // Função para exibir notificações
  const mostrarNotificacao = (tipo, mensagem, descricao) => {
    if (tipo === "success") {
      toast.success(mensagem, { description: descricao });
    } else if (tipo === "error") {
      toast.error(mensagem, { description: descricao });
    }
  };

  // Função para buscar o endereço pelo CEP
  const buscarEndereco = async () => {
    if (!cep || cep.length !== 8) {
      mostrarNotificacao(
        "error",
        "Por favor, insira um CEP válido com 8 dígitos.",
        "Erro"
      );
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/cep/${cep}`);
      setEndereco(response.data);
      mostrarNotificacao(
        "success",
        "Endereço encontrado com sucesso!",
        "Sucesso"
      );
      buscarCepsConsultados(); // Atualiza a lista de CEPs consultados
    } catch (error) {
      mostrarNotificacao(
        "error",
        "Erro ao buscar o endereço. Verifique o CEP e tente novamente.",
        "Erro"
      );
      setEndereco(null);
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar todos os CEPs consultados
  const buscarCepsConsultados = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/ceps");
      setCepsConsultados(response.data);
    } catch (error) {
      console.error("Erro ao buscar CEPs consultados:", error);
      toast.error(
        "Erro ao buscar CEPs consultados. Tente novamente mais tarde."
      );
    }
  };

  // Função para ordenar os CEPs consultados
  const ordenarCeps = (campo, ordem) => {
    const cepsOrdenados = [...cepsConsultados].sort((a, b) => {
      if (a[campo] < b[campo]) return ordem === "asc" ? -1 : 1;
      if (a[campo] > b[campo]) return ordem === "asc" ? 1 : -1;
      return 0;
    });
    setCepsConsultados(cepsOrdenados);
  };

  // Efeito para aplicar a ordenação quando o estado de ordenação mudar
  useEffect(() => {
    ordenarCeps(ordenacao.campo, ordenacao.ordem);
  }, [ordenacao]);

  // Efeito para buscar os CEPs consultados ao carregar a página
  useEffect(() => {
    buscarCepsConsultados();
  }, []);

  // Colunas da tabela
  const columns = [
    { title: "CEP", dataIndex: "cep", key: "cep" },
    { title: "Logradouro", dataIndex: "logradouro", key: "logradouro" },
    { title: "Bairro", dataIndex: "bairro", key: "bairro" },
    { title: "Cidade", dataIndex: "localidade", key: "localidade" },
    { title: "Estado", dataIndex: "uf", key: "uf" },
  ];

  return (
    <div className="App" style={{ padding: "5px" }}>
      <img
        src={require("./img/brasil.gif")}
        alt="Logo Fixo"
        style={{
          position: "fixed",
          top: "5px",
          left: "",
          height: "350px",
          zIndex: 1000,
        }}
      />

      <img
        src={require("./img/placa-de-direcao.gif")}
        alt="Logo Fixo"
        style={{
          position: "fixed",
          top: "200px",
          right: "5px", // posiciona no canto direito
          height: "320px",
          zIndex: 1000,
        }}
      />
      <Title
        level={2}
        style={{
          textAlign: "center",
          marginBottom: "px",
          color: "darkblue",
          fontWeight: "bold",
        }}
      >
        Consulta de CEP
      </Title>

      <div style={{ maxWidth: "400px", margin: "20px auto" }}>
        <Input
          placeholder="Digite o CEP (apenas números)"
          value={cep}
          onChange={(e) => setCep(e.target.value.replace(/\D/g, ""))}
          maxLength={8}
          style={{ marginBottom: "10px" }}
        />

        <Button type="primary" onClick={buscarEndereco} loading={loading} block>
          <img
            src={require("./img/brasil.gif")}
            alt="Logo CEP"
            style={{ height: "0px", width: "auto" }} // aumenta o tamanho
          />
          Buscar Endereço
        </Button>
      </div>

      {endereco && (
        <div style={{ maxWidth: "400px", margin: "20px auto" }}>
          <Title
            level={4}
            style={{
              backgroundcolor: "black",
              fontWeight: "bold",
              marginTop: "20px",
              backgroundColor: "yellow",
            }}
          >
            Endereço Encontrado:
          </Title>

          <p>
            <strong>CEP:</strong> {endereco.cep}
          </p>
          <p>
            <strong>Logradouro:</strong> {endereco.logradouro}
          </p>
          <p>
            <strong>Bairro:</strong> {endereco.bairro}
          </p>
          <p>
            <strong>Cidade:</strong> {endereco.localidade}
          </p>
          <p>
            <strong>Estado:</strong> {endereco.uf}
          </p>
        </div>
      )}

      <Title
        level={4}
        style={{ color: "darkblue", margin: "20px auto", marginTop: "20px" }}
      >
        Lista de CEP Encontrados:
      </Title>

      {/* Controles de ordenação */}
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <Select
          defaultValue="localidade"
          style={{ width: 120, marginRight: "10px" }}
          onChange={(value) => setOrdenacao({ ...ordenacao, campo: value })}
        >
          <Option value="cep">CEP</Option>
          <Option value="logradouro">Logradouro</Option>
          <Option value="bairro">Bairro</Option>
          <Option value="localidade">Cidade</Option>
          <Option value="uf">Estado</Option>
        </Select>

        <Button
          onClick={() =>
            setOrdenacao({
              ...ordenacao,
              ordem: ordenacao.ordem === "asc" ? "desc" : "asc",
            })
          }
        >
          Ordenar{" "}
          {ordenacao.ordem === "asc" ? " Descendente ▽" : "Ascendente △"}
        </Button>
      </div>

      <Table
        dataSource={cepsConsultados}
        columns={columns}
        rowKey="cep"
        pagination={{ pageSize: 5 }}
        style={{ maxWidth: "800px", margin: "0 auto" }}
      />
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "DarkBlue",
          color: "white",
          padding: "20px",
          textAlign: "center",
          borderRadius: "5px 5px 0 0",
          boxShadow: "0 -2px 5px rgba(0,0,0,0.2)",
        }}
      >
        <img
          src={require("./img/cep.png")}
          alt="Logo CEP"
          style={{
            height: "27px",
            marginRight: "1px",
            verticalAlign: "middle",
          }}
        />
        Código de Endereçamento Postal - CEP © 2025
      </div>

      {/* Adicione o ToastContainer aqui */}
      <ToastContainer />
    </div>
  );
}

export default App;
