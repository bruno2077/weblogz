// Home do usuário. Só aparece pra usuário logado.

import './Home.css'
import { Redirect } from 'react-router'
import { baseApiUrl, isValidToken } from '../../global'
import { Component } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {            
            user: !this.props.user.get ? null :
                {
                    id: this.props.user.get.id,
                    name: this.props.user.get.name,
                    email: this.props.user.get.email,
                    password: '',
                    confirmPassword: '',
                    avatar: this.props.user.get.avatar   
                },            
            reLogging: false,            
            validatingToken: false
        }
    }    
    
    componentDidMount() {
        console.log("Home montado")
                
        if(this.props.user.get) {
            const verifyToken = new Promise( resolve => {
                this.setState({ validatingToken: true })
                resolve(isValidToken(this.props.user.get) )
            })

            verifyToken.then(res => {
                if(res) { //token válido. continua.                   
                    this.setState({ validatingToken: false })
                }
                else { // token inválido. desloga, limpa os dados do usuário.
                    this.props.user.set(false)
                }                
            })
            .catch( e => { // Não caiu aqui nem com backend offline. mas tratamos qq erro.
                alert(e)                
            })
        }              
    }

    // Pega os dados digitados e põe no objeto user
    handleChange(ev, field) {        
        this.setState({
            user: { 
                ...this.state.user,
                [`${field}`]: ev.target.value
            }
        })
    }

    // Reloga o usuário com os novos dados.
    reLogin(){   
        this.setState({ reLogging: true }) // flag que está logando o usuário. Evita de redirecionar.
        
        // Monta um objeto user pra mandar pro backend /login
        const userToLogin = {
            email: `${this.state.user.email}`,
            password: `${this.state.user.password}`
        }       

        axios.post(`${baseApiUrl}/login`, userToLogin)
            .then(res => {
                // Limpa os campos de senha e tira a flag de login
                this.props.user.set(res.data)
                this.setState({
                    user: {
                        ...this.state.user,
                        password: '',
                        confirmPassword: ''
                    },
                    reLogging: false                    
                })                
            })            
            .catch((e) => { // Não é pra cair aqui já que o PUT precisa ir OK antes mas se der algum erro aqui desloga e redireciona pro /login.
                this.props.user.set(false)
                this.setState({ reLogging: false })
                if(e.response)
                    alert(e.response.data)
                else alert(e)
            })        
    }

    // Altera usuário no backend
    updateUser() {
        axios.put(`${baseApiUrl}/home`, this.state.user)
            .then(res => {
                alert(res.data)
                // Reloga o usuário com as informações atualizadas.
                this.reLogin()
            })
            .catch( (e) => {
                if(e.response) {
                    if(e.response.status === 401) { // Não autorizado. Isso é token expirado.
                        alert(e.response.data)
                        this.props.user.set(false)
                    }
                    else alert(e.response.data)
                }
                else alert(e)
            })
    }


    render() {
        // Se não tem usuário logado e não está relogando o usuário: Redireciona pra tela de login. 
        if( (!this.props.user.get && !this.state.reLogging) )
            return <Redirect to='/login'/>

        // Se está validando o token no backend
        if( this.state.validatingToken )
            return <span>carregando.gif</span>

        return (
            <div className="user-home">
                <h3>Dados do usuário</h3>

                <p>Preencha os campos abaixo para alterar seus dados</p>
                <div className="user-info">
                    <label htmlFor="userName">Nome</label>
                    <input type="text" id="userName" name="name" value={this.state.user.name} onChange={e => this.handleChange(e, e.target.name)}/>
            
                    <label htmlFor="userEmail">E-mail</label>
                    <input type="text" id="userEmail" name="email" value={this.state.user.email} onChange={e => this.handleChange(e, e.target.name)}/>
                
                    <label htmlFor="userPassword">Senha</label>
                    <input type="password" id="userPassword" name="password" value={this.state.user.password} onChange={e => this.handleChange(e, e.target.name)}/>
                    
                    <label htmlFor="userConfirmPassword">Confirme a senha</label>
                    <input type="password" id="userConfirmPassword" name="confirmPassword" value={this.state.user.confirmPassword} onChange={e => this.handleChange(e, e.target.name)}/>
                </div>
                <div>
                    <button onClick={e => this.updateUser()}>Salvar</button>
                    <button><Link to="/">Voltar</Link></button>
                </div>
            </div>
        )        
    }
}