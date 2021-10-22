// Este componente é o editor de texto. Só aparece se o usuário já estiver logado e com token válido.

import React, { Component } from 'react';
import { convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { Redirect } from 'react-router';
import { isValidToken } from '../../global';
import '../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './Editor.css'

const content = {"entityMap":{},"blocks":[{"key":"637gr","text":"Initialized from content state.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}]};

export default class EditorConvertToJSON extends Component {
    constructor(props) {
        super(props);
        const contentState = convertFromRaw(content);
        this.state = {
            contentState,
            validatingToken: false
        }
    }

    componentDidMount() {
        console.log("Editor Montado")
        // Controle de acesso
        if(this.props.user.get) {
            const verifyToken = new Promise( resolve => {
                this.setState({ validatingToken: true })
                resolve(isValidToken(this.props.user.get) )
            })

            verifyToken.then(res => {
                if(res) { //token válido. continua.                   
                    this.setState({ validatingToken: false })
                }
                else { // token inválido. desloga, limpa os dados do usuário.
                    this.props.user.set(false)
                }                
            })
            .catch( e => { // Não caiu aqui nem com backend offline. mas tratamos qq erro.
                alert(e)                
            })
        }
    }

    onContentStateChange = contentState => {
        this.setState({
            contentState,
        })
    }

    render() {
        // Se o usuário não está logado, redireciona pro /login
        if(!this.props.user.get)
            return <Redirect to='/login'/>
        
        // Validando token no backend
        if(this.state.validatingToken) {
            return <span>carregando.gif</span>
        }
        
        return (
            <div className="col-10">
                <h2>Escreva um artigo</h2>
                <div className="editor-container mb-3">
                    <Editor          
                    wrapperClassName="article-wrapper"
                    editorClassName="article-editor"
                    onContentStateChange={this.onContentStateChange}
                    readOnly
                    placeholder="See you space cowboy..."
                    />
                </div>  
                
                {/* <div className="text-end"> */}
                <div className="">
                    <button type="button" className="btn btn-outline-success">Salvar</button>
                </div>          
            </div>
        );
    }
}