import React, { useEffect } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import './scss/style.scss';
import { useSelector, useDispatch } from 'react-redux';

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
)

const TheLayout = React.lazy(() => import('./containers/TheLayout'));
const Login = React.lazy(() => import('./views/pages/Login'));
const Page404 = React.lazy(() => import('./views/pages/Page404'));
const Page500 = React.lazy(() => import('./views/pages/Page500'));

const App = () => {
    const isLoggedIn  = useSelector(state => state.connected);
    const dispatch = useDispatch();

    useEffect(() => {
        const token = sessionStorage.getItem('access_token');
        if (token !== undefined && token !== null) {
            dispatch({type: 'set', connected: true});
        }
    }, [dispatch]);

    return (
        <HashRouter>
                <React.Suspense fallback={loading}>
                <Switch>
                    <Route exact path="/404" name="Page 404" render={props => <Page404 {...props}/>} />
                    <Route exact path="/500" name="Page 500" render={props => <Page500 {...props}/>} />
                    <Route path="/" name="Devices" render={props => isLoggedIn ?  <TheLayout {...props}/> : <Login {...props}/>} />
                </Switch>
                </React.Suspense>
            </HashRouter>
    );
};

export default App;