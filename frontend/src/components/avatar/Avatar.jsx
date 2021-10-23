// Área do usuário no canto superior direito da página. Aparece só se tiver usuário logado.

import './Avatar.css'
import { Link } from 'react-router-dom'
import userImg from "../../assets/img/avatars/0defaultAvatar.png"


export default function Avatar(props) {
    console.log("avatar carregado")   

    const options = []
    options.push(<li key="perfil" className="dropdown-item p-0 m-0" type="button"><i class="fas fa-address-card ps-3"></i><Link to='/perfil' className="user-option py-1 px-3">Perfil</Link></li>)
    
    if(props.admin)
        options.push(<li key="admin" className="dropdown-item p-0 m-0" type="button"><i class="fas fa-cog ps-3"></i><Link to='/admin' className="user-option py-1 px-3">Administração</Link></li>)
    
    options.push(<li key="sair" className="dropdown-item p-0 m-0" type="button"><i class="fas fa-sign-out-alt ps-3"></i><Link to='/login' className="user-option py-1 px-3" onClick={e => props.userSet(false)} >Sair</Link></li>)

    return (
        <div className="dropdown" id="avatar-area">

            <a className="btn dropdown-toggle" type="button"  id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                <span className="username pe-3 overflow-hidden">{props.userName}</span>
                <img className='userimg' src={userImg} alt="avatar"/>
            </a>

            <ul className="dropdown-menu dropdown-menu-sm-end dropdown-menu-start"  aria-labelledby="navbarDropdown">
                {options}
            </ul>
        </div>
    )
}