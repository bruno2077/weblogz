// Componente com o formulário de login e formulário de registro de novo usuário.

import './Login.css'
import { Component } from 'react'
import axios from 'axios'
import { baseApiUrl } from '../../global'
import { Redirect } from 'react-router'

const UserInitialState = {
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    admin: '',
    avatar: null
}

export default class Login extends Component {
    constructor(props) {
        super(props)        
        this.state = {            
            user: {
                ...UserInitialState
            },            
            fromRegister: false,            
        }
    }    
    
    componentDidMount() {  
        // console.log("logReg montado")
    }    

    // Pega os dados digitados nos input e põe no objeto user.
    handleChange(ev, field) {
        this.setState({
            user: { 
                ...this.state.user,
                [`${field}`]: ev.target.value
            }
        })
    } 

    // Manda o user pro backend tanto pra logar quanto pra registrar novo usuário.
    sendUser() {
        // Login        
        if(!this.props.login.register) {            
            axios.post(`${baseApiUrl}/login`, this.state.user)
                .then(res => {                                        
                    // Armazena a resposta no App. Além disso bota o user no localStorage e o token no header Authorization do axios.                                         
                    this.props.user.set(res.data)
                })                
                .catch((e) => { // Em caso de erro limpa os dados de usuário e dá um alerta.                    
                    if(e.response)
                        alert(e.response.data)

                    else alert(e)

                    this.props.login.set(false) // logoff                    
                })                
        }
        // Cadastro de novo usuário
        else {             
            axios.post(`${baseApiUrl}/register`, this.state.user)
                .then(res => {
                    // responde que deu certo e redireciona pra tela de login
                    this.setState({ user: {...UserInitialState} })
                    this.props.login.setReg(false)
                    alert(res.data)
                })
                .catch(e => {
                    if(e.response)
                        alert(e.response.data)

                    else alert(e)
                })
        }
    }
    

    render() {        
        // Usuário logado ou acaba de logar, redireciona.
        if(this.props.user.get)
            return <Redirect to='/'/>

        // Usuário já está logado e validando token.
        if(this.validatingToken)
            return <span>carregando.gif</span>
                    
        
        // usuário não logado. OK.
        const fields = []  

        // Controla se o formulário de login ou o formulário de registro é exibido. Isso vem lá do App.jsx
        const isRegister = this.props.login.register

        const pageTitle = isRegister ?  "Registrar" : "Login" 
        const emailHelper = isRegister ? <div id="emailHelp" className="form-text">Nunca compartilharemos seu e-mail com ninguém. :)</div> : ""

        fields.push(
            <div key="1" className="mb-3">
                <input name="email" className="form-control" value={this.state.user.email} onChange={e => this.handleChange(e, e.target.name)} type="text" placeholder="E-mail"/>
                {emailHelper}
            </div>
        )
            
        if(isRegister)
            fields.push(<input key="2" name="name" className="form-control mb-3" value={this.state.user.name} type="text" onChange={e => this.handleChange(e, e.target.name)} placeholder="Nome"/>)
        fields.push(<input key="3" name="password" className="form-control mb-3" value={this.state.user.password} type="password" onChange={e => this.handleChange(e, e.target.name)} placeholder="Senha"/>)
        if(isRegister)        
            fields.push(<input key="4" name="confirmPassword" className="form-control mb-3" value={this.state.user.confirmPassword} type="password" onChange={e => this.handleChange(e, e.target.name)} placeholder="Confirme a senha"/>)
        fields.push(<button key="5" className="btn btn-success me-3 " onClick={e => this.sendUser()}>Enviar</button>)        
        if(isRegister) {            
            fields.push(<span key="6">Já é registrado? clique <a href="#" onClick={ e => {e.preventDefault(); this.props.login.setReg(false)}} >aqui</a></span>)
        }
        else fields.push(<span key="7">Não é registrado? clique <a href="#"  onClick={ e => {e.preventDefault(); this.props.login.setReg(true)}} >aqui</a></span>)


        return (
            <div>
                <h2>{pageTitle}</h2>
                <div className="login-form border rounded p-4">
                    {fields}
                </div>
            </div>
        )
    }
}