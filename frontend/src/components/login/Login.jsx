// Componente com o formulário de login e formulário de registro de novo usuário.

import './Login.css'
import { Component } from 'react'
import axios from 'axios'
import { baseApiUrl } from '../../global'
import { Redirect } from 'react-router'
import defaultAvatar from '../../assets/img/defaultAvatar.png'
import AvatarEditor from '../avatarEditor/AvatarEditor'

const UserInitialState = {
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    admin: false,
    avatar: defaultAvatar
}

export default class Login extends Component {
    constructor(props) {
        super(props)     
        this.setAvatar = this.setAvatar.bind(this)
        this.setTmpImg = this.setTmpImg.bind(this)
        this.state = {            
            user: {
                ...UserInitialState
            },            
            fromRegister: false,    
            imageLoaded: null,
            tempImg: null        
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
                    // Armazena a resposta no App. Além disso bota os dados do user no localStorage e o token no header Authorization do axios.
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
    


    // Chama no onClick do input file. Carrega o arquivo de imagem numa variável e passa pro Avatar Editor tornando-o visível.    
    imgHandler(ev) {
        let file = ev.target.files[0]; // O arquivo q tava no PC. formato File.
                
        if(file) {             
            this.setState({imageLoaded: file}); // Monta o React Avatar Editor, passa o file.
        }
        
        else this.setState({imageLoaded: null})
    }    
    
    // Salva a imagem editada pelo RAE no state do usuário deste componente.
    setAvatar(dataURL) {
        this.setState({user: {...this.state.user, avatar: dataURL}, imageLoaded: null, tempImg: null})         
    }   
    // Roda no onChange do RAE. Essa imagem é salva no state do usuário aqui do componente quando termina a edição.
    setTmpImg(val) {
        this.setState({tempImg: val}) 
    }

    // Isso aqui aparece no corpo do Modal. Ou seleciona uma imagem via input ou edita a imagem já carregada.
    showAvatarEditor() {       
        if(this.state.imageLoaded) {
            // react avatar editor
            return (
                <AvatarEditor
                    image= {this.state.imageLoaded ? this.state.imageLoaded : defaultAvatar} // O Arquivo
                    width={100}
                    height={100}
                    border={20}
                    color={[0, 0, 0, 0.8]} // RGBA
                    scale={1}
                    setAvatar={this.setAvatar}
                    setTmpImg={this.setTmpImg}
                />
            )   
        }
        else {
            return (
                <div className="d-flex flex-column">
                    <div className="mb-3">
                        <img className="avatarImg" src={this.state.user.avatar} alt="avatar"/>
                    </div>
                    
                    <input type="file" id="selectAvatarFile" className="" onChange={e => {this.imgHandler(e)}} />
                </div>                
            )
        }
    }

    showModalFooter() {
        const options = []

        if(!this.state.imageLoaded) {            
            if(defaultAvatar !== this.state.user.avatar ) {
                options.push(
                    <button key="1" type="button" className="btn btn-secondary" 
                        onClick={e => {
                            this.setState({imageLoaded: null, tempImg: null, user: {...this.state.user, avatar: defaultAvatar} })                        
                        }}>
                        Excluir imagem
                    </button>
                )
            }

            options.push(
                <button key="2" type="button" className="btn btn-secondary" data-bs-dismiss="modal"
                    onClick={e => {
                        if(this.state.imageLoaded) {
                            this.setState({imageLoaded: null, tempImg: null})
                        }
                    }}>
                    OK
                </button>
            )
        }

        else{
            options.push(                
                <button key="1" type="button" className="btn btn-secondary" data-bs-dismiss="modal"
                    onClick={e => {
                        this.setState({user: {...this.state.user, avatar: this.state.tempImg} })
                        this.setState({imageLoaded: null, tempImg: null})
                    }}>
                    Salvar
                </button>,
                <button key="2" type="button" className="btn btn-secondary ms-2"
                    onClick={e => {
                        if(this.state.imageLoaded) {
                            this.setState({imageLoaded: null, tempImg: null})
                        }
                    }}>
                    Voltar
                </button>                
            )            
        }

        return options        
    }


    render() {        
        // Usuário logado ou acaba de logar, redireciona.
        if(this.props.user.get)
            return <Redirect to='/'/>

        // Usuário já está logado e validando token.
        if(this.validatingToken)
            return <div>img carregando.gif</div>
                    
        
        // usuário não logado. OK.
        const fields = []  

        // Controla se o formulário de login ou o formulário de registro é exibido. Isso vem lá do App.jsx
        const isRegister = this.props.login.register

        const pageTitle = isRegister ?  "Registrar" : "Login" 
        const emailHelper = isRegister ? <div id="emailHelp" className="form-text">Nunca compartilharemos seu e-mail com ninguém. <i className="far fa-smile fa-lg"></i></div> : ""


        // Avatar & input file        
        if(isRegister) {
            fields.push(
                <div key="8" className="mb-4 d-flex flex-column">
                    <div className="mb-3">
                        <img className="avatarImg" src={this.state.user.avatar} alt="avatar"/>
                    </div>
                    <div className="">
                        <input type="file" id="selectAvatarFile" className="" data-bs-toggle="modal" data-bs-target="#avatarModal" 
                            onChange={e => {this.imgHandler(e)}} /> 
                    </div>
                </div>
            )
        }

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
            <div className="login-form col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4">
                <h2>{pageTitle}</h2>
                <div className="border rounded p-4">        

                    {/* Modal do avatar */}
                    <div className="modal fade" id="avatarModal" data-bs-backdrop="static" tabIndex="-1" aria-labelledby="avatarModalLabel" aria-hidden="true">
                        <div className="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-fullscreen-sm-down">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="avatarModalLabel">Foto do perfil de usuário</h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" 
                                        onClick={e => {
                                            if(this.state.imageLoaded) {
                                                this.setState({imageLoaded: null, tempImg: null})
                                            }
                                        }}>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    {/* React Avatar Editor. */}
                                    {this.showAvatarEditor()}
                                </div>
                                <div className="modal-footer">
                                    {/* BTNs  */}
                                    {this.showModalFooter()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {fields}
                </div>
            </div>
        )
    }
}