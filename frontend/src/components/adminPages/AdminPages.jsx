// Página administrativa contendo link para 3 outras páginas para administração de usuários, artigos e categorias.

import './AdminPages.css'
import AdmUsers from "./users/AdmUsers";
import { Link, Redirect, useParams} from 'react-router-dom';
import Articles from './articles/AdmArticles';
import Categories from './categories/AdmCategories';
import { useEffect } from 'react';


export default function AdminPages(props) {
    // Esconde o conteúdo principal (main e aside) ao carregar esse componente. Reaparece ao desmontar esse componente.
    useEffect( () => {
        // roda quando monta
        //console.log("admPages carregado")
        if(props.mainContent.get)
            props.mainContent.set(false)
          
        // roda quando desmonta
        return () => { 
            //console.log("admPages DEScarregado")
            props.mainContent.set(true)
        }
    }, [])
    
    
    // controle de acesso. Se não tem user ou se user não é admin redireciona.
    if(props.user.get) { // Usuário logado, verificando se é admin.
        if(!props.user.get.admin)
            return <Redirect to='/' />        
    }   
    else { // Usuário não logado. Redireciona.
        return <Redirect to='/login' />
    }

    let selectedPage
    // /admin também carrega /admin/users
    if(!props.page || props.page === 'users') 
        selectedPage = <AdmUsers user={props.user} mainContent={props.mainContent}/>
    else {
        if(props.page === 'articles') {           
            selectedPage = <Articles user={props.user} mainContent={props.mainContent} />
        }
        else { 
            if(props.page === 'categories')
                selectedPage = <Categories user={props.user} mainContent={props.mainContent} />
            else return <Redirect to='/' />
        }
    }

    
    return (
        <div className="adm-pages">
            <h4>Administração</h4>
            <div className="adm-tabs">
                <ul>
                    <li> <Link to={`/admin/users`}>[Usuários]</Link> </li>
                    <li> <Link to={`/admin/articles`}>[Artigos]</Link> </li>
                    <li> <Link to={`/admin/categories`}>[Categorias]</Link> </li>                    
                </ul>
            </div>
            <div>
                {selectedPage}               
            </div>
        </div>
    )
}