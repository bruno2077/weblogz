// Esse componente recebe um ID numérico ou 'new'. Se for numérico é buscado um artigo no backend pelo ID e se for 'new' é criação de 
// novo artigo. Tanto na criação quanto na edição do artigo são necessárias permissões.
// São 9 colunas: "id", "title", "description", "content", "published", "created_at", "updated_at", "userId", "categoryId"
import axios from "axios";
import { Component } from "react";
import { toast } from "react-toastify";
import { baseApiUrl, isValidToken, toastOptions } from "../../global";
import loadingImg from '../../assets/img/loading.gif'
import ArticleEditor from '../articleEditor/ArticleEditor'
import { Link, Redirect } from "react-router-dom";
import './Article.css'


// Os artigos tem 9 cols: "id", "title", "description", "content", "published", "created_at", "updated_at", "userId", "categoryId".
// Mas só 5 são preenchidas manualmente: "title", "description", "content", "published", "categoryId"
const initialStateArticle = {
    id: 0,
    title: "",
    description: "",
    content: null,
    published: true,
    created_at: "",
    updated_at: "",
    userId: 0,
    categoryId: 0  
}

const initialState = {
    adminOrAuthor: false,
            loading: true, // pegando arquivo no backend.
            validatingToken: true, // validando token de usuário no backend.
            redir: false, // Se tentar criar artigo sem estar logado ou descartar artigo na criação de novo artigo redireciona.            
            article: { ...initialStateArticle },
            author: { // Nome e avatar do autor
                name: "",
                avatar: null
            },
            error: null, // No caso de não encontrar o artigo, a mensagem de erro vem aqui.
            temp: { ...initialStateArticle } // usado pra alterar dados do artigo. Se modificar e descartar as alterações, os dados originais estão em this.state.articles.
}

export default class Article extends Component {
    constructor(props) {
        super(props)
        this.handleContentChange = this.handleContentChange.bind(this)
        this.state = {
            ...initialState,
            readOnly: this.props.editorMode ? false : true, // Se exibe o artigo no modo leitura ou no modo edição.
            isNew: this.props.id === 'new' ? true : false, // Este é o ':id' de quando está criando um artigo.
        }
    }

    componentDidMount() {      
        console.log("Article Montado")
        // Novo artigo. Só verifica se o usuário está logado.
        if(this.state.isNew) {             
            this.setState({loading: false}) // não tem artigo pra carregar.
            this.userCheck() //verifica o usuário, se não está logado redireciona pois não pode criar artigo.
        }
        
        // Artigo já existente. Puxa dados do artigo(se existir), do autor, e verifica permissões do usuário.
        else { 
            // Se Id numérico, procura no backend e continua.
            if(parseInt(this.props.id)) {
                const settings = new Promise(resolve => {
                    resolve(this.getArticle(parseInt(this.props.id)) )
                })
                settings.then( async res => {
                    if(this.state.error) // Se não encontrou artigo não precisa validar token de usuário no backend.
                        this.setState({validatingToken: false})
                    else {
                        await this.userCheck() // Verifica se o usuário é autor ou admin, se for tem permissão pra editar e visualizar o artigo caso não esteja publicado.
                    }
                })
                .then(_ => {
                    if(!this.state.readOnly) // Se já monta o componente no modo edição, carrega os dados no formulário.
                        this.toEditorMode()
                })
                .then(_ => this.setState({loading: false}))                
            }

            // Se id não numérico ou 0 nem tenta buscá-lo no backend, é inválido. Redireciona pro '/'
            else this.setState({redir: true})
        }        
    }

    componentDidUpdate(prevProps) {
        if(this.props.id !== prevProps.id) {            
            this.refresh()
        }
    }

