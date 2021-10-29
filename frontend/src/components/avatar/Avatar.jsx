// Área do usuário no canto superior direito da página. Aparece só se tiver usuário logado.

import './Avatar.css'
import { Link } from 'react-router-dom'


export default function Avatar(props) {
    console.log("avatar carregado")   

    const options = []
    options.push(<li key="perfil" className="dropdown-item p-0 m-0" type="button"><Link to='/perfil' className="user-option py-1 px-3"><i className="fas fa-address-card pe-3"></i>Perfil</Link></li>)
    
    if(props.admin)
        options.push(<li key="admin" className="dropdown-item p-0 m-0" type="button"><Link to='/admin' className="user-option py-1 px-3"><i className="fas fa-cog pe-3"></i>Administração</Link></li>)
    
    options.push(<li key="sair" className="dropdown-item p-0 m-0" type="button"><Link to='/login' className="user-option py-1 px-3" onClick={e => props.userSet(false)} ><i className="fas fa-sign-out-alt pe-3"></i>Sair</Link></li>)

    return (
        <div className="dropdown" id="avatar-area">

            <a className="btn dropdown-toggle d-flex align-items-center" type="button"  id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                <span className="username pe-3 overflow-hidden">{props.userName}</span>
                <img className='userimg' src={props.pic} alt="avatar"/>
            </a>

            <ul className="dropdown-menu dropdown-menu-sm-end dropdown-menu-start"  aria-labelledby="navbarDropdown">
                {options}
            </ul>
        </div>
    )
}