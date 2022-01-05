// Página de administração dos artigos. Lista, altera e exclui artigos.

import axios from "axios"
import { Component } from "react"
import { toast } from "react-toastify"
import { baseApiUrl, toastOptions } from "../../../global"
import loadingImg from '../../../assets/img/loading.gif'
import Article from "../../article/Article"


export default class Articles extends Component {
    constructor(props) {
        super(props)
        this.closeArticle = this.closeArticle.bind(this)
        this.state = {
            loading: true,
            editingArticle: false,
            articleId: 0,
            articles: [],
            count: 0,
            limit: this.props.pagOptions.get.tLimit,
            page: 1,
            ascOrder: true,
            selectedColumn: ""
        }
    }

    componentDidMount() {
        console.log("Adm Articles montado")
        this.getArticles() // Pega os artigos no backend e armazena no this.state
    }
    
    componentDidUpdate(prevProps) {        
        if(this.props.pagOptions.get !== prevProps.pagOptions.get) {            
            this.setState({loading: true})
            this.getArticles()            
        }        
    }
    
    // Essa função pega os artigos no backend. Usa até 4 query strings: asc, col, lim e page.
    async getArticles() {
        await axios.get(`${baseApiUrl}/articles?asc=${this.props.pagOptions.get.asc === true ? 1 : 0}&col=${this.props.pagOptions.get.col}&lim=${this.props.pagOptions.get.tLimit}&page=${this.state.page}`)
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
        this.getArticles()
    }

    // Muda a qtde de itens por página da tabela.
    handleLimitChange(ev) {        
        this.props.pagOptions.set({
            tLimit: parseInt(ev.target.value) ? parseInt(ev.target.value) : 0
        })        
    }

    // Essa função é usada dentro do editor de artigo pra fechar o artigo e voltar para o perfil.
    async closeArticle() {        
        await this.setState({loading: true, editingArticle: false} )
        this.getArticles() // Atualiza a lista de artigos
    }

    // Pega a resposta do backend contendo um array de artigos e transforma isso numa tabela de artigos.    
    articlesToTable() {
        // Cria um array com os [name=] das colunas do <thead>.          
        // São 7 colunas: id, title, created_at, updated_at, published, categoryName, author
        const rawArticleTheadData = Object.keys(this.state.articles[0]) // [ ...todas-as-colunas ]

        // Seleciona quais colunas vão pra tabela e a ordem de cada.
        const articleTheadData = [] // ['title', 'categoryName', 'author', created_at', 'updated_at', 'published', 'id']
        for(let i in rawArticleTheadData) {
            switch(rawArticleTheadData[i]) {
                case "title":
                    articleTheadData[0] = rawArticleTheadData[i]
                    break
                case "categoryname":
                    articleTheadData[1] = rawArticleTheadData[i]
                    break
                case "author":
                    articleTheadData[2] = rawArticleTheadData[i]
                    break
                case "created_at":
                    articleTheadData[3] = rawArticleTheadData[i]
                    break
                case "updated_at":
                    articleTheadData[4] = rawArticleTheadData[i]
                    break
                case "published":
                    articleTheadData[5] = rawArticleTheadData[i]
                    break
                case "id":
                    articleTheadData[6] = rawArticleTheadData[i]
                    break                
                default: break
            }
        }
        
        // Cria um array com os [value=] das colunas do <thead>. 
        const labels = ["Título", 
                        "Categoria", 
                        "Autor", 
                        "Postado em", 
                        "Atualizado em",
                        "Publicado",
                        'Código']

        // Monta o cabeçalho da tabela.
        const articleTheadField = []
        for(let i in articleTheadData) {                          
            if(i < (labels.length-1) ) 
                articleTheadField.push(<th key={`${i}`} className="theadClick" onClick={e => this.sortTable(e)} name={articleTheadData[i]}>{labels[i]}<i className="fas fa-sort ms-3"></i></th>)

            // Coluna ID. Essa coluna não é mostrada, é usada só pra carregar o artigo onClick na tabela.
            else articleTheadField.push(<th key={`${i}`} className="theadClick d-none" onClick={e => this.sortTable(e)} name={articleTheadData[i]}>{labels[i]}<i className="fas fa-sort ms-3"></i></th>)
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
                    case "author":
                        oneArticle[2] = `${obj[attribKey]}`
                        break
                    case "created_at":
                        oneArticle[3] = this.timestampToCustomDate(obj[attribKey]) // Pode vir uma data ou null; toLocaleDateString()
                        break
                    case "updated_at":
                        oneArticle[4] = this.timestampToCustomDate(obj[attribKey]) // Pode vir uma data ou null.
                        break
                    case "published":
                        oneArticle[5] = obj[attribKey] === true ? "Sim" : "Não"
                        break
                    case "id":
                        oneArticle[6] = `${obj[attribKey]}`
                        break
                    default: break
                }                
            }            
            articleTbodyData.push(oneArticle)
        })        

        // Monta o corpo da tabela. A coluna de ID é escondida, ela é usada só pra carregar o arquivo onclick na tabela.
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
                <caption className="tTitle text-center">Todos os artigos</caption>            
                {articleThead} 
                {articleTbody}
            </table>
        
        return articleTheadTbody
    }

    // Carrega o artigo. Renderiza o componente Article.jsx com ID do artigo clicado.
    loadArticle(ev) {            
        let id = parseInt(ev.currentTarget.children[6].innerHTML) || 0        
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

    // Essa função converte a data vinda do backend para o horário local e num formato mais apresentável.
    timestampToCustomDate(dateObj) {
        let customDate = "Nunca"
        
        if(dateObj) {
            customDate = new Date(dateObj)            
            customDate = customDate.toLocaleDateString()            
        }        
        return customDate
    }

    // Esse método resulta numa nova requisição no backend ordenando o resultado pela coluna clicada na tabela.
    sortTable(ev) {        
        if(ev.target.getAttribute("name") === this.props.pagOptions.get.col)
            this.props.pagOptions.set({col: ev.target.getAttribute("name"), asc: !this.props.pagOptions.get.asc})
        else  this.props.pagOptions.set({col: ev.target.getAttribute("name"), asc: false})        
    }

    render() {
        if(this.state.loading)
            return <div className="loadiv"><img src={loadingImg} className="loading"/></div>

        // Se um artigo está aberto pra edição exibe somente ele.
        if(this.state.editingArticle) {
            return (                
                <Article id={this.state.articleId} user={this.props.user} categories={this.props.categories} editorMode={true} isChild={{close: this.closeArticle}}/>
            )
        }

        const totalPages = Math.ceil(this.state.count / this.state.limit)
        const articleTable = this.state.count ? this.articlesToTable() : ""
        
        let table = <p>Nenhum artigo encontrado.</p>
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

        return <div>{table}</div>
    }
}