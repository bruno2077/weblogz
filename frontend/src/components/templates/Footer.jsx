// Rodapé da aplicação. Contém algumas informações típicas de rodapé e um link pro topo da página.

import './Footer.css'
import logo2 from '../../assets/img/logo_light.png'; 
import logo1 from '../../assets/img/logo_light_grey.png'; 

const Footer = props => {
    return (
        <footer className='align-self-bottom'>            
            <div className="aboveFooter m-4">
                <span><a href="/#" onClick={e => { e.preventDefault(); window.scrollTo(0,0); } }>Voltar ao topo</a></span>
            </div>

            <div className="footerContent w-100 row gy-2 gx-1">
                {/* esquerda */}
                <div className="col-md-6 col-12 footerLeft d-flex flex-column p-md-4 ps-md-5 p-3 text-md-start text-center">
                    <a href="https://github.com/bruno2077/weblogz" target="_blank" rel="noopener noreferrer">
                        <img src={logo1} alt="Logo Weblogz"
                            onMouseOver={e => e.currentTarget.src = logo2}
                            onMouseOut={e => e.currentTarget.src = logo1}
                        />
                    </a>
                    <p className="mt-3"><a href="https://github.com/bruno2077/weblogz" target="_blank" rel="noopener noreferrer">Weblogz</a> é um blog multi autor simples, rápido e eficiente desenvolvido com Node.js e React.js</p>
                </div>
                {/* direita */}
                <div className="col-md-6 text-center mt-4" >
                    <div className="myLinks">
                        <a href="https://www.linkedin.com/in/bruno2077"><i className="fab fa-linkedin fa-3x m-2"></i></a>
                        <a href="https://github.com/bruno2077"><i className="fab fa-github fa-3x m-2"></i></a>
                        <a href="https://bruno2077.github.io"><i className="fas fa-user-astronaut fa-3x m-2"></i></a>
                    </div>
                    <p className="mt-3">Desenvolvido por <a id="myLink" href="https://bruno2077.github.io/" target="_blank" rel="noopener noreferrer">Bruno2077</a></p>
                </div>
            </div>

            <div className="w-100 botbot">
                <p className="m-0 p-1">© 2021 Bruno Borges Gontijo</p>
            </div>
        </footer>
    )
}

export default Footer