    // Essa função roda toda vez que mudar de artigo sem recarregar a página, seja pra outro artigo ou pra novo artigo.
    async refresh() {
        await this.setState({
            ...initialState, 
            readOnly: this.props.editorMode ? false : true,
            isNew: this.props.id === 'new' ? true : false 
        })
        
        if(this.state.isNew) { 
            this.setState({loading: false, readOnly: false}) // não tem artigo pra carregar.
            this.userCheck() //verifica o usuário, se não está logado redireciona.
        }
        
        // Artigo já existente. Puxa dados do artigo(se existir), do autor, e verifica permissões do usuário.
        else { 
            // Se Id numérico, procura no backend e continua.
            if(parseInt(this.props.id)) {
                const settings = new Promise(resolve => {
                    resolve(this.getArticle(parseInt(this.props.id)) )
                })
                settings.then( async res => {
                    if(this.state.error) // Se não encontrou artigo não precisa validar token de usuário no backend.
                        this.setState({validatingToken: false})
                    else {
                        await this.userCheck() // Verifica se o usuário é autor ou admin, se for tem permissão pra editar e visualizar o artigo caso não esteja publicado.
                    }
                })
                .then(_ => {
                    if(!this.state.readOnly) // Se já monta o componente no modo edição, carrega os dados no formulário.
                        this.toEditorMode()
                })
                .then(_ => this.setState({loading: false}))                
            }

            // Se id não numérico ou 0 nem tenta buscá-lo no backend, é inválido. Redireciona pro '/'
            else this.setState({redir: true})
        }  
    }

    // Get de 1 artigo pelo id
    async getArticle(id) {
        await axios.get(`${baseApiUrl}/articles/${id}`)
            .then(res => {                     
                this.setState({
                    article: {
                        ...res.data.article, 
                        created_at: res.data.article.created_at ? new Date(res.data.article.created_at) : null, 
                        updated_at: res.data.article.created_at ? new Date(res.data.article.updated_at) : null 
                    }, 
                    author: {...res.data.author} 
                })
            })            
            .catch(e => { // artigo não existe, rede ou erro desconhecido.
                if(e.response)
                    this.setState({error: e.response.data})
                else this.setState({error: e})
            })
    }

    // Verifica se o usuário é registrado, se é admin ou autor do artigo carregado, e seta alguns estados de acordo.
    async userCheck() {        
        if(this.props.user.get) {            
            const verifyToken = new Promise( resolve => {
                resolve(isValidToken(this.props.user.get) )
            })
    
            await verifyToken.then(res => {                
                if(res) { //token válido. continua.  
                    // Se o artigo é novo então o usuário logado é o autor e já abre no modo edição.
                    if(this.state.isNew) {                         
                        this.setState({adminOrAuthor: true, readOnly: false})
                    }

                    // No caso de um artigo existente, verificamos se o usuário é o autor e/ou admin, pra poder ter permissão de editá-lo.
                    else {
                        if(this.props.user.get.admin || (this.props.user.get.id === this.state.article.userId) )
                            this.setState({adminOrAuthor: true})
                       else { // Se o user não é admin e nem autor do artigo e a página foi carregada a partir de /perfil, não deixa editar o arquivo. 
                            if(this.props.isChild){
                                this.setState({readOnly: true})
                            }
                        }
                    }
                }
                else { // token inválido. desloga e limpa os dados do usuário. Mas ele continua na página, mas sem poder escrever.
                    this.props.user.set(false)
                    if(this.props.id === 'new')  // Se estava tentando criar novo artigo: redireciona.
                        this.setState({redir: true})
                }                
            })
            .then(_ => { // Verifica se o artigo não está publicado, se não tiver só o autor ou admin podem ter acesso.
                if(!this.state.error && !this.state.isNew && !this.state.article.published && !this.state.adminOrAuthor) {
                    this.setState({error: "Este artigo não está publicado."})
                }
            })
            .then(_ => this.setState({ validatingToken: false }))
            .catch( e => { //Erro de rede ou desconhecido.                
                this.setState({redir: true})
            })
        }

        // se usuário não logado. Se está tentando criar artigo redireciona pro '/' ou se o artigo não está publicado, não acessa.
        else { 
            if(this.props.id === 'new')  
                this.setState({redir: true})
            else { 
                if(!this.state.article.published)
                    this.setState({error: "Este artigo não está publicado."})
                this.setState({validatingToken: false}) 
            }
        }    
    }

