import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { eventoService, instituicaoService, tipoEventoService } from "../../services/eventPlusservice";
import { getApiErrorMessage } from "../../services/api";
import type { Evento, instituicao, TipoEvento } from "../../types/api";

import ilustracaoEvento from "../../assets/ilustracao-evento.svg";
import relogio from "../../assets/icons/relogio.svg";
import uploadIcon from "../../assets/icons/upload.svg";

import "./Eventos.css";

import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import CardEvento from "../../components/cardEvento/CardEvento";
import Campo from "../../components/campo/Campo";
import Botao from "../../components/botao/Botao";

interface FormularioEvento {
    nomeEvento: string;
    dataEvento: string;
    descricao: string;
    idTipoEvento: string;
    idInstituicao: string;
}

const inicial: FormularioEvento = {
    nomeEvento: "",
    dataEvento: "",
    descricao: "",
    idTipoEvento: "",
    idInstituicao: ""
};

function Eventos() {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
    const [instituicoes, setInstituicoes] = useState<instituicao[]>([]);
    const [formulario, setFormulario] = useState<FormularioEvento>(inicial);
    const [arquivoImagem, setArquivoImagem] = useState<File | null>(null);
    const [enviando, setEnviando] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const inputArquivoRef = useRef<HTMLInputElement | null>(null);

    const carregar = useCallback(async () => {
        try {
            const [eventosApi, tiposApi, instituicoesApi] = await Promise.all([
                eventoService.listar().catch(() => [] as Evento[]),
                tipoEventoService.listar().catch(() => [] as TipoEvento[]),
                instituicaoService.listar().catch(() => [] as instituicao[])
            ]);

            setEventos(eventosApi);
            setTiposEvento(tiposApi);
            setInstituicoes(instituicoesApi);
        } catch {
            setEventos([]);
        }
    }, []);

    useEffect(() => {
        const timeout = window.setTimeout(() => void carregar(), 0);
        return () => window.clearTimeout(timeout);
    }, [carregar]);

    function atualizar(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = event.target;
        setFormulario((anterior) => ({ ...anterior, [name]: value }));
    }

    function selecionarImagem(event: ChangeEvent<HTMLInputElement>) {
        const arquivo = event.target.files?.[0] ?? null;
        setArquivoImagem(arquivo);
    }

    function limparFormulario() {
        setFormulario(inicial);
        setArquivoImagem(null);
        if (inputArquivoRef.current) {
            inputArquivoRef.current.value = "";
        }
    }

    async function salvar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setEnviando(true);
        setMensagem("");

        try {
            await eventoService.cadastrar({
                nomeEvento: formulario.nomeEvento.trim(),
                descricao: formulario.descricao.trim(),
                dataEvento: formulario.dataEvento,
                idTipoEvento: formulario.idTipoEvento || null,
                idInstituicao: formulario.idInstituicao || null,
                arquivoImagem
            });

            limparFormulario();
            setMensagem("Evento cadastrado com sucesso.");
            await carregar();
        } catch (error) {
            setMensagem(getApiErrorMessage(error));
        } finally {
            setEnviando(false);
        }
    }

    return (
        <>
            <Header />
            <main className="pagina-eventos">
                <section className="admin-evento-section">
                    <div className="eventos-secao-titulo">
                        <h1>ADMINISTRAÇÃO EVENTO</h1>
                        <hr />
                    </div>

                    <div className="admin-evento-conteudo">
                        <img
                            className="admin-evento-ilustracao"
                            src={ilustracaoEvento}
                            alt="Ilustração de administração de evento"
                        />

                        <form className="admin-evento-formulario" onSubmit={salvar}>
                            <div className="admin-evento-linha-dupla">
                                <div className="admin-evento-campo-grupo">
                                    <label className="visually-hidden" htmlFor="evento-nome">Nome</label>
                                    <Campo
                                        id="evento-nome"
                                        name="nomeEvento"
                                        type="text"
                                        value={formulario.nomeEvento}
                                        onChange={atualizar}
                                        placeholder="Nome"
                                        maxLength={100}
                                        required
                                    />
                                </div>

                                <div className="admin-evento-campo-data">
                                    <img src={relogio} alt="" className="admin-evento-icone-relogio" />
                                    <label className="visually-hidden" htmlFor="evento-data">Data e hora do evento</label>
                                    <Campo
                                        id="evento-data"
                                        name="dataEvento"
                                        type="datetime-local"
                                        value={formulario.dataEvento}
                                        onChange={atualizar}
                                        placeholder="29/08/2026 - 17:00"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="admin-evento-campo-grupo">
                                <label className="visually-hidden" htmlFor="evento-descricao">Descrição</label>
                                <Campo
                                    id="evento-descricao"
                                    name="descricao"
                                    type="text"
                                    value={formulario.descricao}
                                    onChange={atualizar}
                                    placeholder="Descrição"
                                    required
                                />
                            </div>

                            <div className="admin-evento-linha-dupla">
                                <div className="admin-evento-select-wrapper">
                                    <label className="visually-hidden" htmlFor="evento-tipo">Tipo de Evento</label>
                                    <select
                                        id="evento-tipo"
                                        name="idTipoEvento"
                                        className={`admin-evento-select ${!formulario.idTipoEvento ? "placeholder" : ""}`}
                                        value={formulario.idTipoEvento}
                                        onChange={atualizar}
                                        required
                                    >
                                        <option value="" disabled>Tipo de Evento</option>
                                        {tiposEvento.map((tipo) => (
                                            <option key={tipo.idTipoEvento} value={tipo.idTipoEvento}>
                                                {tipo.titulo}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="admin-evento-select-seta" aria-hidden="true">⌄</span>
                                </div>

                                <div className="admin-evento-select-wrapper">
                                    <label className="visually-hidden" htmlFor="evento-instituicao">Instituição</label>
                                    <select
                                        id="evento-instituicao"
                                        name="idInstituicao"
                                        className={`admin-evento-select ${!formulario.idInstituicao ? "placeholder" : ""}`}
                                        value={formulario.idInstituicao}
                                        onChange={atualizar}
                                        required
                                    >
                                        <option value="" disabled>Instituição</option>
                                        {instituicoes.map((inst) => (
                                            <option key={inst.idInstituicao} value={inst.idInstituicao}>
                                                {inst.nomeFantasia}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="admin-evento-select-seta" aria-hidden="true">⌄</span>
                                </div>
                            </div>

                            <label className="admin-evento-upload" htmlFor="evento-foto">
                                <span className={arquivoImagem ? "admin-evento-upload-texto selecionado" : "admin-evento-upload-texto"}>
                                    {arquivoImagem ? arquivoImagem.name : "Foto"}
                                </span>
                                <img src={uploadIcon} alt="" className="admin-evento-icone-upload" />
                                <input
                                    ref={inputArquivoRef}
                                    id="evento-foto"
                                    type="file"
                                    accept="image/*"
                                    onChange={selecionarImagem}
                                />
                            </label>

                            <Botao
                                className="admin-evento-botao"
                                texto={enviando ? "Cadastrando..." : "Cadastrar"}
                                type="submit"
                                disabled={enviando}
                            />

                            {mensagem ? (
                                <p className="admin-evento-mensagem" role="status">
                                    {mensagem}
                                </p>
                            ) : null}
                        </form>
                    </div>
                </section>

                <section className="container-eventos">
                    <div className="eventos-secao-titulo">
                        <h2>EVENTOS</h2>
                        <hr />
                    </div>

                    <div className="eventos">
                        {eventos.map((evento) => (
                            <CardEvento
                                key={evento.idEvento}
                                id={evento.idEvento}
                                imagem={evento.imagemUrl}
                                categoria={evento.idTipoEventoNavigation?.titulo}
                                titulo={evento.nomeEvento || evento.nome || ""}
                                descricao={evento.descricao}
                            />
                        ))}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

export default Eventos;
