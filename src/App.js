import React, { useEffect } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import 'scss/style.scss';
import { useSelector, useDispatch } from 'react-redux';

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse" />
  </div>
);

const TheLayout = React.lazy(() => import('layout'));
const Login = React.lazy(() => import('pages/LoginPage'));

const App = () => {
  const isLoggedIn = useSelector((state) => state.connected);
  const dispatch = useDispatch();

  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    if (token !== undefined && token !== null) {
      dispatch({ type: 'set', connected: true });
    }
  }, [dispatch]);

  return (
    <HashRouter>
      <React.Suspense fallback={loading}>
        <Switch>
          <Route
            path="/"
            name="Devices"
            render={(props) => (isLoggedIn ? <TheLayout {...props} /> : <Login {...props} />)}
          />
        </Switch>
      </React.Suspense>
    </HashRouter>
  );
};

export default App;
