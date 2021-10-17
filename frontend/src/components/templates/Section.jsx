// Este componente foi substituído pelo Routes.jsx, não está em uso no momento. Talvez nunca.

import './Section.css'
import React from 'react'

export default class Section extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            teste: "xis",
            input: '',
            validatingToken: false
        }
    }

    render() {
        console.log("Section caregado")
        if(!this.state.validatingToken)
            return( 
                <section>
                    <h3>Título? OK bota uma H3 em cada componente q talquei</h3>
                    {/* Hmm fazer um map nesses children passando algum prop? */}
                    {this.props.children}
                    {/* {this.childrenWithProps(this.state.teste)} */}
                </section>
            )
    }
}