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
            return <div className="loading_div"><img src={loadingImg} className="loading_img"/></div> 

        // Monta uma lista com links com os títulos dos últimos artigos.
        let titlesList = []        
        for(let i in this.state.articles) {            
            titlesList.push(<li key={i}><Link to={`/articles/${this.state.articles[i].id}`}>{this.state.articles[i].title}</Link></li>)
        }
        
        const categoriesList = []    
        this.props.categories.get.forEach( (el, idx) => {            
            categoriesList.push(<li key={idx}><Link to={`/categories/${el.id}`}>{el.name}</Link></li>)
        }) 

        return (
            <aside  className="col d-none d-md-block">
                {/* Visível até certo breakpoint. quando sumir, fazer o componente Filtros expandir lá no main, isso é feito só lá obvio. 
                    Mas é assim q é pra acontecer */}
        
                {/* <div>{`${props.categories.get}`}</div> */}
        
                <div className='aside-item'>
                    <h3>Últimas</h3>
                    <div>
                        {/* últimos artigos */}
                        <ul>
                            {titlesList}
                        </ul>
                    </div>
                </div>
        
                <div className='aside-item'>
                    <h3>Categorias</h3>
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