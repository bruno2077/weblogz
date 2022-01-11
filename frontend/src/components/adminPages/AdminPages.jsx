// Página administrativa contendo link para 3 outras páginas para administração de usuários, artigos e categorias.

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
    useEffect(() => {
        tabToggler( null, props.page) // bota estilo na tab correspondente a página atual
    }, [props])


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
        selectedPage = <AdmUsers user={props.user} />
    else {
        if(props.page === 'articles') {
            selectedPage = <Articles pagOptions={props.pagOptions} user={props.user} categories={props.categories}/>
        }
        else { 
            if(props.page === 'categories')
                selectedPage = <Categories user={props.user} categories={props.categories} />
            else return <Redirect to='/' />
        }
    }
    
    return (
        <div className="mt-5">
            <h2>Administração</h2>
            <p>Selecione um item na tabela para editá-lo.</p>
            <div className="mb-4">
                <ul className="nav nav-tabs justify-content-center justify-content-sm-start">
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