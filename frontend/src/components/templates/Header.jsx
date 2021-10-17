// Componente de cabeçalho da aplicação. 

import { Link } from 'react-router-dom'
import Avatar from '../avatar/Avatar'
import './Header.css'


export default function Header(props) {
    //console.log("Header carregado")
     
    const buttons = []
    
    if(props.user.get) {
        const {name, admin, avatar} = props.user.get
        buttons.push(
            <Avatar key="avatar" userName={name} pic={avatar} admin={admin} userSet={props.user.set}/>
        )
    }

    else {
        buttons.push(
            <div key="btns" className='top-btns'>
                {/* Muda o estado pra login lá no App e navega */}
                <Link to="/login" onClick={e => props.login.setRegister(false)}>Login</Link>
                {/* Muda o estado lá no App pra register e navega */}
                <Link to="/login" onClick={e => props.login.setRegister(true)}>Registrar</Link>
            </div>
        )
    }

    return (
        <header>    
            {buttons}    
            <div className='logo'></div>     
            <h1><Link to='/'>Weblogz</Link></h1>
            <span className='protip'>As histórias e informações postadas aqui são obras artísticas de ficção e falsidade. Só um tolo tomaria qualquer coisa postada aqui como um fato.</span>
        </header>
    )    
}