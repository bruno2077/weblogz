// Esse componente carrega uma lista de artigos (componente ArticleList) e um menu aside (componente Aside). 
// É o '/' da aplicação e '/categories/:id', e é pra onde qualquer página inexistente redireciona. Esse componente pega a lista de 
// artigos no backend baseado nas props e passa essa lista pronta pro ArticleList que é quem vai renderizar. Essa lista de artigos pode
// ser de todas as categorias ou de só uma. Já para o componente Aside só é repassado algumas props.

import Aside from "../templates/Aside"
import ArticleList from "../articleList/ArticleList"
import axios from "axios"
import { baseApiUrl, toastOptions } from "../../global"
import { toast } from "react-toastify"
import React, { Component } from 'react';
import loadingImg from '../../assets/img/loading.gif'
import { Link, Redirect } from "react-router-dom"


export default class MainContent extends Component {
    constructor(props) {
        super(props)
        this.state = {
            content: null,
            loading: true,
            redir: false
        }
    }

    componentDidMount() {
        console.log("MainContent montado")        
        this.getArticles()
    }

    componentDidUpdate(prevProps) {                  
        if((this.props.id !== prevProps.id) || this.props.page !== prevProps.page || this.props.pagOptions !== prevProps.pagOptions ) {
            this.setState({loading: true})
            this.getArticles()
        }
    }
    
    
    // Pega os artigos no backend, carrega em this.state.content e passa isso para <ArticleList> que é quem vai de fato renderizar isso aí.
    async getArticles() {
        let fullApiUrl = ""

        // Lista de todas as categorias
        if(!this.props.id) 
            fullApiUrl = `${baseApiUrl}/articles/p?col=${this.props.pagOptions.get.recent ? 1 : 0}&lim=${this.props.pagOptions.get.limit}&page=${this.props.page}`
        
        // Lista de 1 categoria
        else {
            //valida o id
            if(!parseInt(this.props.id)) {
                toast.error("Categoria inexistente", toastOptions)
                this.setState({redir: true})
                return 0
            }
            else {
                let catName = ""
                
                this.props.categories.get.forEach(el => {
                    if(parseInt(this.props.id) === el.id) {
                        catName = el.name
                    }
                })
            
                if(!catName) {
                    toast.error("Categoria inexistente", toastOptions)
                    this.setState({redir: true})
                    return 0
                }
                else fullApiUrl = `${baseApiUrl}/articles/p?cat=${catName}&col=${this.props.pagOptions.get.recent ? 1 : 0}&lim=${this.props.pagOptions.get.limit}&page=${this.props.page}`
            }
        }       

        // Aqui pode resultar em um artigo encontrado, varios ou nenhum.
        await axios.get(fullApiUrl)
            .then(res => {
                this.setState({content: {
                    data: res.data.data, 
                    pagination: {
                        count: res.data.count, //qtde de itens
                        limit: res.data.limit, //qtde por página
                        page: res.data.page //nº da página
                    },
                    category: res.data.category ? res.data.category : null }
                })                
            })            
            .then(_ => this.setState({loading: false}) )
            .catch(e => { // categoria inexistente, rede ou erro desconhecido.
                if(this.props.id) { // erro no '/categories/:id'
                    this.setState({redir: true})
                }
                else { // erro no '/' 
                    this.setState({
                        content: {
                            error: e
                        },
                        loading: false
                    })                    
                }
                if(e.response)
                    toast.error(e.response.data, toastOptions)
                
                else alert(e)
                }
            )        
    }

    render() {
        if(this.state.redir || this.props.is404) {
            return <Redirect to='/'/>
        }

        if(this.state.loading) {
            return <div className="loading_div"><img src={loadingImg} className="loading_img"/></div>
        }
        
        return (                
                <div>
                    <div className="row d-flex d-md-none text-center text-warning bg-dark"> {/* navbar categories */}
                        <span>categorias...</span>
                    </div>
                    <div className="row">                    
                        <ArticleList content={this.state.content} user={this.props.user} categories={this.props.categories} pagOptions={this.props.pagOptions}/>
                        <Aside categories={this.props.categories} />
                    </div>
                </div>
        )
    }
}