import React from 'react';
import { HashRouter, Switch } from 'react-router-dom';
import 'scss/style.scss';
import Router from 'router';
import { AuthProvider } from 'ucentral-libs';
import { checkIfJson } from 'utils/helper';
import axiosInstance from 'utils/axiosInstance';

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse" />
  </div>
);

const App = () => {
  const storageToken = sessionStorage.getItem('access_token');
  const apiEndpoints = checkIfJson(sessionStorage.getItem('gateway_endpoints'))
    ? JSON.parse(sessionStorage.getItem('gateway_endpoints'))
    : {};

  return (
    <AuthProvider
      axiosInstance={axiosInstance}
      token={storageToken ?? ''}
      apiEndpoints={apiEndpoints}
    >
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
