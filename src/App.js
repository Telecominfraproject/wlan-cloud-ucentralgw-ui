import React from 'react';
import { HashRouter, Switch } from 'react-router-dom';
import 'scss/style.scss';
import Router from 'router';
import { AuthProvider } from 'contexts/AuthProvider';

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse" />
  </div>
);

const App = () => {
  const storageToken = sessionStorage.getItem('access_token');

  return (
    <AuthProvider token={storageToken ?? ''}>
      <HashRouter>
        <React.Suspense fallback={loading}>
          <Switch>
            <Router />
          </Switch>
        </React.Suspense>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
