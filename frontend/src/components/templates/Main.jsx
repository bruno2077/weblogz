// Este componente é onde vem o conteúdo principal do site que são a lista de artigos escritos ou um único artigo aberto para leitura.

import './Main.css'

const Main = props =>     
    <main>
        <div className='breadcrumb-maybe'>            
            {/* Talvez um breadcrumb aqui. */}
        </div>
        
        <div className='articles'>
            {/* É o get dos artigos. Aqui vem uma lista dos artigos de acordo com o filtro no aside. padrão é por data de postagem. */}
            {/*Cada artigo é pra ser um componente: onclick é pra abri-lo e esconder o resto. é um get do artigo. */}
            <article>Artigo1</article>
            <article>Artigo2</article>
            <article>Artigo3</article>
            <div>
                {/* Paginação */}
            </div>
        </div>
    </main>

export default Main