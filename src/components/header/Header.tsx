import { Link, NavLink, useNavigate } from "react-router-dom"

import logoEvent from "../../assets/logo-event.svg"
import "./Header.css"
import { useAuth } from "../../context/auth"

function Header() {
    const { autenticado, logout } = useAuth();

    const navigate = useNavigate();

    function sair() {
        logout();
        navigate("/Login");
    }

    return (
        <header className="header">
            <div className="header-conteudo">
                <Link to="/home">
                    <img src={logoEvent} alt="Logo Event+" />
                </Link>

                <nav>
                    <NavLink to="/home">Home</NavLink>
                    <NavLink to="/eventos">Eventos</NavLink>
                    <NavLink to="/usuarios">Usuarios</NavLink>
                    <Link to="/home#contato">Contatos</Link>
                </nav>

                {autenticado ?
                    <>
                        <Link to="/conta">Minha Conta</Link>
                        <Link onClick={sair} to="/login">Sair</Link>
                    </>
                    :
                    <Link to="/login">Entrar</Link>
                }
            </div>
        </header>
    )
}

export default Header;