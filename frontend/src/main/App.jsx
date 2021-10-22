import './App.css'
import Header from '../components/templates/Header'
import Main from '../components/templates/Main'
import Aside from '../components/templates/Aside'
import Footer from '../components/templates/Footer'

import { isValidToken, userKey } from '../global'
import { Component } from 'react'
import axios from 'axios'
import {BrowserRouter as Router} from 'react-router-dom'
import Routes from '../main/Routes'


export default class App extends Component {
    constructor(props) {
        super(props)
        this.handleLoginChange = this.handleLoginChange.bind(this)
        this.handleUserChange = this.handleUserChange.bind(this)
        this.handleShowMainChange = this.handleShowMainChange.bind(this)
        this.state = {
            validatingToken: true, // Se está validando token no backend. 
            isLogged: null, // Se o usuário está ou não logado.
            regfix: false, // faz o toggle do form no /login
            user: null, // o componentDidMount q carrega o usuário
            showMain: true // renderiza ou não o main e o aside
        }
    }
    
    // Sempre que monta o componente App verifica se o token no localStorage está válido. Se não tiver limpa os dados de usuário.
    componentDidMount() {
        //console.log("App Montado")
        
        // checa SE user no LS, se sim checa SE é válido
        // SE válido, setar este user no state aqui + adiciona token no axios header authorization.
        // Senão, remove LS, token no header, user no state e isLogged = false.
        const LSUser = JSON.parse(localStorage.getItem(userKey))
        if(LSUser) {
            const verifyToken = new Promise( resolve => {
                //this.setState({ validatingToken: true })
                resolve(isValidToken(LSUser) )
            })

            verifyToken.then(res => {
                if(res) {                    
                    this.handleUserChange(LSUser) // Pega o user validado, põe no state e o token no header.                    
                }
                else {                    
                    this.handleUserChange(false) // user: null, delete auth axios header, delete localStorage userdata
                }

                this.setState({ validatingToken: false })
            })
            .catch( e => alert(e) ) // Tratando qualquer erro que der neste acesso ao backend.
        }
        else this.setState({ validatingToken: false })
    }    

    // Tanto seta quanto remove o usuário: Põe o usuário no localStorage, monta um objeto this.state.user (que é usado em toda aplicação),
    // e adiciona o token no header Authorization do axios.
    handleUserChange(obj) {
        //console.log("Setando usuário App para: ", obj)
        if(obj) {
            // Armazena TODA a resposta do login no local storage (id, nome, token, etc.). Deve ser salvo como uma string.
            localStorage.setItem(userKey, JSON.stringify(obj))
            // Põe o token no header.
            axios.defaults.headers.common["Authorization"] = `bearer ${obj.token}`
            this.setState({user: obj})
        }
        else { // faz um logoff
            localStorage.removeItem(userKey)
            delete axios.defaults.headers.common["Authorization"]
            this.setState({user: null})
        }
    }
    handleLoginChange(val) {
        this.setState({ isLogged: val })
    }
    handleShowMainChange(val) {
        this.setState({ showMain: val })
    }

    
    render() {        
        const mainContent = []
        
        if(this.state.validatingToken)
            return <span className="img-center">Carregando.gif</span>
                
        else {
            if(this.state.showMain) {
                mainContent.push(<Main key="1"/>)
                mainContent.push(<Aside key="2"/>)                
            }
            return (
                <Router>
                    <Header 
                        user={ {get: this.state.user, set: this.handleUserChange} } 
                        login={ {register: this.state.regfix, setRegister: val => this.setState({regfix: val})} }
                    />
                    <Routes
                        login={ {get: this.state.isLogged, set: this.handleLoginChange, register: this.state.regfix, setReg: val => this.setState({regfix: val})  } } 
                        user={ {get: this.state.user, set: this.handleUserChange} } 
                        mainContent={ {get: this.state.showMain, set: this.handleShowMainChange} }
                    />
                    
                    {mainContent}

                    <Footer/>
                </Router>
            )    
        }
    }
}