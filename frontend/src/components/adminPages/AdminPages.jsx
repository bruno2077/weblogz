// Página administrativa contendo link para 3 outras páginas para administração de usuários, artigos e categorias.

import './AdminPages.css'
import AdmUsers from "./users/AdmUsers";
import { Link, Redirect, useRouteMatch , useParams, Switch, Route} from 'react-router-dom';
import Articles from './articles/AdmArticles';
import Categories from './categories/AdmCategories';
import { useEffect } from 'react';


export default function AdminPages(props) {    
    // const [validatingToken, setvalidatingToken] = useState(null);
    
    // Esconde o conteúdo principal (main e aside) ao entrar aqui. Reaparece ao desmontar esse componente.
    useEffect( () => {
        // roda quando monta
        console.log("admPages carregado")
        if(props.mainContent.get)
            props.mainContent.set(false)
          
        // roda quando desmonta
        return () => { 
            console.log("admPages DEScarregado")
            props.mainContent.set(true)
        }
    }, [])
    
    //let { path, url } = useRouteMatch();
    console.log("admPages props: ", props)
    
    // controle de acesso. Se não tem user ou se user não é admin redireciona.
    if(props.user.get) { // Usuário logado, verificando se é admin.
        if(!props.user.get.admin)
            return <Redirect to='/' />        
    }   
    else { // Usuário não logado. Redireciona.
        return <Redirect to='/login' />
    }

    // controle de acesso. Se não tem user ou se user não é admin redireciona.    
    // if(!props.user.get) {
    //     return <Redirect to='/' />
    // }
    // if(!props.user.get.admin) {
    //     return <Redirect to='/' />
    // }      

    // if(props.mainContent.get)
    //     props.mainContent.set(false)

    let selectedPage
    if(!props.page || props.page === 'users') 
        selectedPage = <AdmUsers user={props.user} mainContent={props.mainContent}/>
    else {
        if(props.page === 'articles') {
            // hmmm talvez um route pra /admin/articles. E nesse endereço essa página aqui só q com otro estado?
                // talvez alguma função de ficar pegando a url e mudando estado com ela, daria pra refazer até o login com isso.
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
                    {/* <li> <Link to={`${url}/users`}>[Usuários]</Link> </li>
                    <li> <Link to={`${url}/articles`}>[Artigos]</Link> </li>
                    <li> <Link to={`${url}/categories`}>[Categorias]</Link> </li> */}
                </ul>
            </div>
            <div>
                {selectedPage}
                {/* <Switch>
                    <Route exact path={`admin`}>
                        <Redirect to={`admin/users`} />
                    </Route>
                    <Route path={`admin/:page`}>
                        <Page user={props.user} />
                    </Route>
                </Switch> */}
            </div>
        </div>
    )
}

// Essa função carrega o componente conforme a url/:page
function Page(props) {    
    let { page } = useParams();  
    if(page === "users")
        return <AdmUsers user={props.user} />
    if(page === "categories")
        return <Categories user={props.user} />        
    if(page === "articles")
        return <Articles user={props.user} />
    else  return <Articles user={props.user}/>    
}
    
/*
export default class AdminPages extends Component {
    constructor(props) {
        super(props)
        this.notAdmin = this.notAdmin.bind(this)
        this.state = {
            page: this.props.page ? this.props.page : 'users',
            //isAdmin: this.props.user ? this.props.user.get.admin : false
            isAdmin: null
        }
    }

    componentDidMount() {
        console.log("Admin Pages montado. props user: ")
        console.log(this.props.user)
        if(this.props.user && this.props.user.get.admin) {
            this.setState({ 
                page: this.props.page ? this.props.page : 'users',
                isAdmin: true
            })
        }
        else this.setState({ isAdmin: false })
    }

    notAdmin() {
        this.setState({isAdmin: false})
    }

    // muda o state e a url 
    handleChangeUrl(val) {
        window.history.replaceState(null, null, `/admin/${val}`)
        // window.history.pushState(null, null, `/admin/${val}`)
        this.setState({page: val})
    }

    componentDidUpdate() {
        console.log("admp updatou!")
    }

    render () {
        if(this.state.isAdmin === null)
            return <p>carregando.gif</p>
        else if(!this.state.isAdmin)
            return <Redirect to='/' />

        // pagina de users é o estado inicial        
        let selectedPage
        if(this.state.page === 'users') 
            selectedPage = <AdmUsers user={this.props.user} notAdmin={this.notAdmin}/>
        else if(this.state.page === 'articles') {
            // hmmm talvez um route pra /admin/articles. E nesse endereço essa página aqui só q com otro estado?
                // talvez alguma função de ficar pegando a url e mudando estado com ela, daria pra refazer até o login com isso.
            selectedPage = <Articles user={this.props.user} notAdmin={this.notAdmin}/>
        }
        else if(this.state.page === 'categories')
            selectedPage = <Categories user={this.props.user} notAdmin={this.notAdmin}/>
        else return <Redirect to='/admin' />

        return (
            <div className="adm-pages">
                <h4>Adm pages</h4>
                <div className="adm-tabs">
                    <ul>
                        <li> <Link to="/admin/users">[Usuários]</Link> </li>
                        <li> <Link to="/admin/articles">[Artigos]</Link> </li>
                        <li> <Link to="/admin/categories">[Categorias]</Link> </li>                       
                    </ul>
                </div>
                <div>
                    {selectedPage}
                </div>
            </div>
        )
    }
}
*/