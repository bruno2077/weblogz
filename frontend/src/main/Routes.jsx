import { Switch, Route, Redirect, useParams } from "react-router"
import Login from '../components/login/Login'
import Perfil from "../components/perfil/Perfil"
import Slate from "../components/editor/Editor";
import AdminPages from "../components/adminPages/AdminPages";


function AdmPage(props) {
    let { page } = useParams()
    return <AdminPages page={`${page}`} user={props.user} mainContent={props.mainContent} categories={props.categories}/>
}


const Routes = props => {    
    // console.log("Routes executado")

    return(
        <section>
            <Switch>                
                <Route exact path='/'>
                    <Slate user={props.user} />
                </Route>

                <Route exact path='/login'>
                    <Login login={{...props.login}} user={{...props.user}}/>
                </Route>

                <Route exact path='/perfil'>
                    <Perfil user={props.user} />
                </Route>
                
                <Route exact path='/admin'> 
                    <AdminPages user={props.user} mainContent={props.mainContent} categories={props.categories}/>
                </Route>

                <Route path='/admin/:page'> 
                    <AdmPage user={props.user} mainContent={props.mainContent} categories={props.categories}/>
                </Route>

                <Redirect from='*' to='/'/>        
            </Switch>
        </section>
    )
}

export default Routes