// Página de administração das categorias


import React, { Component } from "react"
//import './AdmCategories.css'
import axios from 'axios'
import {baseApiUrl, toastOptions } from '../../../global'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Função pra destacar a categoria selecionada da tabela
function selectedRowToggler(tr) {
    const rows = document.getElementsByClassName("categoryRow")
    if(rows.length) {
        for(let i of rows ) {
            i.classList.remove("table-primary")
        }
        if(tr) {
            tr.classList.add("table-primary")
        }
    }
}

// Ordena a tabela pela coluna onclick.
function sortTable(tableColumn, isNumber) {
    let table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById("theCategoryTable");
    
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

            // Primeiro checa se a coluna é de inteiro ou string, e então compara as duas linhas.
            if(isNumber) { // integer
                if (parseInt(x.innerHTML) > parseInt(y.innerHTML)) {                    
                    shouldSwitch = true;
                    break; // sai do laço for
                }
            }
            else { // string
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {                    
                    shouldSwitch = true;
                    break; // sai do laço for
                }
            }        
        }
        
        if (shouldSwitch) {            
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}

const initialState = {
    category: {
        id: null,
        name: ""
    },    
    isCategoryLoaded: false,
    categoryTable: null,
    loading: false
}

export default class AdmCategories extends Component {
    constructor(props) {
        super(props)
        this.state = {            
            ...initialState,
            categories: this.props.categories
        }
    }

    componentDidMount() {
        console.log("Adm Categories montado.")        
        this.categoriesToTable() // Monta a tabela de categorias
    }

    // Pega os dados digitados no input name e põe no objeto category do state.
    handleChange(ev) {
        this.setState({
            category: { 
                ...this.state.category,
                name: ev.target.value
            }
        })
    }

    // Reinicia o estado do componente.
    restart() {
        this.setState({
            ...initialState        
        })
    }

    // Pega as categorias no componente raiz App e transforma numa tabela. 
    categoriesToTable() {
        const categoryTbodyItens = []
        
        for (let i in this.props.categories.get)
            categoryTbodyItens.push(<tr key={i} className="categoryRow" onClick={e => this.loadCategory(e)}>
                <td className="d-none">{`${this.props.categories.get[i].id}`}</td>
                <td>{`${this.props.categories.get[i].name}`}</td></tr>)
        
        
        const categoryTbody = <tbody className="table-light">{categoryTbodyItens}</tbody>

        return(
            <table id="theCategoryTable"className="table table-hover caption-top mt-4" >
                <caption className="tTitle text-center">Categorias cadastradas</caption>
                <thead className="table-primary"><tr>
                    <th name="id" className="theadClick d-none" onClick={e => sortTable(0, true)}>Código<i className="fas fa-sort ms-3"></i></th>
                    <th name="name" className="theadClick" onClick={e => sortTable(1, false)}>Nome<i className="fas fa-sort ms-3"></i></th>
                </tr></thead>
                {categoryTbody}
            </table>
        )
    }

     // Carrega no form a categoria onclick da tabela.
     loadCategory(e) {
        const categoryData = []                
        
        for(let i = 0; i < e.currentTarget.children.length; i++) {
            categoryData.push(e.currentTarget.children[i].innerHTML)
        }        
        this.setState({
            category: {
                name: categoryData[1],
                id: categoryData[0]
            },
            isCategoryLoaded: true            
        })        
        
        selectedRowToggler(e.currentTarget) // Função pra destacar a categoria selecionada da tabela
    }
   

    // inclusão ou alteração de categoria.
    sendCategory() {
        // Alteração da categoria
        if(this.state.category.id) {           
            axios.put(`${baseApiUrl}/categories/${this.state.category.id}`, this.state.category)
                .then(res => {                    
                    if(res.data) {                        
                        this.props.categories.update()
                        toast.success(`${res.data}`, toastOptions) // Responde que alterou a categoria.
                    }
                    // Caso especial. Se a resposta for string vazia é pq tentou alterar a categoria para o mesmo nome. Isso não faz nada no backend.
                    else this.restart()
                })
                .catch(e => {                    
                    if(e.response) { 
                        if(e.response.status === 401) // Se erro de não autorizado, desloga. É token expirado.
                            this.props.user.set(false)
                        toast.error(e.response.data, toastOptions)
                    }
                    else {
                        toast.error(e, toastOptions)
                    }
                })
        }

        // Inclusão de nova categoria
        else {
            axios.post(`${baseApiUrl}/categories`, this.state.category)
                .then(res => {
                    this.props.categories.update()                    
                    toast.success(res.data, toastOptions) // Responde que criou a categoria
                })                
                .catch(e => {
                    if(e.response) { 
                        if(e.response.status === 401) // Se erro de não autorizado, desloga. É token expirado.
                            this.props.user.set(false)
                        toast.error(e.response.data, toastOptions)
                    }
                    else {
                        toast.error(e, toastOptions)
                    }
                })
        }
    }


    // Deleta a categoria SE não tiver artigo cadastrado nela.
    deleteCategory() {        
        axios.delete(`${baseApiUrl}/categories/${this.state.category.id}`, this.state.category)
            .then(res => {
                this.props.categories.update()
                toast.warning(res.data, { ...toastOptions, autoClose: 3000 }) // Responde que deletou o artigo                
            })            
            .catch(e => {
                this.restart()
                // Dá erro se tiver artigo cadastrado nessa categoria.
                if(e.response)
                    toast.error(e.response.data, { ...toastOptions, autoClose: 3000 })
                else toast.error(e, { ...toastOptions, autoClose: 3000 })
            })
    }


    render() {        
        let catTitle
        let catLoadedBtns = []

        if(this.state.isCategoryLoaded) {
            catTitle = "Alterar categoria"        
            catLoadedBtns.push(
                <button key="1" type="button" className="btn btn-danger mt-2 ms-2" data-bs-toggle="modal" data-bs-target="#delCategoryModal" >Deletar</button>,
                <button key="2" type="button" className="btn btn-dark mt-2 ms-2" onClick={e => { this.restart(); selectedRowToggler(false); }}>Descartar</button>)            
        }
        else catTitle = "Nova categoria"

        
        return (
            <div>                
                {/* Título */}
                <h4>{catTitle}</h4>

                <div className="row my-2">                    
                    <div className="col-md-8 col-sm-12">
                        <input className="form-control" type="text" name="name"  onChange={e => this.handleChange(e, e.target.name)} value={this.state.category.name}  placeholder="Nome de categoria" id="inputCatName" aria-describedby="inputName"/>
                    </div>
                </div>  
                
                <div> 
                    <button type="button" className="btn btn-primary mt-2" onClick={e => this.sendCategory()} >Salvar</button>
                    {catLoadedBtns}
                </div>

                <div className=" table-responsive col-md-8 col-sm-12">
                    {this.categoriesToTable()}
                </div>

                {/* Modal da deleção */}
                <div className="modal fade" id="delCategoryModal" data-bs-backdrop="static" tabIndex="-1" aria-labelledby="delCategoryModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-fullscreen-sm-down">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="delCategoryModalLabel">Tem certeza que deseja remover essa categoria?</h5>                                        
                            </div>
                            <div className="modal-body">                                        
                                <button className="btn btn-secondary" data-bs-dismiss="modal" aria-label="Close" onClick={e => this.deleteCategory()} >Confirmar</button>
                                <button className="btn btn-secondary mx-3" data-bs-dismiss="modal" aria-label="Close" >Cancelar</button>
                            </div>                                  
                        </div>
                    </div>
                </div>
                
            </div>
        )
    }
}