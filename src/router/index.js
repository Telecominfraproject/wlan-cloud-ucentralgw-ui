import { useAuth, ToastProvider } from 'ucentral-libs';
import { Route } from 'react-router-dom';
import React from 'react';

const TheLayout = React.lazy(() => import('layout'));
const Login = React.lazy(() => import('pages/LoginPage'));

const Routes = () => {
  const { currentToken, endpoints } = useAuth();

  return (
    <Route
      path="/"
      name="Devices"
      render={(props) =>
        currentToken !== '' && Object.keys(endpoints).length !== 0 ? (
          <TheLayout {...props} />
        ) : (
          <ToastProvider>
            <Login {...props} />
          </ToastProvider>
        )
      }
    />
  );
};

export default Routes;
