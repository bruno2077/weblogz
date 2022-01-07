import { Switch, Route, useParams } from "react-router"
import { useLocation } from 'react-router-dom'
import Login from '../components/login/Login'
import Perfil from "../components/perfil/Perfil"
import AdminPages from "../components/adminPages/AdminPages";
import MainContent from "../components/mainContent/MainContent";
import Article from "../components/article/Article";


function AdmPage(props) {
    let { page } = useParams()
    return <AdminPages page={`${page}`} user={props.user} categories={props.categories} pagOptions={props.pagOptions}/>
}

function MainContentWithOptions(props) {    
    const { id } = useParams()
    const { search } = useLocation();
    const params = new URLSearchParams(search);
    let pageNumber = 1
    if(params.has("page"))
        pageNumber = parseInt(params.get("page")) ? parseInt(params.get("page")) : 1
    
    return <MainContent id={id} page={pageNumber} pagOptions={props.pagOptions}  user={props.user} categories={props.categories} />
}

function ArticleWithId(props) {
    let { id } = useParams()    
    return <Article id={id} user={props.user} categories={props.categories}/>
}


const Routes = props => {    
    console.log("Routes executado")

    return(
        <div className="main-content container">
            <Switch>
                <Route exact path='/'>
                    <MainContentWithOptions pagOptions={props.pagOptions} user={props.user} categories={props.categories}/>                    
                </Route>                
                <Route path="/categories/:id">
                    <MainContentWithOptions pagOptions={props.pagOptions} user={props.user} categories={props.categories} />
                </Route>

                <Route path="/articles/:id">
                    <ArticleWithId user={props.user} categories={props.categories}/>
                </Route>

                <Route exact path='/login'>
                    <Login login={{...props.login}} user={{...props.user}}/>
                </Route>

                <Route exact path='/perfil'>
                    <Perfil pagOptions={props.pagOptions} user={props.user} categories={props.categories}/>
                </Route>
                
                <Route exact path='/admin'>                     
                    <AdminPages pagOptions={props.pagOptions} user={props.user} categories={props.categories}/>
                </Route>
                <Route path='/admin/:page'>                     
                    <AdmPage pagOptions={props.pagOptions} user={props.user} categories={props.categories}/>
                </Route>                     

                <Route path="*">
                    <MainContent is404={true} user={props.user} categories={props.categories} pagOptions={props.pagOptions}/>
                </Route>
            </Switch>
        </div>
    )
}

export default Routes