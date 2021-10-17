// Área do usuário no canto superior direito da página. Aparece só se tiver usuário logado.

import './Avatar.css'
import { Link } from 'react-router-dom'


export default function Avatar(props) {
    console.log("avatar carregado")   

    const options = []
    options.push(<li key="home"><Link to='/home'>Home</Link></li>)    
    
    if(props.admin)
        options.push(<li key="admin"><Link to='/admin'>Administração</Link></li>)    
    
    options.push(<li key="sair"><Link to='/login' onClick={e => props.userSet(false)} >Sair</Link></li>)

    return (        
        <div className="avatar-area">
            <img src={props.avatar} alt="avatar" />
            <details>
                <summary>{props.userName}</summary>
                <div className='user-options'>
                    <ul>
                        {options}                   
                    </ul>
                </div>
            </details>
        </div>
    )
}