    getCategoryName(id) {
        let name = ""
        this.props.categories.get.forEach(el => {
            if(id === el.id) {
                name = el.name
                return 
            }
        })
        return name
    }    
   
        
    // carrega os dados do artigo em state.temp, se os dados forem modificados mas descartados os dados originais estão 
    // protegidos em state.article. Este só muda se salvar as alterações mesmo.
    toEditorMode() { 
        this.setState({temp: {...this.state.article}, readOnly: false })
    }
    
    
    // Salva o artigo no backend seja criação ou alteração. Após isso faz um redirecionamento para o modo leitura, para '/' ou para 
    // a página pai se for o caso.
    saveArticle() {
        // Estes são os dados necessários pra criar ou alterar um artigo. As datas e o autor são definidos no backend. O autor é o 
        // usuário que fez a requisição para o backend.
        const articleToSend = {
            title: this.state.temp.title,
            description: this.state.temp.description,
            content: this.state.temp.content,
            published: this.state.temp.published,
            categoryId: this.state.temp.categoryId
        }

        // CRIAÇÃO
        if(this.state.isNew) { // Dando certo salva e redireciona.
            axios.post(`${baseApiUrl}/articles`, articleToSend)
                .then(res => {                             
                    toast.success(res.data, toastOptions)
                })
                .then(_ => this.setState({redir: true}))
                .catch((e) => { // trata erros diversos, geralmente de preenchimento do formulário.
                    if(e.response)
                        toast.error(e.response.data, toastOptions);

                    else toast.error(e, toastOptions)                    
                })
            
        }

        // ALTERAÇÃO
        else { 
            if(!this.props.isChild) { // Se o artigo não está dentro de outra página, volta para o modo somente leitura com os dados atualizados.
                axios.put(`${baseApiUrl}/articles/${this.props.id}`, articleToSend)
                    .then(res => {                             
                        toast.success(res.data, toastOptions)
                    })                
                    .then(_ => this.getArticle(this.props.id)) // Recarrega o artigo atualizado no state.
                    .then(_ => this.setState({readOnly: true})) 
                    .catch((e) => { // trata erros diversos, geralmente de preenchimento do formulário.
                        if(e.response)
                            toast.error(e.response.data, toastOptions);    
                        else toast.error(e, toastOptions)                    
                    })
            }
            else { // Se está dentro de outra página, fecha o arquivo após salvar no backend.
                axios.put(`${baseApiUrl}/articles/${this.props.id}`, articleToSend)
                    .then(res => {                             
                        toast.success(res.data, toastOptions)
                        this.props.isChild.close()
                    })
                    .catch((e) => { // trata erros diversos, geralmente de preenchimento do formulário.
                        if(e.response)
                            toast.error(e.response.data, toastOptions);    
                        else toast.error(e, toastOptions)                    
                    })
            }            
        }
    }


    async delArticle() {        
        await axios.delete(`${baseApiUrl}/articles/${this.props.id}`)
            .then(res => {
                toast.success(res.data, toastOptions)                
            })
            .catch((e) => { // Se o artigo (id) não existir cai aqui.
                if(e.response)
                    toast.error(e.response.data, toastOptions);
                else toast.error(e, toastOptions)                    
            })     
        if(this.props.isChild) {
            this.props.isChild.close() // Fecha essa página e volta pra a página pai.
        }
        else this.setState({redir: true}) // Redireciona para o '/'.   
    }


    // Aqui trata as mudança nos input, no select e no radio. Mudança no conteúdo do artigo é a função handleContentChange().
    handleChange(ev, field) {
        if(field === 'title' || field === 'description') { // inputs text: Title e Description
            this.setState({
                temp: { ...this.state.temp, [`${field}`]: `${ev.target.value}`}
            })
        }
        else { // radio: Published
            if(field === 'published') {
                this.setState({
                    temp: { ...this.state.temp, published: document.getElementById('isPublished').checked ? true : false }
                })
            }
            else { // select: CategoryId
                if(field === 'categoryId') {
                    let value
                    if(ev.target.selectedIndex > 0) {
                        value = ev.target.options[ev.target.selectedIndex].value
                    }
                    else value = ""

                    this.setState({
                        temp: { ...this.state.temp, categoryId: parseInt(value)}
                    })         
                }
            }
        }
    }

