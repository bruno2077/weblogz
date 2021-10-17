// Menu lateral da aplicação. Aqui vem os últimos artigos escritos e a lista de categorias de artigos.

import './Aside.css'

const Aside = props =>     
    <aside>
        {/* <div className='filters'>filtros: ___ </div> */}

        <div className='aside-item'>
            <h3>Últimas</h3>
            <div>
                {/* últimos artigos */}
                <ul>
                    <li>item1</li>
                    <li>item2</li>
                    <li>item3</li>
                </ul>                  
            </div>
        </div>

        <div className='aside-item'>
            <h3>Categorias</h3>
            <div>                
                Lista de categorias aqui
            </div>
        </div>
    </aside>

export default Aside