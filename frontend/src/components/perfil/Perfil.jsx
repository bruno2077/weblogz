// Perfil do usuário. Só aparece pra usuário logado.

import './Perfil.css'
import { Redirect } from 'react-router'
import { baseApiUrl, isValidToken } from '../../global'
import { Component } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import AvatarEditor from '../avatarEditor/AvatarEditor'
import defaultAvatar from '../../assets/img/defaultAvatar.png'

export default class Perfil extends Component {
    constructor(props) {
        super(props)
        this.setAvatar = this.setAvatar.bind(this)
        //this.setAvatarImg = this.setAvatarImg.bind(this)
        this.setTmpImg = this.setTmpImg.bind(this)
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
            validatingToken: false,
            imageLoaded: null, // imagem original. Passa pro React Avatar Editor (RAE)
            tempImg: null // imagem em edição 100x100 vinda do RAE, ao final da edição salva em this.state.user.avatar
        }
    }

    componentDidMount() {
        console.log("Perfil montado")       

        if (this.props.user.get) {
            const verifyToken = new Promise(resolve => {
                this.setState({ validatingToken: true })
                resolve(isValidToken(this.props.user.get))
            })

            verifyToken.then(res => {
                if (res) { //token válido. continua.
                    this.setState({ validatingToken: false })
                }
                else { // token inválido. desloga, limpa os dados do usuário.
                    this.props.user.set(false)
                }
            })
                .catch(e => { // Não caiu aqui nem com backend offline. mas tratamos qq erro.
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
    reLogin() {
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
                if (e.response)
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
            .catch((e) => {
                if (e.response) {
                    if (e.response.status === 401) { // Não autorizado. Isso é token expirado.
                        alert(e.response.data)
                        this.props.user.set(false)
                    }
                    else alert(e.response.data)
                }
                else alert(e)
            })
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
                    image= {this.state.imageLoaded} // O Arquivo
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
            // input file do arquivo de imagem
            return (
                <div className="d-flex flex-column">
                    <div className="mb-3">
                        <img className="avatarImg" src={this.state.user.avatar ? this.state.user.avatar : defaultAvatar} alt="avatar"/>
                    </div>
                        
                    <input type="file"
                        id="avatar" name="avatar"
                        accept="image/png, image/jpeg"
                        onChange={e => {
                            this.imgHandler(e) // carrega o arquivo no state.imgLoaded
                        }}
                    />
                </div>
            )
        }
    }
    
    
    showModalFooter() {
        // Array de botões no footer do Modal conforme se tem ou não um arquivo de imagem carregado.
        const modalBtns = []
        // Input file
        if(!this.state.imageLoaded) {       
            modalBtns.push(
                <button key="1" type="button" className="btn btn-secondary" 
                    onClick={e => {
                        this.setState({imageLoaded: null, tempImg: null, user: {...this.state.user, avatar: defaultAvatar} })                        
                    }}>
                    Excluir imagem
                </button>,
                <button key="2" type="button" className="btn btn-secondary" data-bs-dismiss="modal"
                onClick={e => {
                    if(this.state.imageLoaded) {
                        this.setState({imageLoaded: null, tempImg: null})
                    }
                }}>
                Voltar
            </button>
            )
        }
        // RAE
        else {
            modalBtns.push(
                <button key="1" type="button" className="btn btn-secondary" data-bs-dismiss="modal"
                    onClick={e => {
                        this.setState({user: {...this.state.user, avatar: this.state.tempImg} })
                        this.setState({imageLoaded: null, tempImg: null})
                    }}>
                    Salvar
                </button>,
                <button key="2" type="button" className="btn btn-secondary"
                onClick={e => {
                    if(this.state.imageLoaded) {
                        this.setState({imageLoaded: null, tempImg: null})
                    }
                }}>
                Cancelar
            </button>
            )            
        }
        return modalBtns
    }


    render() {
        // Se não tem usuário logado e não está relogando o usuário: Redireciona pra tela de login.
        if ((!this.props.user.get && !this.state.reLogging))
            return <Redirect to='/login' />

        // Se está validando o token no backend
        if (this.state.validatingToken)
            return <span>carregando.gif</span>

               
        


        return (
            <div className="col-12 col-sm-9 col-md-8 col-lg-6 col-xl-6">
                <h2>Dados do usuário</h2>
                <p>Preencha todos os campos abaixo para alterar seus dados.</p>

                <div className="border rounded p-4 " >

                    {/* Avatar do usuario */}
                    <div className="mb-3 row d-sm-flex align-items-center" data-bs-toggle="modal" data-bs-target="#avatarModal">
                        <div className="">
                            <img className="avatarImg" src={this.state.user.avatar} alt="avatar"/>
                        </div>                                                
                    </div>                    
                    {/* Modal do avatar */}
                    <div className="modal fade" id="avatarModal" data-bs-backdrop="static" tabIndex="-1" aria-labelledby="avatarModalLabel" aria-hidden="true">
                        <div className="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-fullscreen-sm-down">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="avatarModalLabel">Alterar foto de perfil</h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" 
                                        onClick={e => {
                                            if(this.state.imageLoaded) {
                                                this.setState({imageLoaded: null, tempImg: null})
                                            }
                                        }}>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    {/* input file ou RAE. Depende se uma imagem foi carregada. */}
                                    {this.showAvatarEditor()}
                                </div>
                                <div className="modal-footer">
                                    {/* Aqui é um array de botões dependendo do estado de imageLoaded */}
                                    {this.showModalFooter()}                                    
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-3 row">
                        <label htmlFor="userName" className="form-label col-sm-3 col-form-label">Nome</label>
                        <div className="col-sm-9">
                            <input type="text" id="userName" className="form-control" name="name" value={this.state.user.name} onChange={e => this.handleChange(e, e.target.name)} />
                        </div>
                    </div>

                    <div className="mb-3 row">
                        <label htmlFor="userEmail" className="form-label col-sm-3 col-form-label">E-mail</label>
                        <div className="col-sm-9">
                            <input type="email" id="userEmail" className="form-control" name="email" value={this.state.user.email} onChange={e => this.handleChange(e, e.target.name)} />
                        </div>
                    </div>

                    <div className="mb-3 row">
                        <label htmlFor="userPassword" className="form-label col-sm-3 col-form-label">Senha</label>
                        <div className="col-sm-9">
                            <input type="password" id="userPassword" className="form-control" name="password" value={this.state.user.password} onChange={e => this.handleChange(e, e.target.name)} />
                        </div>
                    </div>

                    <div className="mb-3 row">
                        <label htmlFor="userConfirmPassword" className="form-label col-sm-3 col-form-label">Confirme a senha</label>
                        <div className="col-sm-9">
                            <input type="password" id="userConfirmPassword" className="form-control" name="confirmPassword" value={this.state.user.confirmPassword} onChange={e => this.handleChange(e, e.target.name)} />
                        </div>
                    </div>
                    <div className="mb-3 row" >
                        <div className="col-sm-3"></div>
                        <div className="btns-area col-sm-9 text-end">
                            <button className="btn btn-success me-3" onClick={e => this.updateUser()}>Salvar</button>
                            <Link to="/"><button className="btn btn-dark">Voltar</button></Link>                            
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}