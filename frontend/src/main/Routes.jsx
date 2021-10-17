import { Switch, Route, Redirect, useParams, useRouteMatch } from "react-router"
import Login from '../components/login/Login'
import Home from "../components/home/Home"
import Slate from "../components/editor/Editor";
import AdminPages from "../components/adminPages/AdminPages";


// function LogReg() {
//     const { isReg } = useParams();
//     return <Login isRegister={`${isReg}`}/>
// }

function AdmPage(props) {
    let { page } = useParams()
    return <AdminPages page={`${page}`} user={props.user} mainContent={props.mainContent}/>
}


const Routes = props => {    
    console.log("Routes executado")

    return(
        <section>
            <Switch>
                {/* <Route exact path='/' render={(props) => <Section title='[Escreva um artigo]'/>} /> */}

                {/*  <Route exact path='/' component={Slate}/>slate algum dia */}
                <Route exact path='/'>
                    <Slate user={props.user} />
                </Route>

                <Route exact path='/login'>
                    <Login login={{...props.login}} user={{...props.user}}/>
                </Route>
                {/* <Route path='/login' component={Login} /> */}
                {/* <Route path='/login/:isReg' children={<LogReg/>} /> */}
                {/* <Route exact path='/login' render={(props) => <Login isRegister='true'/>} /> */}
                {/* <Route path='/login' component={Login} /> */}

                <Route exact path='/home'>
                    <Home user={props.user} />
                </Route>

                {/* <Route exact path='/admin/users' component={AdmUsers} /> */}
                {/* <Route exact path='/admin'> 
                    <AdminPages user={props.user} page="users"/>
                </Route> */}
                <Route exact path='/admin'> 
                    <AdminPages user={props.user} mainContent={props.mainContent}/>
                </Route>

                {/* <Route path='/admin/:page' children={<AdmPage user={props.user} mainContent={props.mainContent}/>} /> */}

                <Route path='/admin/:page'> 
                    <AdmPage user={props.user} mainContent={props.mainContent}/>
                </Route>
                
                
                {/* <Route path='/admin/:apage'>
                    <AdmPage user={props.user} />
                </Route> */}

                <Redirect from='*' to='/'/>        
            </Switch>
        </section>
    )
}

export default Routes