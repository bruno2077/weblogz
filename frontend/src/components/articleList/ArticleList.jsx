// Esse componente renderiza uma lista de artigos. Recebe como props um objeto content que contém os artigos e paginationOptions que são 
// as opções de paginação. pode vir um, nenhum ou vários artigos na lista.

import { Component } from 'react'
import { Link } from 'react-router-dom'
import './ArticleList.css'


export default class ArticleList extends Component {
    constructor(props) {
        super(props)
        this.state = {           
            content: this.props.content            
        }
    }
    
    componentDidMount() {
        console.log("ArticleList montado.")
    }

    componentDidUpdate(prevProps) {        
        if(this.props.content !== prevProps.content) {
            this.setState({content: this.props.content})
        }
    }


    // Essa função recebe um numero total de páginas e a página atual e com isso faz um array que monta uma lista de páginas mostrando 
    // sempre a primeira a última, a página atual e as páginas próximas a atual.
    navPaginator(totalPages, currentPage) {
        // Por padrão é pra exibir até 11 páginas. A 1ª e a ultima sempre são exibidas e há uma janela deslizante de até 9 páginas no meio sendo a página atual 
        // e mais totalAmount/2 de cada lado.
        const totalAmount = 8 // deve ser par
        let leftAmount = 0
        let rightAmount = 0
        let leftOverplus = 0
        let rightOverplus = 0

        const pages = [] // primeira coisa é criar a primeira página. SE for a currentPage mete um selected.
        if(currentPage === 1 )
            pages.push(<li key="1" className='page-item active' aria-current="page"><Link className='page-link' to={`${window.location.pathname}?page=${1}`}>1</Link></li>)
        else pages.push(<li key="1" className='page-item'><Link className='page-link' to={`${window.location.pathname}?page=${1}`}>1</Link></li>)


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
                    pages.push(<li key="farleft" className='page-item disabled'><a className='page-link' href="/#" tabindex="-1" aria-disabled="true">{"..."}</a></li>)

                pages.push(<li key={currentPage - i} className='page-item'><Link className='page-link' to={`${window.location.pathname}?page=${currentPage - i}`}>{currentPage - i}</Link></li>)
            }

            //Agora renderiza a pagina atual se esta não for nem a 1ª e nem a última.
            if(currentPage !== 1 && currentPage !== totalPages ) {                
                pages.push(<li key={currentPage} className='page-item active'><Link className='page-link' to={`${window.location.pathname}?page=${currentPage}`}>{currentPage}</Link></li>)
            }

            // Em seguida renderiza os na direita
            for(let i = 1; i <= rightAmount; i++) {
                pages.push(<li key={currentPage + i} className='page-item'><Link className='page-link' to={`${window.location.pathname}?page=${currentPage + i}`}>{currentPage + i}</Link></li>)
                if(i === rightAmount && (currentPage + i + 1) < totalPages)                    
                    pages.push(<li key="farright" className='page-item disabled'><a className='page-link' href="/#" tabindex="-1" aria-disabled="true">{"..."}</a></li>)
            }
            
