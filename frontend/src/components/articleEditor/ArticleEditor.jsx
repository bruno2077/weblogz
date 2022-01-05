// Este componente é o editor de artigo em si. Faz uso do editor richtext React Draft WYSIWYG.

import React, { Component } from 'react';
import { convertFromRaw, EditorState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import '../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css'


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
        let editorStyles = "demo-editor"
        if(!this.props.readOnly) {
            editorStyles += " bg-white"
        }                
        return (            
            <div className="col-md-10 col-12">
                <div className="editor-container mb-3">
                    <Editor      
                        toolbarHidden={this.props.readOnly}
                        editorState={editorState}    
                        wrapperClassName="demo-wrapper" // classe aplicada em volta de todo o componente, ou seja, do editor e da toolbar.
                        editorClassName={editorStyles} // classe aplicada em volta do editor
                        toolbarClassName="mb-0" // classe aplicada em volta da toolbar
                        readOnly={this.props.readOnly}                        
                        onEditorStateChange={this.onEditorStateChange}     
                        onContentStateChange={this.onContentStateChange}                   
                    />
                </div>
            </div>
        );
    }
}