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
            // isLogged: this.props.login.get ? true : false,
            // validatingToken: false,
            fromRegister: false,            
        }
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

    // componentWillUnmount() {
    //     console.log("logReg desmontado")        
    // }

    // componentDidUpdate() {
    //     // toda vez q rodava a função do isRegister pro App, rodava isso daqui.
    //     // cada digito nos input roda isso aqui.
    //     console.log("logReg Update. Mostrar form de registro: ", this.props.login.register)
    // }

    
    componentDidMount() {  
        console.log("logReg montado")
        
        // const verifyToken = new Promise( resolve => {
        //     this.setState({ validatingToken: true })
        //     resolve(isValidToken()) //try
        // })       

        // O componente App já faz isso mas se entrar aqui a partir de outro componente (sem recarregar App) garante uma checagem. Necessário???
        // verifyToken.then(res => {            
        //     if(!res)
        //         this.props.user.set(false)
        //     //     this.setState({ isLogged: true })
        //     // else
        //     //     this.setState({ isLogged: false })

        //     // this.setState({ validatingToken: false })             
        // })        
    }    

    // Manda o user pro backend tanto pra logar quanto pra registrar novo usuário.
    sendUser() {
        // Login        
        if(!this.props.login.register) {            
            axios.post(`${baseApiUrl}/login`, this.state.user)
                .then(res => {                    
                    // Armazena a resposta no this.state.user.
                    // this.setState({ user: {...res.data} })
                    // Armazenar a resposta é no App. alem disso botar o user no LS e o token no axios header. 
                                        
                    this.props.user.set(res.data)

                    // // Armazena TODA a resposta no local storage (id, nome, token, etc.). Deve ser salvo como uma string.
                    // localStorage.setItem(userKey, JSON.stringify(res.data))
                    // // Põe o token no header.
                    // axios.defaults.headers.common["Authorization"] = `bearer ${this.state.user.token}`
                    // // Seta como logado e assim não exibe mais o componente Login.
                    // // this.setState({isLogged: true})
                    // this.props.login.set(true)
                    
                })                
                .catch((e) => { // Em caso de erro limpa os dados de usuário e dá um alerta.
                    // // Faz praticamente um logout, limpa tudo relacionado a autenticação.
                    // delete axios.defaults.headers.common["Authorization"]
                    // // this.setState({isLogged: false})
                    this.props.login.set(false) // logoff
                    if(e.response)
                        alert(e.response.data)

                    else alert(e)
                    // localStorage.removeItem(userKey)
                    // return
                })                
        }
        // Cadastro de novo usuário
        else {             
            axios.post(`${baseApiUrl}/register`, this.state.user)
                .then(res => {
                    // responde que deu certo e redireciona e reset pra tela de login
                    this.setState({ user: {...UserInitialState} })
                    this.props.login.setReg(false)
                    alert(res.data)
                })
                .catch(e => {
                    alert(e.response.data ? e.response.data : e) // testar dpois
                })
        }
    }
    

    render() {        
        // Usuário logado ou acaba de logar, redireciona.
        if(this.props.user.get)
            return <Redirect to='/'/>

        // usuário acaba de registrar, redireciona o form.
        // if(this.state.fromRegister) {
        //     this.setState({fromRegister: false})
        //     return  <Redirect to='/login'/>
        // }

        // Usuário já está logado e validando token. Tão rápido q nem aparece (normalmente).
        if(this.validatingToken)
            return <span>carregando.gif</span>
        
        
        // usuário não logado. OK.
        const fields = []  

        // Controla se o formulário de login ou o formulário de registro é exibido. Isso vem lá do App.jsx
        const isRegister = this.props.login.register

        fields.push(<input key="1" name="email" value={this.state.user.email} onChange={e => this.handleChange(e, e.target.name)} type="text" placeholder="E-mail"/>);
        if(isRegister)
            fields.push(<input key="2" name="name" value={this.state.user.name} type="text" onChange={e => this.handleChange(e, e.target.name)} placeholder="Nome"/>)
        fields.push(<input key="3" name="password" value={this.state.user.password} type="password" onChange={e => this.handleChange(e, e.target.name)} placeholder="Senha"/>)
        if(isRegister)
            fields.push(<input key="4" name="confirmPassword" value={this.state.user.confirmPassword} type="password" onChange={e => this.handleChange(e, e.target.name)} placeholder="Confirme a senha"/>)        
        fields.push(<button key="5" onClick={e => this.sendUser()}>Enviar</button>)        
        if(isRegister) {
            // fields.push(<span key="6">Já é registrado? clique <Link to={{pathname: '/login', isRegister: false}} >aqui</Link></span>)
            fields.push(<span key="6">Já é registrado? clique <a href="#" onClick={ e => {e.preventDefault(); this.props.login.setReg(false)}} >aqui</a></span>)
        }            
        // else fields.push(<span key="7">Não é registrado? clique <Link to={{pathname: '/login', isRegister: true}} >aqui</Link></span>)
        else fields.push(<span key="7">Não é registrado? clique <a href="#"  onClick={ e => {e.preventDefault(); this.props.login.setReg(true)}} >aqui</a></span>)


        return (        
            <div className="login-form">                
                {fields}                
            </div>       
        )
    }
}