            // Por fim renderiza a última página seja a atual ou não.
            if(totalPages === currentPage)                
                pages.push(<li key={totalPages} className='page-item active'><Link className='page-link' to={`${window.location.pathname}?page=${totalPages}`}>{totalPages}</Link></li>)
            else {
                pages.push(<li key={totalPages} className='page-item'><Link className='page-link' to={`${window.location.pathname}?page=${totalPages}`}>{totalPages}</Link></li>)
            }
        }
        else if(totalPages === 2) 
            if(totalPages === currentPage)                
                pages.push(<li key={2} className='page-item active'><Link className='page-link' to={`${window.location.pathname}?page=${2}`}>{2}</Link></li>)
            else {                
                pages.push(<li key={2} className='page-item'><Link className='page-link' to={`${window.location.pathname}?page=${2}`}>{2}</Link></li>)
            }

        
        return(
            <nav className="" aria-label="Paginação da lista de artigos">
                <ul className="pagination pagination-sm m-0">
                    {pages}
                </ul>
            </nav>
        )
    }

    // Manda as opções de paginação pro state de App.jsx o que atualiza este componente e resulta numa nova pesquisa no backend com as 
    // novas opções de paginação.
    handlePaginationChange(ev, field) {
        if(field === "recent") {
            this.props.pagOptions.set({                
                recent: ev.target.value === '1' ? true : false
            })
        }        
        else if(field === "limit") {
            this.props.pagOptions.set({                
                limit: parseInt(ev.target.value) ? parseInt(ev.target.value) : 0
            })
        }
    }

    categoryNameFromId(id) {
        const category = this.props.categories.get
        let categoryName = ""
        category.forEach(el => {            
            if(el.id === id ) {
                categoryName = el.name
                return
            }
        })
        return categoryName
    }

    render() {
        let title = <h2>Feed</h2>
        let currentPage = this.props.content.pagination.page
        let totalPages = Math.ceil(this.props.content.pagination.count / this.props.content.pagination.limit)

        if(this.props.content.category) // Lista de artigos de 1 categoria.
            title = <h2>{this.props.content.category}</h2>
        
        let articles = []
        let categoryTag = "" 

        let createdAt, updatedAt
        if(this.props.categories.get) {
            this.state.content.data.forEach( (el, idx) => {
                categoryTag = this.props.content.category ? 
                    "" : <Link to={`/categories/${el.categoryId}`}>{`<${this.categoryNameFromId(el.categoryId).toUpperCase()}>`}</Link>
                
                createdAt = new Date(el.created_at)               
                
                const createdMsg = `Criado em: ${createdAt.toLocaleDateString()}`
                let updatedMsg = ""
                if(`${el.created_at}` !== `${el.updated_at}`) {
                    updatedAt = new Date(el.updated_at)
                    updatedMsg = `atualizado em: ${updatedAt.toLocaleDateString()}`
                }

                articles.push(
                    <div key={idx} className='article-briefing'>
                        <span className='category-tag'>{categoryTag}</span>
                        <h3 className='article-title'><Link to={`/articles/${el.id}`}>{`${el.title}`}</Link></h3>
                        <div className='who-when'>
                            <img className='author-avatar' src={el.authoravatar} alt='avatar do autor'/>
                            <div>
                                <span className='author'>{`Postado por: ${el.author}`}</span>
                                <div className='d-flex flex-column flex-sm-row'>
                                    <span className='posted-dates'>{createdMsg}</span>
                                    <span className='posted-dates'>{updatedMsg}</span>
                                </div>
                            </div>
                        </div>
                        <p className="article-description">{el.description}</p>
                    </div>
                )
            })
        }


        if(!articles.length) {
            if(!this.props.content.q)
                articles.push(<p key="1">Nenhum artigo encontrado</p>)
            else articles.push(<p key="1">Nenhum artigo encontrado com o termo "{this.props.content.q}"</p>)

            return (
                <main className="col-12 col-md-8 col-xl-9 pt-5">
                    {title}
                    {articles}
                </main>
            )
        }

        let xsCategory = "" // fazer como no avatar

        return (            
            <main className="col-12 col-md-8 col-xl-9 pt-5">
                {xsCategory}
                {title}
                {articles}
                {/* Paginação */}
                <div className='d-flex flex-column pagination mt-5'>                    
                    {/* paginas de artigos */}
                    <div className='d-flex align-items-center mb-3'>
                        <span className='me-2'>Página</span>
                        {this.navPaginator(totalPages, currentPage)}
                    </div>

                    {/* Opções de paginação */}
                    <div className='d-flex flex-column flex-sm-row'>
                        {/* Combobox com 3 opções de Limit */}
                        <div className='d-flex align-items-center my-2'>
                            <span className='me-2'>Por página</span>
                            <select className="form-select form-select-sm me-4" name="limit" id="perpage" value={`${this.props.content.pagination.limit}`} onChange={e => this.handlePaginationChange(e, e.target.name)}>
                                <option  value="3">3</option>
                                <option  value="5">5</option>
                                <option  value="10">10</option>
                            </select>
                        </div>
                        {/* combobox com 2 opções de ordenação. */}
                        <div className='d-flex align-items-center my-2'>
                            <span className='me-2'>Ordem</span>
                            <select className="form-select form-select-sm" name="recent" id="orderby" value={this.props.pagOptions.get.recent ? "1" : "0"} onChange={e => this.handlePaginationChange(e, e.target.name)}>
                                <option  value="0">Data de publicação</option>
                                <option  value="1">Data de atualização</option>
                            </select>
                        </div>
                    </div>
                </div>
            </main>
        )
    }
}