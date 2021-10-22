// Componente de cabeçalho da aplicação. 

import { Link } from 'react-router-dom'
import Avatar from '../avatar/Avatar'
import './Header.css'
import logo from '../../assets/img/logo_light.png'; 


export default function Header(props) {
    // console.log("Header carregado")
     
    const buttons = []
    
    if(props.user.get) {
        const {name, admin, avatar} = props.user.get
        buttons.push(            
            <Avatar key="avatar" userName={name} pic={avatar} admin={admin} userSet={props.user.set}/>
        )
    }

    else {
        buttons.push(
            <ul key="1" className="m-0 p-0 h-100">
                <li className="top-btns "><Link to="/login" onClick={e => props.login.setRegister(false)} >Login</Link></li>
                <li className="top-btns "><Link to="/login" onClick={e => props.login.setRegister(true)} >Registrar</Link></li>
            </ul>
        )
    }

    return (
        <header>
            <nav className="navbar navbar-dark bg-dark w-100 m-0 p-0">               
                <Link to="/" className="navbar-brand ms-4 py-1 "><img className="" src={logo} alt="Weblogz logo"></img></Link>               
                {buttons}
            </nav>
            <div className='logo'>
                <h1><Link to='/'>Weblogz</Link></h1>
                {/* <span className='protip'>As histórias e informações postadas aqui são obras artísticas de ficção e inverdade. Só um tolo tomaria qualquer coisa postada aqui como um fato.</span> */}
                <span className='protip'>Blog de todos. Terra de ninguém. Cadastre-se, publique-se, arque com as consequências, sucesso!</span>
            </div>
        </header>
    )    
}