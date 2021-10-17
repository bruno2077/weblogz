// Página de administração dos usuários

import { Component } from "react";
import './AdmUsers.css'
import axios from 'axios';
import {baseApiUrl } from '../../../global'
import { Redirect } from 'react-router'


const initialState = {
    user: {
        id: null,
        avatar: null,
        name: '',
        email: '',
        admin: false,
        password: '',
        confirmPassword: '',
        deletedAt: null
    },
    users: [],
    userTable: null,
    isUserLoaded: false,
    isNewUser: false,
    toLogin: false,
    loading: false    
}


export default class AdmUsers extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ...initialState
        }
    }
    
    componentDidMount() {
        console.log("Adm Users montado.")

        if(this.props.mainContent.get) // Garante que não carrega Main e Aside enquanto nas páginas administrativas.
            this.props.mainContent.set(false)       

        // Carrega lista de usuários do backend e monta a tabela. Essa função já faz uma validação do token do usuário no backend.
        this.getUsers() 
    }

    // Pega os dados digitados nos input e põe no objeto user daqui.
    handleChange(ev, fieldName) {
        this.setState({
            user: { 
                ...this.state.user,
                [`${fieldName}`]: ev.target.value
            }
        })
    }

    // força valor numérico, booleano e null onde deve ser.
    controlTypes(obj) {
        const foo = obj
        if(obj.id)
           foo.id = parseInt(obj.id)

        for(let i in obj) {
            if(obj[i] === "false")
                foo[i] = false
            else if(obj[i] === "true")
                foo[i] = true
            else if(obj[i] === "null" || obj[i] === "")
                foo[i] = null            
        }
        return foo
    }    

    // Reinicia o estado do componente e carrega a tabela de usuários atualizada do backend.
    restart(isChanged) {
        // Se não tem alteração, não precisa acessar o backend
        if(!isChanged) {
            const keepTable = this.state.userTable
            this.setState({
                ...initialState,
                userTable: keepTable
            })
        }
        else {
            this.setState({ ...initialState })
            this.getUsers()
        }
    }

    // Busca os usuários no backend, é pra retornar com um array de objetos: {id, name, email, avatar, admin}
    getUsers() {
        this.setState({loading: true})        
        axios.get(`${baseApiUrl}/users`)
            .then(res => this.setState({ users: res.data }))
            .then(_ => this.usersToTable() )
            .then(_ => this.setState({loading: false}))
            .catch(e => {                
                if(e.response) { 
                    if(e.response.status === 401) // Se erro de não autorizado, desloga. É token expirado.
                        this.props.user.set(false)
                    alert(e.response.data)
                }
                else {
                    alert(e)
                    this.setState({loading: false})
                }
            })
    }

    // Isso aqui vai tanto incluir quanto alterar. SE o admin alterar a si próprio faz um reLogin.
    sendUser() {
        // força number, boolean e null conforme a string.
        this.setState({user: this.controlTypes(this.state.user)})

        // Prepara um objeto user pra mandar pro backend só com o necessário.
        let userToSend = {
            email: this.state.user.email,
            name: this.state.user.name,
            password: this.state.user.password,
            confirmPassword: this.state.user.confirmPassword,
            admin: this.state.user.admin,
            avatar: this.state.user.avatar
        }

        // Alteração de usuário
        if(this.state.user.id) {
            userToSend.id = this.state.user.id
            axios.put(`${baseApiUrl}/users/${userToSend.id}`, userToSend)
                .then(res => {
                    alert(res.data) // Responde que alterou o usuário.
                    // Se o admin alterou seu próprio usuário, reloga e restart().                    
                    if(this.props.user.get.id == userToSend.id)
                        this.reLogin()
                    else this.restart(true)
                })
                .catch(e => {                    
                    if(e.response) { 
                        if(e.response.status === 401) // Se erro de não autorizado, desloga. É token expirado.
                            this.props.user.set(false)
                        alert(e.response.data)
                    }
                    else {
                        alert(e)                        
                    }
                })
        }

        // Inclusão de novo usuário
        else {
            axios.post(`${baseApiUrl}/users`, userToSend)
                .then(res => {
                    alert(res.data) // Responde que criou o usuário
                    this.restart(true)
                })                
                .catch(e => {
                    if(e.response) { 
                        if(e.response.status === 401) // Se erro de não autorizado, desloga. É token expirado.
                            this.props.user.set(false)
                        alert(e.response.data)
                    }
                    else {
                        alert(e)                        
                    }
                })
        }
    }

    // soft delete do usuário no backend
    deleteUser() {
        axios.delete(`${baseApiUrl}/users/${this.state.user.id}`, this.state.user)
            .then(res => {
                alert(res.data) // Responde que deletou o usuário
                // Se o admin se excluiu, desloga e redireciona.
                if(this.props.user.get.id == this.state.user.id) {
                    this.props.user.set(false)
                    this.setState({ toLogin: true })
                }
                else this.restart(true)
            })
            .catch(e => {
                alert(e)
                this.restart(true)
            })
    }

    // Reloga o usuário com os novos dados. Essa função só é usada se o usuário admin alterar a si próprio.
    reLogin(){           
        // Monta um objeto user pra mandar pro /backend/login
        const userToLogin = {
            email: this.state.user.email,
            password: `${this.state.user.password}`
        }

        axios.post(`${baseApiUrl}/login`, userToLogin)
            .then(res => {
                this.props.user.set(res.data)
            })
            .then(_ => {
                this.restart(true)
            })
            .catch((e) => {
                // Se der algum erro aqui desloga e redireciona.                
                this.props.user.set(false)
                alert(e.response.data ? e.response.data : e)
                this.setState({ toLogin: true })                
            })
    }

    // Carrega no form o usuário onclick da tabela.
    loadUser(e) {
        const userData = []
        for(let i = 0; i < e.currentTarget.children.length; i++) {
            userData.push(e.currentTarget.children[i].innerHTML)
        }
        this.setState({
            user: {
                ...this.state.user,
                id: userData[0],
                name: userData[1],
                email: userData[2],
                avatar: userData[3],
                admin: userData[4]
            },
            isUserLoaded: true,
            isNewUser: false
        })
        // Aqui da pra rodar uma função pra destacar o user selecionado na tabela. O botão [descartar] ou o restart() pode chamar outra q limpa o estilo.
    }

    // Pega a resposta do backend contendo um array de usuários e transforma isso numa tabela de usuários.
    usersToTable() {
        // Cria um array com os nomes das colunas.
        let userTheadData = Object.keys(this.state.users[0])
        // Monta o o cabeçalho da tabela.
        const labels = ["Código", "Nome", "E-mail", "Avatar", "Administrador"]
        const userTheadField = []
        for(let i in userTheadData) {
            userTheadField.push(<th key={`${i}`} name={userTheadData[i]}>{labels[i]}</th>)
        }
        let userThead = <thead><tr className="adm-theader">{userTheadField}</tr></thead>

        // Cria um array de arrays com os values dos objetos. Cada item é uma linha, um user.
        const userTbodyData = []
        for(let i in this.state.users) {
            userTbodyData.push(Object.values(this.state.users[i]))
        }
        // Monta o corpo da tabela.
        const userRows = []
        let userField = []
        for(let i in userTbodyData) {
            for(let x in userTbodyData[i]) {
                userField.push(<td key={`${i},${x}`}>{`${userTbodyData[i][x]}`}</td>)
            }
            userRows.push(<tr key={`${i}`} onClick={e => this.loadUser(e)}>{userField}</tr>)
            userField = []
        }
        const userTbody = <tbody>{userRows}</tbody>
        const userTheadTbody = <table className="adm-tables">{userThead}{userTbody}</table>

        this.setState({userTable: userTheadTbody})
    }

    
    render() {
        // Se o admin se deletou OU se o admin se alterou e não conseguiu relogar OU se não tá logado OU se user logado não é admin. 
        if(this.state.toLogin || !this.props.user.get)
            return <Redirect to='/login' />        

        // Se está validando o token no backend ou se está pegando a lista de usuários no backend.
        if(this.state.loading)
            return <span>carregando.gif</span>

        let btnNewUser, showId, showForm, btnDel = null
        let formTitle = this.state.isNewUser ? "Novo usuário" : "Editar usuário"

        // usuário carregado e não é user novo: mostra o campo ID e o botão [deletar] no form.
        if( this.state.isUserLoaded && !this.state.isNewUser ) {
            showId = <p>ID: <span>{this.state.user.id}</span></p>
            btnDel = <button onClick={e => this.deleteUser()}>Deletar usuário</button>
        }

        // Usuário não carregado: aparece só o botão de novo usuário, não aparece o form.
        if( !this.state.isUserLoaded ) {
            // onClick marca q é inclusão e não alteração de user e que tem usuário carregado oq exibe o form.
            btnNewUser = <button onClick={e => this.setState({ isNewUser: true, isUserLoaded: true})}>Novo usuário</button>
        }
        // Usuário carregado: mostra o form seja com os dados do usuário OU vazio se Novo usuário.
        else {            
            if(!this.state.isNewUser)
                formTitle = "Alterar usuário"

            showForm = (
                <div className='user-update-form'>
                    <h4>{formTitle}</h4>
                    {showId}
                    <input name="email" onChange={e => this.handleChange(e, e.target.name)} value={this.state.user.email} type="text" placeholder="E-mail"/>
                    <input name="name"  onChange={e => this.handleChange(e, e.target.name)} value={this.state.user.name} type="text" placeholder="Nome"/>
                    <div>
                        <label htmlFor="admin">Administrador:</label>
                        <select name="admin" value={this.state.user.admin} onChange={e => this.handleChange(e, e.target.name)} >
                            <option value="false">Não</option>
                            <option value="true">Sim</option>
                        </select>
                    </div>
                    <input name="password" onChange={e => this.handleChange(e, e.target.name)} type="password" placeholder="Senha"/>
                    <input name="confirmPassword" onChange={e => this.handleChange(e, e.target.name)} type="password" placeholder="Confirme a senha"/>
                    <div className='adm-user-btns'>
                        <button onClick={e => this.sendUser()}>Salvar</button>
                        <button onClick={e => this.restart(false)}>Descartar</button>
                        {btnDel}
                    </div>
                </div>
            )
        }
        
        return (
            <div className="adm-user">                
                {btnNewUser}
                {showForm}
                
                {this.state.userTable}
            </div>
        )
    }
}