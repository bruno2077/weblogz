// Página administrativa contendo link para 3 outras páginas para administração de usuários, artigos e categorias.

import './AdminPages.css'
import AdmUsers from "./users/AdmUsers";
import { Link, Redirect} from 'react-router-dom';
import Articles from './articles/AdmArticles';
import Categories from './categories/AdmCategories';
import { useEffect } from 'react';


// Lida com a aparência das abas conforme a página que está renderizada.
function tabToggler(ev, page) {
    const tabs = document.getElementsByClassName("admtab")    
    if(tabs.length) {
        for(let i of tabs ) {
            i.classList.remove("active")
            i.setAttribute("aria-selected", "false")            
        }
        // onclick nas tabs
        if(ev) {
            ev.target.setAttribute("aria-selected", "true")
            ev.target.classList.add("active")
        }
        // on mount de admPages: coloca o estilo na tab certa quando carregar a url
        else {
            let index = null
            if(page === undefined || page === "users")
                index = 0
            else if(page === "articles" ) 
                index = 1
            else if(page === "categories" ) 
                index = 2

            if(index !== null) {
                tabs[index].classList.add("active")
                tabs[index].setAttribute("aria-selected", "true")
            }
        }
    }
}


export default function AdminPages(props) {
    // Esconde o conteúdo principal (main e aside) ao carregar esse componente. Reaparece ao desmontar esse componente.
    useEffect( () => {
        // roda quando monta
        console.log("admPages carregado")
        tabToggler(null, props.page)
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
        <div className="col-12 col-sm-10" >
            <h2>Administração</h2>
            <div className="mb-4">
                <ul className="nav nav-tabs">
                    <li className="nav-item"><Link onClick={e => tabToggler(e)} className="admtab nav-link" aria-selected="false" to={`/admin/users`}>Usuários</Link></li>
                    <li className="nav-item"><Link onClick={e => tabToggler(e)} className="admtab nav-link" aria-selected="false" to={`/admin/articles`}>Artigos</Link></li>
                    <li className="nav-item"><Link onClick={e => tabToggler(e)} className="admtab nav-link" aria-selected="false" to={`/admin/categories`}>Categorias</Link></li>                    
                </ul>
            </div>
            <div>
                {selectedPage}               
            </div>
        </div>
    )
}