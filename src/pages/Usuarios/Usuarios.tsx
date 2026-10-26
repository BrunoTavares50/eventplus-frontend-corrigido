import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";
import type { TipoUsuario, Usuario } from "../../types/api";
import Campo from "../../components/campo/Campo";
import Botao from "../../components/botao/Botao";
import { tipoUsuarioService, usuarioService } from "../../services/eventPlusservice";
import { getApiErrorMessage } from "../../services/api";
import ListaUsuarios from "../../components/listaUsuarios/ListaUsuarios";
import ModalConfirmacao from "../../components/modalConfirmacao/ModalConfirmacao";

import ilustracaoUsuario from "../../assets/ilustracao-usuario.svg";
import lapis from "../../assets/icons/lapis.svg";
import lixeira from "../../assets/icons/lixeira.svg";

import "./Usuarios.css";

interface FormularioUsuario {
    nome: string;
    email: string;
    senha: string;
    idTipoUsuario: string;
}

const inicial: FormularioUsuario = { nome: "", email: "", idTipoUsuario: "", senha: "" };

function Usuarios() {
    const [formulario, setFormulario] = useState(inicial);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [tipos, setTipos] = useState<TipoUsuario[]>([]);
    const [idEmEdicao, setidEmEdicao] = useState<string | null>(null);
    const [selecionado, setSelecionado] = useState<Usuario | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [mensagem, setMensagem] = useState("");

    const [tituloTipo, setTituloTipo] = useState("");
    const [idTipoEmEdicao, setIdTipoEmEdicao] = useState<string | null>(null);
    const [tipoSelecionado, setTipoSelecionado] = useState<TipoUsuario | null>(null);
    const [enviandoTipo, setEnviandoTipo] = useState(false);
    const [mensagemTipo, setMensagemTipo] = useState("");

    const carregar = useCallback(async () => {
        setCarregando(true);
        setMensagem("");
        try {
            const [usuarioApi, tiposApi] = await Promise.all([
                usuarioService.listar(),
                tipoUsuarioService.listar()
            ]);
            setUsuarios(usuarioApi);
            setTipos(tiposApi);
            setFormulario((value) => ({
                ...value,
                idTipoUsuario: value.idTipoUsuario || tiposApi[0]?.idTipoUsuario || ""
            }));
        } catch (error) {
            setMensagem(getApiErrorMessage(error));
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        const timeout = window.setTimeout(() => void carregar(), 0);
        return () => window.clearTimeout(timeout);
    }, [carregar]);

    function atualizar(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setFormulario((value) => ({ ...value, [event.target.name]: event.target.value }));
    }

    function limpar() {
        setFormulario({ ...inicial, idTipoUsuario: tipos[0]?.idTipoUsuario || "" });
        setidEmEdicao(null);
        setMensagem("");
    }

    async function salvar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setEnviando(true);
        setMensagem("");
        try {
            const payload = {
                ...formulario,
                nome: formulario.nome.trim(),
                email: formulario.email.trim(),
                idTipoUsuario: formulario.idTipoUsuario || null
            };

            if (idEmEdicao) await usuarioService.atualizar(idEmEdicao, payload);
            else await usuarioService.cadastrar(payload);
            limpar();
            await carregar();
        } catch (error) {
            setMensagem(getApiErrorMessage(error));
        } finally {
            setEnviando(false);
        }
    }

    function editar(usuario: Usuario) {
        setidEmEdicao(usuario.idUsuario);
        setFormulario({
            nome: usuario.nome,
            email: usuario.email,
            idTipoUsuario: usuario.idTipoUsuario || "",
            senha: ""
        });
        setMensagem("Informe uma nova senha para concluir a edição.");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function excluir() {
        if (!selecionado) return;
        setEnviando(true);
        try {
            await usuarioService.excluir(selecionado.idUsuario);
            if (idEmEdicao === selecionado.idUsuario) limpar();
            setSelecionado(null);
            await carregar();
        } catch (error) {
            setMensagem(getApiErrorMessage(error));
            setSelecionado(null);
        } finally {
            setEnviando(false);
        }
    }

    function limparTipo() {
        setTituloTipo("");
        setIdTipoEmEdicao(null);
        setMensagemTipo("");
    }

    async function salvarTipo(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!tituloTipo.trim()) return;
        setEnviandoTipo(true);
        setMensagemTipo("");
        try {
            if (idTipoEmEdicao) {
                await tipoUsuarioService.atualizar(idTipoEmEdicao, tituloTipo.trim());
            } else {
                await tipoUsuarioService.cadastrar(tituloTipo.trim());
            }
            limparTipo();
            await carregar();
        } catch (error) {
            setMensagemTipo(getApiErrorMessage(error));
        } finally {
            setEnviandoTipo(false);
        }
    }

    function editarTipo(tipo: TipoUsuario) {
        setIdTipoEmEdicao(tipo.idTipoUsuario);
        setTituloTipo(tipo.titulo);
        setMensagemTipo("");
    }

    async function excluirTipo() {
        if (!tipoSelecionado) return;
        setEnviandoTipo(true);
        try {
            await tipoUsuarioService.excluir(tipoSelecionado.idTipoUsuario);
            if (idTipoEmEdicao === tipoSelecionado.idTipoUsuario) limparTipo();
            setTipoSelecionado(null);
            await carregar();
        } catch (error) {
            setMensagemTipo(getApiErrorMessage(error));
            setTipoSelecionado(null);
        } finally {
            setEnviandoTipo(false);
        }
    }

    return (
        <>
            <Header />
            <main className="cadastro-usuario-page">
                <section className="cadastro-usuario-formulario-section">
                    <div className="usuario-secao-titulo">
                        <h1 className="section-title">Administração de usuários</h1>
                        <hr />
                    </div>
                    <div className="cadastro-usuario-conteudo">
                        <img
                            className="cadastro-usuario-ilustracao"
                            src={ilustracaoUsuario}
                            alt="Ilustração de administração de usuários"
                        />
                        <form className="cadastro-usuario-formulario" onSubmit={salvar}>
                            <h2>{idEmEdicao ? "Editar usuário" : "Cadastrar usuário"}</h2>
                            <label className="visually-hidden" htmlFor="usuario-nome">Nome</label>
                            <Campo
                                id="usuario-nome"
                                name="nome"
                                type="text"
                                value={formulario.nome}
                                onChange={atualizar}
                                placeholder="Nome"
                                maxLength={100}
                                required
                            />

                            <label className="visually-hidden" htmlFor="usuario-email">E-mail</label>
                            <Campo
                                id="usuario-email"
                                name="email"
                                type="email"
                                value={formulario.email}
                                onChange={atualizar}
                                placeholder="E-mail"
                                required
                            />

                            <div className="cadastro-usuario-grid">
                                <div className="cadastro-usuario-select-wrapper">
                                    <label className="visually-hidden" htmlFor="usuario-tipo">Tipo de usuário</label>
                                    <select
                                        name="idTipoUsuario"
                                        id="usuario-tipo"
                                        className="cadastro-usuario-select"
                                        value={formulario.idTipoUsuario}
                                        onChange={atualizar}
                                        required
                                    >
                                        <option value="" disabled>Tipo de Usuário</option>
                                        {tipos.map((tipo) => (
                                            <option value={tipo.idTipoUsuario} key={tipo.idTipoUsuario}>
                                                {tipo.titulo}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="cadastro-usuario-select-seta" aria-hidden="true">⌄</span>
                                </div>
                                <div>
                                    <label className="visually-hidden" htmlFor="usuario-senha">Senha</label>
                                    <Campo
                                        id="usuario-senha"
                                        name="senha"
                                        type="password"
                                        value={formulario.senha}
                                        onChange={atualizar}
                                        placeholder={idEmEdicao ? "Nova Senha" : "Senha"}
                                        minLength={8}
                                        maxLength={60}
                                        required
                                    />
                                </div>
                            </div>

                            <Botao
                                texto={enviando ? "Salvando..." : idEmEdicao ? "Salvar" : "Cadastrar"}
                                type="submit"
                                disabled={enviando}
                            />
                            {idEmEdicao ? (
                                <button className="cadastro-usuario-cancelar" type="button" onClick={limpar}>
                                    Cancelar Edição
                                </button>
                            ) : null}
                            {mensagem ? (
                                <p className="cadastro-usuario-mensagem" role="alert">
                                    {mensagem}
                                </p>
                            ) : null}
                        </form>
                    </div>
                </section>

                <ListaUsuarios
                    usuarios={usuarios}
                    idEmEdicao={idEmEdicao}
                    carregando={carregando}
                    onEditar={editar}
                    onExcluir={setSelecionado}
                />

                <section className="tipo-usuario-section">
                    <div className="usuario-secao-titulo">
                        <h2 className="section-title">Tipos de Usuário</h2>
                        <hr />
                    </div>

                    <form className="tipo-usuario-formulario" onSubmit={salvarTipo}>
                        <div className="tipo-usuario-linha">
                            <label className="visually-hidden" htmlFor="tipo-usuario-titulo">
                                Título do tipo de usuário
                            </label>
                            <Campo
                                id="tipo-usuario-titulo"
                                name="tituloTipo"
                                type="text"
                                value={tituloTipo}
                                onChange={(event) => setTituloTipo(event.target.value)}
                                placeholder="Título do tipo de usuário (ex.: Administrador, Comum)"
                                maxLength={100}
                                required
                            />
                            <Botao
                                texto={enviandoTipo ? "Salvando..." : idTipoEmEdicao ? "Salvar" : "Cadastrar"}
                                type="submit"
                                disabled={enviandoTipo}
                            />
                            {idTipoEmEdicao ? (
                                <button className="cadastro-usuario-cancelar" type="button" onClick={limparTipo}>
                                    Cancelar
                                </button>
                            ) : null}
                        </div>
                        {mensagemTipo ? (
                            <p className="cadastro-usuario-mensagem" role="alert">
                                {mensagemTipo}
                            </p>
                        ) : null}
                    </form>

                    <div className="lista-tipos-conteudo">
                        <div className="lista-tipos-tabela-wrapper">
                            <table className="lista-usuarios-tabela">
                                <thead>
                                    <tr>
                                        <th>Título</th>
                                        <th>Editar</th>
                                        <th>Excluir</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {carregando ? (
                                        <tr>
                                            <td colSpan={3} className="lista-tipos-tabela-vazia">
                                                Carregando...
                                            </td>
                                        </tr>
                                    ) : null}
                                    {!carregando && tipos.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="lista-tipos-tabela-vazia">
                                                Nenhum tipo de usuário cadastrado
                                            </td>
                                        </tr>
                                    ) : null}
                                    {!carregando &&
                                        tipos.map((tipo) => (
                                            <tr
                                                className={
                                                    idTipoEmEdicao === tipo.idTipoUsuario
                                                        ? "lista-tipos-linha-ativa"
                                                        : ""
                                                }
                                                key={tipo.idTipoUsuario}
                                            >
                                                <td>{tipo.titulo}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="lista-tipos-acao"
                                                        aria-label={`Editar ${tipo.titulo}`}
                                                        onClick={() => editarTipo(tipo)}
                                                    >
                                                        <img src={lapis} alt="icone de editar" />
                                                    </button>
                                                </td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="lista-tipos-acao"
                                                        aria-label={`Excluir ${tipo.titulo}`}
                                                        onClick={() => setTipoSelecionado(tipo)}
                                                    >
                                                        <img src={lixeira} alt="icone de excluir" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <ModalConfirmacao
                    show={Boolean(selecionado)}
                    titulo="Excluir usuário"
                    mensagem={selecionado ? `Deseja excluir "${selecionado.nome}"?` : ""}
                    textoConfirmar={enviando ? "Excluindo..." : "Excluir"}
                    textoCancelar="Cancelar"
                    onClose={() => setSelecionado(null)}
                    onConfirm={() => void excluir()}
                />

                <ModalConfirmacao
                    show={Boolean(tipoSelecionado)}
                    titulo="Excluir tipo de usuário"
                    mensagem={tipoSelecionado ? `Deseja excluir o tipo "${tipoSelecionado.titulo}"?` : ""}
                    textoConfirmar={enviandoTipo ? "Excluindo..." : "Excluir"}
                    textoCancelar="Cancelar"
                    onClose={() => setTipoSelecionado(null)}
                    onConfirm={() => void excluirTipo()}
                />
            </main>
            <Footer />
        </>
    );
}

export default Usuarios;
