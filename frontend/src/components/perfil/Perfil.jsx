// Perfil do usuário. Só aparece pra usuário logado.

import './Perfil.css'
import { Redirect } from 'react-router'
import { baseApiUrl, isValidToken, toastOptions } from '../../global'
import { Component } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import AvatarEditor from '../avatarEditor/AvatarEditor'
import defaultAvatar from '../../assets/img/defaultAvatar.png'
import loadingImg from '../../assets/img/loading.gif'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Article from '../article/Article'



// Ordena a tabela pela coluna onclick. Essa função só é usada quando há apenas 1 página pra evitar acesso desnecessário ao backend.
function sortTableLocal(tableColumn, dataType, asc=true) {
    console.log("ordenando table... com col, tipo, ascdesc: ", tableColumn, dataType, asc)
    let table, rows, switching, i, x, y, xdate, ydate, shouldSwitch;
    table = document.getElementById("articleTable");
    
    switching = true;    
    // Faz um loop até que nenhuma troca de linha seja feita.
    while (switching) {           
        switching = false;
        rows = table.rows;        
        // Faz um loop em todas as linhas da tabela menos na primeira que é o cabeçalho.
        for (i = 1; i < (rows.length - 1); i++) {            
            shouldSwitch = false;            
            // Pega os 2 elementos que queremos comparar, a linha atual e a próxima.
            x = rows[i].getElementsByTagName("TD")[tableColumn];
            y = rows[i + 1].getElementsByTagName("TD")[tableColumn];

            // Primeiro checa se a coluna é de inteiro, string ou data, e então compara as duas linhas.

            if(dataType === 1) { // inteiro
                if(asc) {
                    if (parseInt(x.innerHTML) > parseInt(y.innerHTML)) {                    
                        shouldSwitch = true;
                        break; // sai do laço for
                    }
                }
                else {
                    if (parseInt(x.innerHTML) < parseInt(y.innerHTML)) {                    
                        shouldSwitch = true;
                        break; // sai do laço for
                    }
                }
            }

            else if(dataType === 2) { // data
                xdate = x.innerHTML.split('/').reverse().join('');
                ydate = y.innerHTML.split('/').reverse().join('');
                if(!parseInt(xdate))
                    xdate = "30000000" // Se nunca foi publicado
                if(!parseInt(ydate))
                    ydate = "30000000" // Se nunca foi publicado
                console.log(xdate, " ", ydate)
                

                    if(asc) {
                        if (parseInt(xdate) > parseInt(ydate)) {                    
                            shouldSwitch = true;
                            break; // sai do laço for
                        }
                    }
                    else {                     
                        if (parseInt(xdate) < parseInt(ydate) ) {                    
                            shouldSwitch = true;
                            break; // sai do laço for
                        }                    
                    }
                
            }

            else { // string
                if(asc) {
                    if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {                    
                        shouldSwitch = true;
                        break; // sai do laço for
                    }
                }
                else {                     
                    if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {                    
                        shouldSwitch = true;
                        break; // sai do laço for
                    }                    
                }
            }  
        }
        
        if (shouldSwitch) {            
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}


export default class Perfil extends Component {
    constructor(props) {
        super(props)
        this.setAvatar = this.setAvatar.bind(this)
        this.closeArticle = this.closeArticle.bind(this)        
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
            tempImg: null, // imagem em edição 100x100 vinda do RAE, ao final da edição salva em this.state.user.avatar
            editingArticle: false, // Se está editando um artigo renderiza só ele.            
            articles: [],
            count: 0,
            limit: this.props.pagOptions.get.tLimit,
            page: 1,
            loading: true,
            selectedColumn: "",
            ascOrder: true
        }
    }

    componentDidMount() {
        console.log("Perfil montado")
        
        // Valida o token do usuário e se tiver OK pega a tabela de artigos deste usuário no backend.
        const load = new Promise(resolve => {            
            resolve(this.validateUser())
        })        
        load.then(_ => this.getUserArticles())
        .catch(e => {
            if(e.response) {
                toast.error(e.response.data, toastOptions)
            }
            else console.log(e)
        })
    }
    
    componentDidUpdate(prevProps) {        
        if(this.props.pagOptions.get !== prevProps.pagOptions.get) {
            console.log("updatano: ", this.props.pagOptions.get)
            this.setState({loading: true})
            this.getUserArticles()            
        }        
    }

    // Valida o user no backend
    validateUser() {
        if (this.props.user.get) {
            const verifyToken = new Promise(resolve => {
                this.setState({ validatingToken: true })
                resolve(isValidToken(this.props.user.get))
            })

            verifyToken.then(res => {
                if (res) { // token válido. continua.
                    this.setState({ validatingToken: false })
                }
                else { // token inválido. desloga, limpa os dados do usuário.
                    this.props.user.set(false)
                }
            })            
            .catch(e => {
                if(e.response)
                    toast.error(e.response.data, toastOptions)
                else console.log(e)
            })            
        }
    }

    // Essa função pega os artigos do usuário logado no backend. Usa até 4 query strings: asc, col, lim e page.
    async getUserArticles() {
        await axios.get(`${baseApiUrl}/home?asc=${this.props.pagOptions.get.asc === true ? 1 : 0}&col=${this.props.pagOptions.get.col}&lim=${this.props.pagOptions.get.tLimit}&page=${this.state.page}`)
        .then(res => {            
            // Se não encontrou nenhum artigo         
            if(!res.data.data.length) {
                this.setState({
                    articles: [],
                    count: 0,
                    limit: this.props.pagOptions.get.tLimit,
                    page: 1                    
                })
            }
            else { // Se encontrou um ou mais artigos
                console.log(res.data)
                this.setState({
                    articles: res.data.data,
                    count: res.data.count,
                    limit: res.data.limit,
                    page: res.data.page
                })
            }
        })        
        .then(this.setState({loading: false}))
        .catch( e => {            
            if (e.response)
                toast.error(e.response.data, toastOptions)
            else toast.error(e, toastOptions)
        })
    }

    // Muda a página da tabela.
    async handlePageChange(ev) {
        ev.preventDefault();
        const newPage = parseInt(ev.target.innerText) ? parseInt(ev.target.innerText) : 1
        await this.setState({page: newPage, loading: true} )
        this.getUserArticles()
    }

    // Muda a qtde de itens por página da tabela.
    handleLimitChange(ev) {        
        this.props.pagOptions.set({
            tLimit: parseInt(ev.target.value) ? parseInt(ev.target.value) : 0
        })        
    }
    

    // Essa função é usada dentro do editor de artigo pra fechar o artigo e voltar para o perfil.
    async closeArticle() {
        console.log("fechando arquivo")
        await this.setState({loading: true, editingArticle: false} )
        this.getUserArticles() // Atualiza a lista de artigos
    }

    // Pega a resposta do backend contendo um array de artigos e transforma isso numa tabela de artigos.
    articlesToTable() {        
        // Cria um array com os [name=] das colunas do <thead>.
        // São 7 colunas: id, created_at, updated_at, title, description, published, categoryname
        const rawArticleTheadData = Object.keys(this.state.articles[0]) // [ ...todas-as-colunas ]        

        // Seleciona quais colunas vão pra tabela e a ordem de cada.
        const articleTheadData = [] // ['title', 'category', 'created_at', 'updated_at', 'published']
        for(let i in rawArticleTheadData) {
            switch(rawArticleTheadData[i]) {
                case "title":
                    articleTheadData[0] = rawArticleTheadData[i]
                    break
                case "categoryname":
                    articleTheadData[1] = rawArticleTheadData[i]
                    break
                case "created_at":
                    articleTheadData[2] = rawArticleTheadData[i]
                    break
                case "updated_at":
                    articleTheadData[3] = rawArticleTheadData[i]
                    break
                case "published":
                    articleTheadData[4] = rawArticleTheadData[i]
                    break
                case "id":
                    articleTheadData[5] = rawArticleTheadData[i]
                    break
                default: break
            }
        }
        
        // Cria um array com os [value=] das colunas do <thead>. 
        const labels = ["Título", 
                        "Categoria", 
                        "Postado em", 
                        "Atualizado em",
                        "Publicado",
                        'Código']

        // Monta o cabeçalho da tabela.
        const articleTheadField = []
        for(let i in articleTheadData) {              
            if( i === "2" || i === "3") { // colunas de datas created_at e updated_at
                articleTheadField.push(<th key={`${i}`} className="theadClick" onClick={e => this.sortTable(e, i, 2)} name={articleTheadData[i]}>{labels[i]}<i className="fas fa-sort ms-3"></i></th>)
            }
            else if(i < (labels.length-1) ) 
                articleTheadField.push(<th key={`${i}`} className="theadClick" onClick={e => this.sortTable(e, i, 0)} name={articleTheadData[i]}>{labels[i]}<i className="fas fa-sort ms-3"></i></th>)

            // Coluna ID. Essa coluna não é mostrada, é usada só pra carregar o artigo onClick na tabela.
            else articleTheadField.push(<th key={`${i}`} className="theadClick d-none" onClick={e => this.sortTable(e, i, 1)} name={articleTheadData[i]}>{labels[i]}<i className="fas fa-sort ms-3"></i></th>)
        }
        
        // A linha de cabeçalhos pronta.
        let articleThead = <thead className="table-primary"><tr>{articleTheadField}</tr></thead>


        // Cria um array de arrays com os values dos objetos. Cada item é uma linha, um artigo.
        let articleTbodyData = []
        let oneArticle       
        
        this.state.articles.forEach( obj => {            
            oneArticle = []
            for (let attribKey in obj ) {                  
                switch(attribKey) {
                    case "title":
                        oneArticle[0] = `${obj[attribKey]}`
                        break
                    case "categoryname":
                        oneArticle[1] = `${obj[attribKey]}`
                        break
                    case "created_at":
                        oneArticle[2] = this.timestampToCustomDate(obj[attribKey]) // Pode vir uma data ou null; toLocaleDateString()
                        break
                    case "updated_at":
                        oneArticle[3] = this.timestampToCustomDate(obj[attribKey]) // Pode vir uma data ou null.
                        break
                    case "published":
                        oneArticle[4] = obj[attribKey] === true ? "Sim" : "Não"
                        break
                    case "id":
                        oneArticle[5] = `${obj[attribKey]}`
                        break
                    default: break
                }                
            }            
            articleTbodyData.push(oneArticle)
        })        

        // Monta o corpo da tabela. A coluna de ID é escondida, ela é usada só pra lidar com os dados do artigo.        
        const articleRows = []
        let articleField = []
        for(let i in articleTbodyData) {
            for(let x in articleTbodyData[i]) {                
                if(x < (articleTbodyData[i].length-1) ) 
                    articleField.push(<td key={`${i},${x}`}>{`${articleTbodyData[i][x]}`}</td>) 
                else articleField.push(<td key={`${i},${x}`} className="d-none" >{`${articleTbodyData[i][x]}`}</td>) // Coluna do ID
            }
            articleRows.push(<tr className="articleRow" key={`${i}`} onClick={e => this.loadArticle(e)}>{articleField}</tr>)
            articleField = []
        }
        const articleTbody = <tbody className="table-light">{articleRows}</tbody>
        const articleTheadTbody = 
            <table id="articleTable"className="table table-hover caption-top mt-4">                
                {articleThead} 
                {articleTbody}
            </table>
        
        return articleTheadTbody
    }

    // Esse método define o modo de orenação da tabela, se local, ou seja, apenas com os dados no frontend (Quando tem só 1 página) 
    // ou se faz uma nova busca no backend.
    sortTable(ev, tableColumn, dataType) {        
        if(Math.ceil(this.state.count / this.state.limit) > 1) { // Ordena a tabela quando tem mais de 1 página. Faz uma nova consulta no backend.
            if(ev.target.getAttribute("name") === this.props.pagOptions.get.col)
                this.props.pagOptions.set({col: ev.target.getAttribute("name"), asc: !this.props.pagOptions.get.asc})
            else  this.props.pagOptions.set({col: ev.target.getAttribute("name"), asc: false})
        }
        else sortTableLocal(tableColumn, dataType, this.isAsc(ev.target.getAttribute("name"))) // ordena quando a tabela tem só 1 página. Não vai no backend.
    }
    // Essa função é usada pra definir a ordem da tabela como ascendente ou descendente. Só é usada quando há apenas 1 página, não acessa o backend.    
    isAsc(elementName) {
        if(elementName === this.state.selectedColumn) {
            this.setState({ascOrder: !this.state.ascOrder})
            return !this.state.ascOrder
        }
        else {
            this.setState({selectedColumn: elementName, ascOrder: true})
            return true
        }
    }
    // Essa função converte a data vinda do backend para o horário local e num formato mais apresentável.
    timestampToCustomDate(dateObj) {
        let customDate = "Nunca"
        
        if(dateObj) {
            customDate = new Date(dateObj)            
            customDate = customDate.toLocaleDateString()            
        }        
        return customDate
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
                    toast.error(e.response.data, toastOptions)
                else toast.error(e, toastOptions)
            })
    }

    // Altera usuário no backend
    updateUser() {
        axios.put(`${baseApiUrl}/home`, this.state.user)
            .then(res => {
                toast.success(res.data, toastOptions)
                // Reloga o usuário com as informações atualizadas.
                this.reLogin()
            })
            .catch((e) => {
                if (e.response) {
                    if (e.response.status === 401) { // Não autorizado. Isso é token expirado.
                        toast.error(e.response.data, toastOptions)
                        this.props.user.set(false)
                    }
                    else toast.error(e.response.data, toastOptions)
                }
                else toast.error(e, toastOptions)
            })
    }

    // Essa função é chamada no onClick do input file da imagem. Carrega o arquivo de imagem numa variável e passa pro Avatar Editor tornando-o visível.
    imgHandler(ev) {
        let file = ev.target.files[0]; // O arquivo q tava no PC. formato File.
                
        if(file) {             
            this.setState({imageLoaded: file}); // Monta o React Avatar Editor(RAE), passa o file.
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

    // Carrega o artigo onClick na tabela usando seu id. Mostra só o artigo e esconde todo resto.
    loadArticle(ev) {        
        let id = parseInt(ev.currentTarget.children[5].innerHTML) || 0
        console.log(id)
        this.setState({articleId: id})
        this.setState({editingArticle: true})
    }

    // Essa função recebe um numero total de páginas e a página atual e com isso faz um array que monta uma lista de páginas mostrando 
    // sempre a primeira, a última, a página atual e as páginas próximas a atual.
    navPaginator(totalPages, currentPage) {
        // Por padrão é pra exibir até 11 páginas. A 1ª e a ultima sempre são exibidas e há uma janela deslizante de até 9 páginas no meio sendo a página atual 
        // e mais totalAmount/2 de cada lado.
        const totalAmount = 8 // deve ser par
        let leftAmount = 0
        let rightAmount = 0
        let leftOverplus = 0
        let rightOverplus = 0

        const paginas = [] // primeira coisa é adicionar a primeira página. SE for a currentPage mete um selected.
        if(currentPage === 1 )
            paginas.push(<li key="1" className='page-item active' aria-current="page"><a className='page-link' href="#" onClick={e => this.handlePageChange(e)}>1</a></li>)
        else paginas.push(<li key="1" className='page-item'><a className='page-link' href="#" onClick={e => this.handlePageChange(e)}>1</a></li>)


        if(totalPages > 2) {
            // Quantos cabem na esquerda e quantos cabem na direita no máximo.
            for(let offset = totalAmount; offset > 0; offset--) {
                // Verifica na esquerda.
                if( !leftAmount && (currentPage - offset) > 1 ) 
                    leftAmount = offset
                // Verifica na direita.
                if( !rightAmount && (currentPage + offset) < totalPages ) 
                    rightAmount = offset
                // Se já achou o deslocamento máximo de ambos sai do loop.
                if(leftAmount && rightAmount) {
                    offset = 0 
                }
            }
            
            // Define o deslocamento da janela, se um lado cabe menos que totalAmount/2 o que faltar vai aumentar no lado oposto a menos 
            // que não caiba também. 
            if(leftAmount < (totalAmount/2) )
                leftOverplus  = totalAmount/2 - leftAmount
            if(rightAmount < (totalAmount/2) )
                rightOverplus = totalAmount/2 - rightAmount

            // Agora define a qtde real de itens de cada lado da página atual.
            // Se não tem sobras na direita, do lado esquerdo vai totalAmount/2 ou menos.
            if(!rightOverplus)
                leftAmount = leftAmount <= (totalAmount/2) ? leftAmount : totalAmount/2
            else { // Se tem sobras na direita, do lado esquerdo vai oq couber ou (totalAmount/2 + rightOverplus), o que for menor.
                leftAmount = leftAmount <= ((totalAmount/2) + rightOverplus) ? leftAmount : ((totalAmount/2) + rightOverplus)
            }            
            // Se não tem sobras na esquerda, do lado direito vai totalAmount/2 ou menos.
            if(!leftOverplus)
                rightAmount = rightAmount <= (totalAmount/2) ? rightAmount : totalAmount/2
            else { // Se tem sobras na direita, do lado esquerdo vai oq couber ou (totalAmount/2 + rightOverplus), o que for menor.
                rightAmount = rightAmount <= ((totalAmount/2) + leftOverplus) ? rightAmount : ((totalAmount/2) + leftOverplus)
            }
             

            // Agora é só renderizar as páginas. 
            // Primeiro printa os na esquerda
            for(let i = leftAmount; i > 0; i--) {   
                if(i === leftAmount && (currentPage - i - 1) > 1)                    
                    paginas.push(<li key="farleft" className='page-item disabled'><a className='page-link' href="#" tabindex="-1" aria-disabled="true">{"..."}</a></li>)

                paginas.push(<li key={currentPage - i} className='page-item'><a className='page-link' href="#" onClick={e => this.handlePageChange(e)}>{currentPage - i}</a></li>)
            }

            //Agora renderiza a pagina atual se esta não for nem a 1ª e nem a última.
            if(currentPage !== 1 && currentPage !== totalPages ) {                
                paginas.push(<li key={currentPage} className='page-item active'><a className='page-link' href='#' onClick={e => this.handlePageChange(e)}>{currentPage}</a></li>)
            }

            // Em seguida renderiza os na direita
            for(let i = 1; i <= rightAmount; i++) {
                paginas.push(<li key={currentPage + i} className='page-item'><a className='page-link' href='#' onClick={e => this.handlePageChange(e)}>{currentPage + i}</a></li>)
                if(i === rightAmount && (currentPage + i + 1) < totalPages)                    
                    paginas.push(<li key="farright" className='page-item disabled'><a className='page-link' href="#" tabindex="-1" aria-disabled="true">{"..."}</a></li>)
            }
            
            // Por fim renderiza a última página seja a atual ou não.
            if(totalPages === currentPage)                
                paginas.push(<li key={totalPages} className='page-item active'><a className='page-link' href='#' onClick={e => this.handlePageChange(e)}>{totalPages}</a></li>)
            else {
                paginas.push(<li key={totalPages} className='page-item'><a className='page-link' href='#' onClick={e => this.handlePageChange(e)}>{totalPages}</a></li>)
            }
        }
        else if(totalPages === 2) 
            if(totalPages === currentPage)                
                paginas.push(<li key={2} className='page-item active'><a className='page-link' href='#' onClick={e => this.handlePageChange(e) }>{2}</a></li>)
            else {
                paginas.push(<li key={2} className='page-item'><a className='page-link' href='#' onClick={e => this.handlePageChange(e)}>{2}</a></li>)
            }

        
        return(
            <nav className="d-flex align-self-center" aria-label="Navegação da lista de artigos">
                <ul className="pagination">
                    {paginas}
                </ul>
            </nav>
        )
    }


    render() {
        // Se não tem usuário logado e não está relogando o usuário: Redireciona pra tela de login.
        if ((!this.props.user.get && !this.state.reLogging))
            return <Redirect to='/login' />

        // Se está validando o token no backend
        if (this.state.validatingToken || this.state.loading)
            return <div className="loadiv"><img src={loadingImg} className="loading"/></div>

        // Se um artigo está aberto pra edição exibe somente ele.
        if(this.state.editingArticle) {
            return (                
                <Article id={this.state.articleId} user={this.props.user} categories={this.props.categories} editorMode={true} isChild={{close: this.closeArticle}}/>
            )
        }

        const totalPages = Math.ceil(this.state.count / this.state.limit)
        const articleTable = this.state.count ? this.articlesToTable() : ""
        
        let table = <p>Você ainda não escreveu nenhum artigo.</p>
        // verifica se tem artigo. Se não tiver mostra a mensagem acima ao invés da tabela.
        if(this.state.articles.length > 0) {
            table = (
                <div>
                    <div className="table-responsive">                        
                            {articleTable}
                    </div>
                    <div>
                        {this.navPaginator(totalPages, this.state.page)}
                        
                        <label htmlFor="perpage">Por página: 
                            <select name="tLimit" id="perpage" value={`${this.state.limit}`} onChange={e => this.handleLimitChange(e)}>
                                <option  value="3">3</option>
                                <option  value="5">5</option>
                                <option  value="10">10</option>
                            </select>
                        </label>
                    </div>
                </div>
            )
        }
        

        return (
            <div className="col-12 col-sm-9 col-md-8 col-lg-6 col-xl-6 perfil">
                <h2>Dados do usuário</h2>
                <p>Preencha todos os campos abaixo para alterar seus dados.</p>

                <div className="border rounded p-4 " >

                    {/* Avatar do usuario */}
                    <div className="mb-3 row d-sm-flex align-items-center" >
                        <div className="">
                            <img className="avatarImg" src={this.state.user.avatar} alt="avatar" data-bs-toggle="modal" data-bs-target="#avatarModal"/>
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
                
                <h2>Seus artigos</h2>
                <p>Todos os artigos de sua autoria, publicados ou não, estão aqui.</p>
                <div className="border rounded p-4 " >
                    {/* Se escreveu artigo mostra a tabela senão mostra uma mensagem. */}
                    {table}
                </div>

            </div>
        )
    }
}