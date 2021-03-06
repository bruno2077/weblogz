// Componente de cabeçalho da aplicação. 

import { Link } from 'react-router-dom'
import Avatar from '../avatar/Avatar'
import './Header.css'
import logo from '../../assets/img/logo_light.png';


export default function Header(props) {
    console.log("Header carregado")
     
    const buttons = []
    const btnNewArticle = props.user.get ? <Link to="/articles/new" className="new-article btn btn-light mt-4 fw-bold" role="button">Escreva um artigo</Link> : ""
    
    if(props.user.get) {
        const {name, admin, avatar} = props.user.get
        buttons.push(            
            <Avatar key="avatar" userName={name} pic={avatar} admin={admin} userSet={props.user.set}/>
        )
    }

    else {
        buttons.push(
            <ul key="1" className="m-0 p-0 h-100 d-sm-block col-sm-auto d-flex justify-content-evenly col-12"> {/**displayar flex between se SM */}
                <li className="top-btns "><Link to="/login" onClick={e => props.login.setRegister(false)} >Login</Link></li>
                <li className="top-btns "><Link to="/login" onClick={e => props.login.setRegister(true)} >Registrar</Link></li>
            </ul>
        )
    }


    return (
        <header className="col-12">
            <nav className="navbar navbar-dark bg-dark w-100 m-0 p-0 d-flex justify-content-sm-between justify-content-center">
                <Link to="/" className="navbar-brand ms-4 py-1 d-none d-sm-block"><img src={logo} alt="Weblogz logo"></img></Link>
                {buttons}
            </nav>
            <div className='logo'>
                <h1><Link to='/'>Weblogz</Link></h1>                
                <span className='protip'>Blog de todos. Terra de ninguém. Cadastre-se, publique-se, arque com as consequências, sucesso!</span>
                {btnNewArticle}
            </div>
            
            {/* navbar categories */}
            <div className="dropdown categories-dropdown d-flex d-md-none col-12 bg-dark align-itens-center justify-content-center"> 
                <a className="btn categories-title dropdown-toggle d-flex align-items-center" type="button"  id="dropdownMenuButton2" data-bs-toggle="dropdown" href="/#" aria-expanded="false">
                    <span className='title'>Categorias</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-sm-end dropdown-menu-start"  aria-labelledby="navbarDropdown">
                    <li className="dropdown-item p-0 m-0"><Link to="/" className="dropdown-option py-1 ps-3" >Todas</Link></li>
                    {props.categories.get.map(el => {
                        return <li key={el.id} className="dropdown-item p-0 m-0"><Link to={`/categories/${el.id}`} className="dropdown-option py-1 ps-3" >{el.name}</Link></li>
                    })}
                </ul>
            </div>
            
        </header>
    )    
}