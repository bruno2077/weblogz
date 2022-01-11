import React from 'react'
import ReactAvatarEditor from 'react-avatar-editor'

class AEditor extends React.Component {
  constructor(props) {
      super(props)
      // this.setEditorRef = this.setEditorRef.bind(this)
      // this.onClickSave = this.onClickSave.bind(this)
      this.imageURL = 0;
      this.state = {        
        scale: this.props.scale,        
      }
  } 

  handleScale = e => {
    const scale = parseFloat(e.target.value)
    this.setState({ scale })
  }

  onChangeSave = () => {
    if(this.editor) {
      // Retorna um dataURL. Isso pode ir na src das <img> e pode ir pro SQL numa coluna bytea (binário)
      const data = this.editor.getImageScaledToCanvas().toDataURL();
      
      return data // dataURL base64
    }
  }

  setEditorRef = (editor) => (this.editor = editor)


  render() {
    console.log("avatarEditor montado")
    if(!this.props.image || this.props.image === "DefImg")       
      return <div className="modal fade" id="avatarModal" data-bs-backdrop="static" tabindex="-1" aria-labelledby="avatarModalLabel" aria-hidden="true"></div>      
    
    return (
      <div className="d-flex flex-column">
        <ReactAvatarEditor
          ref={this.setEditorRef}
          image={this.props.image}
          width={this.props.width}
          height={this.props.height}
          border={this.props.border}
          color={this.props.color} // RGBA
          scale={this.state.scale}
          borderRadius={5}
          onImageChange={e => { // Roda só quando há alterações. Pega a imagem gerada 100x100 e manda pro componente pai.
            const output = this.onChangeSave()            
            this.props.setTmpImg(output)
          }}
          onLoadSuccess={e => { // Roda assim que a imagem carrega. 
            const output = this.onChangeSave()            
            this.props.setTmpImg(output)
          }}
        />
        <div  className="my-2">
          <label>Zoom:</label>
          <input
            name="scale"
            type="range"
            onChange={e => this.handleScale(e)}
            min="0.1"
            max="2"
            step="0.01"
            defaultValue="1"
          />
        </div>
      </div>
    )
  }
}

export default AEditor