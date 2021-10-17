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

        // const { contentState } = this.state;
        return (
            <div className="editor-container">
                <Editor          
                wrapperClassName="demo-wrapper"
                editorClassName="demo-editor"
                onContentStateChange={this.onContentStateChange}
                readOnly
                placeholder="See you space cowboy..."
                />        
            </div>
        );
    }
}

















// import { Redirect } from 'react-router'
// import { userKey } from '../../global'

// export default function Slate (props) {
//     // Tem q ver isso aqui. Dá pra botar um botão. onclick se tiver localstorage mostra o slate, senão redir pro login.
//     // ou simplesmente continua como tá. sem botão nem nada.
//     console.log("slate montado")
//     if(!localStorage[userKey]) {
//         return <Redirect to='/login'/>
//     }

//     return (
//        <div className="slate">
//             <h3>SLATE</h3>            
//             <h5>{props.protip}</h5>
//         </div>       
//     )
// }




// import './Editor.css'
// import React from 'react';
// import { Redirect } from 'react-router'
// import { Editor, EditorState, RichUtils, getDefaultKeyBinding } from 'draft-js';

// export default class RichEditorExample extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = {editorState: EditorState.createEmpty()};

//         this.focus = () => this.refs.editor.focus();
//         this.onChange = (editorState) => this.setState({editorState});

//         this.handleKeyCommand = this._handleKeyCommand.bind(this);
//         this.mapKeyToEditorCommand = this._mapKeyToEditorCommand.bind(this);
//         this.toggleBlockType = this._toggleBlockType.bind(this);
//         this.toggleInlineStyle = this._toggleInlineStyle.bind(this);
//     }

//     _handleKeyCommand(command, editorState) {
//         const newState = RichUtils.handleKeyCommand(editorState, command);
//         if (newState) {
//             this.onChange(newState);
//             return true;
//         }
//         return false;
//     }

//     _mapKeyToEditorCommand(e) {
//         if (e.keyCode === 9 /* TAB */) {
//             const newEditorState = RichUtils.onTab(
//                 e,
//                 this.state.editorState,
//                 4, /* maxDepth */
//             );
//             if (newEditorState !== this.state.editorState) {
//                 this.onChange(newEditorState);
//             }
//             return;
//         }
//         return getDefaultKeyBinding(e);
//     }

//     _toggleBlockType(blockType) {
//         this.onChange(
//             RichUtils.toggleBlockType(
//                 this.state.editorState,
//                 blockType
//             )
//         );
//     }

//     _toggleInlineStyle(inlineStyle) {
//         this.onChange(
//             RichUtils.toggleInlineStyle(
//                 this.state.editorState,
//                 inlineStyle
//             )
//         );
//     }




    
//     render() {
//         const {editorState} = this.state;

//         // Controle de acesso. Só user logado.
//         if(!this.props.user.get) {
//             return <Redirect to='/login'/>
//         }

        /*
        // If the user changes block type before entering any text, we can
        // either style the placeholder or hide it. Let's just hide it now.
        let className = 'RichEditor-editor';
        var contentState = editorState.getCurrentContent();
        if (!contentState.hasText()) {
            if (contentState.getBlockMap().first().getType() !== 'unstyled') {
                className += ' RichEditor-hidePlaceholder';
            }
        }

        return (
        <div className="RichEditor-root">
            <BlockStyleControls
                editorState={editorState}
                onToggle={this.toggleBlockType}
            />
            <InlineStyleControls
                editorState={editorState}
                onToggle={this.toggleInlineStyle}
            />
            <div className={className} onClick={this.focus}>
                <Editor
                    blockStyleFn={getBlockStyle}
                    customStyleMap={styleMap}
                    editorState={editorState}
                    handleKeyCommand={this.handleKeyCommand}
                    keyBindingFn={this.mapKeyToEditorCommand}
                    onChange={this.onChange}
                    placeholder="Escreva um artigo..."
                    ref="editor"
                    spellCheck={true}
                />
            </div>
        </div>
        )
    }
}

// Custom overrides for "code" style.
const styleMap = {
    CODE: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
        fontSize: 16,
        padding: 2,
    }
}

function getBlockStyle(block) {
    switch (block.getType()) {
        case 'blockquote': return 'RichEditor-blockquote';
        default: return null;
    }
}

class StyleButton extends React.Component {
    constructor() {
        super();
        this.onToggle = (e) => {
            e.preventDefault();
            this.props.onToggle(this.props.style);
        }
    }

    render() {
        let className = 'RichEditor-styleButton'
        if (this.props.active) {
            className += ' RichEditor-activeButton'
        }

        return (
            <span className={className} onMouseDown={this.onToggle}>
                {this.props.label}
            </span>
        );
    }
}

const BLOCK_TYPES = [
    {label: 'Título', style: 'header-one'},
    {label: 'Subtítulo', style: 'header-two'},
    // {label: 'H3', style: 'header-three'},
    // {label: 'H4', style: 'header-four'},
    // {label: 'H5', style: 'header-five'},
    // {label: 'H6', style: 'header-six'},
    {label: 'Citação', style: 'blockquote'},
    {label: 'Lista', style: 'unordered-list-item'},
    {label: 'Lista ordenada', style: 'ordered-list-item'},
    {label: 'Código', style: 'code-block'},
]

const BlockStyleControls = (props) => {
    const {editorState} = props;
    const selection = editorState.getSelection()
    const blockType = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType();

    return (
        <div className="RichEditor-controls">
            {BLOCK_TYPES.map((type) =>
                <StyleButton
                    key={type.label}
                    active={type.style === blockType}
                    label={type.label}
                    onToggle={props.onToggle}
                    style={type.style}
                />
            )}
        </div>
    )
}

var INLINE_STYLES = [
    {label: 'Negrito', style: 'BOLD'},
    {label: 'Itálico', style: 'ITALIC'},
    {label: 'Sublinhado', style: 'UNDERLINE'},
    {label: 'Monospace', style: 'CODE'},
]

const InlineStyleControls = (props) => {
    const currentStyle = props.editorState.getCurrentInlineStyle()
    
    return (
        <div className="RichEditor-controls">
            {INLINE_STYLES.map((type) =>
                <StyleButton
                    key={type.label}
                    active={currentStyle.has(type.style)}
                    label={type.label}
                    onToggle={props.onToggle}
                    style={type.style}
                />
            )}
        </div>
    )
}
*/