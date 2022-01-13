// Este componente é o editor de artigo em si. Faz uso do editor richtext React Draft WYSIWYG.

import React, { Component } from 'react';
import { convertFromRaw, EditorState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import '../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import './ArticleEditor.css'


export default class ArticleEditor extends Component {
    constructor(props) {
        super(props);
        const contentState = this.props.content ? convertFromRaw(this.props.content) : null
        this.state = { 
            contentState,
            editorState: contentState ? EditorState.createWithContent(contentState) : EditorState.createEmpty()
        }
    }

    componentDidMount() {
        console.log("Editor Montado")     
    }
    componentDidUpdate(prevProps) {
        if(this.props.readOnly !== prevProps.readOnly) {
            const newContentState = this.props.content ? convertFromRaw(this.props.content) : null
            this.setState({
                contentState: newContentState,
                editorState: newContentState ? EditorState.createWithContent(newContentState) : EditorState.createEmpty()
            })
        }
    }

    onEditorStateChange = (editorState) => {
        this.setState({
          editorState,
        });        
    };

    onContentStateChange = (contentState) => {        
        this.props.onContentStateChange(contentState)        
    }


    render() {        
        const { editorState } = this.state;        
        let textAreaStyles = "demo-editor mt-0"
        let editorStyles = "demo-wrapper" 
        if(!this.props.readOnly) {
            textAreaStyles += " border border-top-0 p-2"
            editorStyles += " mb-3 article-editor"

        }                
        return (            
            <Editor      
                toolbarHidden={this.props.readOnly}
                editorState={editorState}    
                wrapperClassName={editorStyles} // classe aplicada em volta de todo o componente, ou seja, do editor e da toolbar.
                editorClassName={textAreaStyles} // classe aplicada em volta do editor de texto
                toolbarClassName="border border-bottom-0 mb-0 bg-light" // classe aplicada em volta da toolbar
                readOnly={this.props.readOnly}                        
                onEditorStateChange={this.onEditorStateChange}     
                onContentStateChange={this.onContentStateChange}   
                stripPastedStyles={true}                
            />              
        )
    }
}