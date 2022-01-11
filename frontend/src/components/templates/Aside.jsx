// Menu lateral da aplicação. Aqui vem os últimos 3 artigos escritos e a lista de categorias de artigos.

import axios from 'axios'
import { Component } from 'react'
import { Link } from 'react-router-dom'
import { baseApiUrl } from '../../global'
import './Aside.css'
import loadingImg from '../../assets/img/loading.gif'


export default class Aside extends Component {   
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            articles: null
        }
    }

    componentDidMount() {        
        axios.get(`${baseApiUrl}/articles/p?col=1&lim=3&asc=0`)
            .then(res => this.setState({articles: res.data.data}) ) 
            .then(_ => this.setState({loading: false}) )        
    }
      
   render() {
        if(this.state.loading)
            return <div className="loading_div"><img src={loadingImg} className="loading_img" alt="Carregando"/></div>

        // Monta uma lista com links com os títulos dos últimos artigos.
        const titlesList = []        
        for(let i in this.state.articles) {            
            titlesList.push(<li key={i}><Link to={`/articles/${this.state.articles[i].id}`}>{this.state.articles[i].title}</Link></li>)
        }
        
        // Monta uma lista com as categorias
        const categoriesList = []    
        this.props.categories.get.forEach( (el, idx) => {            
            categoriesList.push(<li key={idx}><Link to={`/categories/${el.id}`}>{el.name}</Link></li>)
        })

        return (
            <aside  className="col d-none d-md-block pt-5 ms-3">
        
                <div className='aside-item'>
                    <p>Últimas</p>
                    <div>
                        {/* últimos artigos */}
                        <ul>
                            {titlesList}
                        </ul>
                    </div>
                </div>
        
                <div className='aside-item'>
                    <p>Categorias</p>
                    <div>
                        <ul>
                            {categoriesList}
                        </ul>
                    </div>
                </div>
            </aside>
        )
   }     
}