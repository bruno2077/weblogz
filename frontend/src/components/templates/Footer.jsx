// Rodapé da aplicação. Contém algumas informações típicas de rodapé e um link pro topo da página.

import './Footer.css'

const Footer = props => {
    return (
        <footer>            
            <span><a href="#" onClick={e => { e.preventDefault(); window.scrollTo(0,0); } }>Voltar ao topo</a></span>
            <span><strong>Desenvolvido por <a href="https://github.com/bruno2077/weblogz">Bruno2077</a></strong></span>
            <span>Todas as marcas registradas e direitos autorais nesta página são propriedade de suas respectivas partes. As imagens carregadas são de responsabilidade dos seus respectivos autores. Os comentários são propriedade de seus respectivos autores.</span>
        </footer>
    )
}

export default Footer