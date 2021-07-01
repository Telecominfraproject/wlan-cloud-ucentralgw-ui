import { useAuth } from 'contexts/AuthProvider';
import { Route } from 'react-router-dom';
import React from 'react';

const TheLayout = React.lazy(() => import('layout'));
const Login = React.lazy(() => import('pages/LoginPage'));

const Routes = () => {
  const { currentToken } = useAuth();

  return (
    <Route
      path="/"
      name="Devices"
      render={(props) => (currentToken !== '' ? <TheLayout {...props} /> : <Login {...props} />)}
    />
  );
};

export default Routes;