    //Mudança no conteúdo do artigo. O state.content é o conteúdo e essa função é o set.
    handleContentChange(contentFromEditor) {        
        this.setState({
            temp: {
                ...this.state.temp,
                content: contentFromEditor
            }
        })        
    }

    discard() {
        if(this.props.isChild) { // Se está montado dentro de outra página como /perfil ou /admin/articles
            this.props.isChild.close() // altera estado do pai desmontando este componente.
        }
        else {
            // Sai do modo edição sem mudar nada ou redir pro '/' se era criação de novo artigo
            if(this.state.isNew)
                this.setState({redir: true})
            else {
                // não faz nada, só volta para o modo leitura que lê os dados de state.article. No modo edição lê de state.temp.
                this.setState({readOnly: true})
            }
        }
    }


    // a página no modo só de leitura
    readMode() {        
        const categoryName = this.getCategoryName(this.state.article.categoryId)
        let breadcrumb = ""
        if(!this.state.isNew) {
            breadcrumb = <div className="breadcrumb"><Link to='/'>Home</Link><span>{" / "}</span><Link to={`/categories/${this.state.article.categoryId}`}>{categoryName}</Link></div>
        }

        let btnReadWrite = ""
        if(this.state.adminOrAuthor)
            btnReadWrite = <p><button className="btn btn-primary my-2" onClick={e => this.toEditorMode()}>Editar artigo</button></p>

        // Lidando com as datas de publicação e atualização.
        let dateInfo = ""
        let notPublished = ""
        if(this.state.article.created_at) {// Artigo já foi publicado
            dateInfo = "Publicado em " + this.state.article.created_at.toLocaleDateString() + "."
            if(`${this.state.article.created_at}` !== `${this.state.article.updated_at}`)
                dateInfo += " Atualizado em " + this.state.article.updated_at.toLocaleDateString() + "."
            if(!this.state.article.published) {
                notPublished = " Este artigo não está publicado no momento."
            }
        }
        else { // artigo nunca foi publicado.            
            notPublished = "Este artigo nunca foi publicado."
        }
        
        return (
            <div className="read-article mt-4">   
                {breadcrumb}                

                <div className="d-flex flex-column-reverse flex-sm-row justify-content-between">
                    {/* data na esqerda e avatar na direita */}
                    <div className="date-info" >
                        <span>{dateInfo}</span>
                    </div>
                    <div className="author">
                        <img className="" src={this.state.author.avatar} alt="avatar do autor" />
                        <span className="ms-2">{`Por: ${this.state.author.name}`}</span>
                    </div>
                </div>

                {btnReadWrite}

                {/* aviso de artigo não publicado */}
                <div className="not-published bg-warning text-dark my-2 text-center">
                    <span>{notPublished}</span>
                </div>

                <h2>{this.state.article.title}</h2>
                <p>{this.state.article.description}</p>
                
                <ArticleEditor content={this.state.article.content} readOnly={true} onContentStateChange={this.handleContentChange}/>
            </div>
        )
    }

