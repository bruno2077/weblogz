import './App.css'
import Header from '../components/templates/Header'
import Footer from '../components/templates/Footer'
import { isValidToken, userKey, avatarKey, toastOptions, baseApiUrl } from '../global'
import { Component } from 'react'
import axios from 'axios'
import {BrowserRouter as Router} from 'react-router-dom'
import Routes from '../main/Routes'
import defaultAvatar from '../assets/img/defaultAvatar.png'
import loadingImg from '../assets/img/loading.gif'
import { ToastContainer, toast } from 'react-toastify';

// Define algumas opções de paginação
const defaultPagOptions = {
    recent: true, // A coluna de ordenação das páginas públicas. Se ordena por data de atalização ou por data de postagem.
    limit: 5, // Qtde por página da lista de artigos.
    tLimit: 5, //Qtde por página da tabela de artigos. usado em '/perfil' e '/adm/articles'.
    asc: false, // se ordena o resultado ascendente ou descendente.
    col: "updated_at", // A coluna de ordenação das páginas restritas. Pode ser qualquer uma.
}
export default class App extends Component {
    constructor(props) {
        super(props)
        this.handleLoginChange = this.handleLoginChange.bind(this)
        this.handleUserChange = this.handleUserChange.bind(this)
        this.handlePaginationChange = this.handlePaginationChange.bind(this)        
        this.getCategories = this.getCategories.bind(this)
        this.state = {
            validatingToken: true, // Se está validando token no backend. 
            loading: true, // Se está buscando algo (p. ex. categorias) no backend.
            isLogged: null, // Se o usuário está ou não logado.
            regfix: false, // faz o toggle do form no /login
            user: null, // o componentDidMount q carrega o usuário
            categories: null, // o componentDidMount q carrega as categorias            
            paginationOptions: { // Opções de paginação enviadas para componentes filhos no acesso ao backend.
                ...defaultPagOptions
            }
        }
    }
    
    // Sempre que monta o componente App verifica se o token no localStorage está válido. Se não tiver limpa os dados de usuário.
    componentDidMount() {
        console.log("App Montado")
        
        // checa SE user no LS, se sim checa SE é válido
        // SE válido, setar este user no state aqui + adiciona token no axios header authorization.
        // Senão, remove LS, token no header, user no state e isLogged = false.
        const LSUser = JSON.parse(localStorage.getItem(userKey)) // Aqui tá como sempre mas sem o campo avatar

        if(LSUser) {
            const verifyToken = new Promise( resolve => {
                //this.setState({ validatingToken: true })
                resolve(isValidToken(LSUser) ) // OK
            })

            verifyToken.then(res => {                 
                if(res) {  // Token válido
                    const avatarString = localStorage.getItem(avatarKey)                    
                    // Monta um objeto pra carregar o usuário da aplicação.                     
                    let userToSend = { payload: {...LSUser}, token: LSUser.token, avatar: avatarString ? avatarString : null }
                    delete userToSend.payload.token
                    
                    this.handleUserChange(userToSend) // Pega os dados do user validado e põe no state da aplicação e o token no header.
                }
                else {                    
                    this.handleUserChange(false) // user: null, delete auth axios header, delete localStorage userdata
                }

                this.setState({ validatingToken: false })
            })
            .catch( e => alert(e) ) // Tratando qualquer erro que der neste acesso ao backend.
        }
        else this.setState({ validatingToken: false })

        // seta loading true, busca categorias no back, ready, loading false.
        this.getCategories()
    }    

    // Os valores que são mandados pra cá precisam ter ao menos o tipo validado.
    // Tem q mudar isso. tá mudano só recent e limit
    handlePaginationChange(obj) {        
        if(obj) // Alteração
            this.setState({
                paginationOptions: {
                    ...this.state.paginationOptions,
                    ...obj                    
                }
            })
            
        else {  // Reset pro default
            this.setState({
                paginationOptions: {...defaultPagOptions}
            })
        }        
    }    


    // Tanto seta quanto remove o usuário: Põe o usuário no localStorage, monta um objeto this.state.user (que é usado em toda aplicação),
    // e adiciona o token no header Authorization do axios.
    handleUserChange(obj) {
        if(obj) { // obj = { obj-payload, string-token, string-avatar }            
            const objWithoutAvatar = { ...obj.payload, token: obj.token }            
            // Armazena a resposta do login no local storage. Deve ser salvo como string.
            localStorage.setItem(userKey, JSON.stringify(objWithoutAvatar)) // informações pra serem usadas com o token
            
            // Se não tem avatar, carrega o default tanto no localStorage quanto no user da aplicação.
            if(!obj.avatar)
                obj.avatar = defaultAvatar

            localStorage.setItem(avatarKey, obj.avatar) // avatar img. É um Data URL

            // Põe o token no header.
            axios.defaults.headers.common["Authorization"] = `bearer ${obj.token}`            
            this.setState({user: {...objWithoutAvatar, avatar: obj.avatar} }) // aqui tem {payload, token e avatar}
        }
        else { // faz um logoff
            localStorage.removeItem(userKey)
            localStorage.removeItem(avatarKey)
            delete axios.defaults.headers.common["Authorization"]
            this.setState({user: null})
        }        
    }
    handleLoginChange(val) {
        this.setState({ isLogged: val })
    }
    

    // Pega a lista de categorias no backend        
    async getCategories(fromChild, msg) {
        this.setState({loading: true})
        await axios.get(`${baseApiUrl}/categories`)
            .then(res => {
                if(fromChild && msg) // Lança uma mensagem na tela quando adicionar, alterar ou excluir uma categoria.
                    toast.success(msg, toastOptions)
                this.setState({ categories: res.data })                
            })            
            .catch(e => {
                // Aqui trata algum erro de rede ou não previsto já que o GET de categoria é público.
                toast.error(e, toastOptions)
                }
            )
        this.setState({loading: false})
    }

    
    render() {
        if(this.state.validatingToken || this.state.loading)
            return <div className="loading_div"><img src={loadingImg} className="loading_img" alt="Carregando"/></div>
                
        else {           
            return (
                <Router>                    
                    <Header 
                        user={ {get: this.state.user, set: this.handleUserChange} } 
                        login={ {register: this.state.regfix, setRegister: val => this.setState({regfix: val})} }
                        categories={ {get: this.state.categories, update: this.getCategories} }
                    />
                    <Routes
                        login={ {get: this.state.isLogged, set: this.handleLoginChange, register: this.state.regfix, setReg: val => this.setState({regfix: val})  } } 
                        user={ {get: this.state.user, set: this.handleUserChange} }                         
                        categories={ {get: this.state.categories, update: this.getCategories} }
                        pagOptions={ {get: this.state.paginationOptions, set: this.handlePaginationChange}}                        
                    />
                    <Footer/>
                    <ToastContainer/>
                </Router>
            )    
        }
    }
}