    // A página no modo de edição
    editorMode() {
        const pageTitle = this.state.isNew ? "Novo Artigo" : "Editar Artigo"
        const btnDeleteArticle = this.state.isNew ? "" : <button type="button" className="btn btn-danger" data-bs-toggle="modal" data-bs-target="#delArticleModal">Excluir</button>
        // Montagem do combobox de categorias.
        const categoryName = this.getCategoryName(this.state.temp.categoryId)        
        let selectedCat = 0
        const categoryOptions = []
        categoryOptions.push(<option key="zero" value="">Selecione uma categoria</option>)
        for(let i in this.props.categories.get) {            
            if (this.props.categories.get[i].name === categoryName) {
                selectedCat = i
            }
            categoryOptions.push(<option key={i+1} value={this.props.categories.get[i].id}>{this.props.categories.get[i].name}</option>)
        }        

        return (
            <div className="write-article mt-4">                   
                <h2>{pageTitle}</h2>
                {/* Título do artigo */}
                <div className="mb-3 row">
                    <label htmlFor="articleTitle" className="form-label col-sm-3 col-md-2 col-form-label">Título</label>
                    <div className="col-sm-9">
                        <input type="text" id="articleTitle" className="form-control" value={this.state.temp.title} name="title" onChange={e => this.handleChange(e, e.target.name)} />                        
                    </div>
                </div>

                {/* Descrição do artigo */}
                <div className="mb-3 row">
                    <label htmlFor="articleDescription" className="form-label col-sm-3 col-md-2 col-form-label">Descrição</label>
                    <div className="col-sm-9">                        
                        <input type="text" id="articleDescription" className="form-control" value={this.state.temp.description} name="description" onChange={e => this.handleChange(e, e.target.name)}/>
                    </div>
                </div>

                {/* Categorias */}
                <div className="mb-3 row">
                    <label htmlFor="categoryList" className="form-label col-sm-3 col-md-2 col-form-label">Categoria</label>
                    <div className="col-auto">
                        <select className="form-select" name="categoryId" id="categoryList" defaultValue={selectedCat ? this.props.categories.get[selectedCat].id : ""} onChange={e => this.handleChange(e, e.target.name)} >
                            {categoryOptions}
                        </select>
                    </div>
                </div>
                
                <ArticleEditor content={this.state.temp.content} readOnly={this.state.readOnly} onContentStateChange={this.handleContentChange}/> 

                {/* Publicação */}
                <p className="mb-2">Publicar artigo?</p>
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" id="isPublished" name="published" value="1" defaultChecked={this.state.temp.published} onChange={e => this.handleChange(e, e.target.name)}/>
                    <label className="form-check-label" htmlFor="published">Sim, publicar agora.</label>
                </div>
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" id="isNotPublished" name="published" value="0" defaultChecked={!this.state.temp.published} onChange={e => this.handleChange(e, e.target.name)}/>
                    <label className="form-check-label" htmlFor="notPublished">Não, publicarei depois.</label>                    
                </div>


                <div className="mt-4">
                    <button className="btn btn-success me-3" onClick={e => this.saveArticle()}>Salvar</button>
                    <button className="btn btn-dark me-3" onClick={e => this.discard()}>Descartar</button>
                    {btnDeleteArticle}
                </div>

                {/* Modal da exclusão */}
                <div className="modal fade" id="delArticleModal" tabIndex="-1" aria-labelledby="delArticleModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="delArticleModalLabel">Excluir artigo</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            Tem certeza que deseja excluir este artigo? Após a exclusão não será possível recuperá-lo.
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Não</button>
                            <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={e => this.delArticle()}>Sim</button>
                        </div>
                        </div>
                    </div>
                </div>
                
            </div>
        )
    }

    // O componente tem 2 aparências: Se está no modo edição carrega inputs, radio, editor richtext, etc. 
    // Se for modo somente leitura carrega os dados do artigo formatados e estilizados com CSS.
    render() {
        // Se é usuário não logado tentando criar artigo ou descartou na criação do artigo redireciona.        
        if(this.state.redir)
            return <Redirect to='/' />

        // loading
        if(this.state.loading || this.state.validatingToken) {            
            return <div className="loading_div"><img src={loadingImg} alt="Carregando" className="loading_img"/></div>
        }
        
        
        // Se encontrou o artigo renderiza ele todo no modo leitura a menos que readOnly=false daí renderiza no modo edição.
        // Ou se é criação de artigo, renderiza os campos do artigo no modo de edição.
        if(!this.state.error) {
            if(this.state.readOnly) { // renderiza no modo somente leitura                
                return this.readMode()
            }
            else { // renderiza no modo de edição                
                return this.editorMode()
            }            
        }
        
        // Se não encontrou o artigo
        else return <div className="text-center mt-5">{this.state.error}</div> 
    }
}