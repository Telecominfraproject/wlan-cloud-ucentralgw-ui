import React, { useState } from 'react';
import PropTypes from 'prop-types';

const AuthContext = React.createContext();

export const AuthProvider = ({ token, apiEndpoints, children }) => {
  const [currentToken, setCurrentToken] = useState(token);
  const [endpoints, setEndpoints] = useState(apiEndpoints);

  return (
    <AuthContext.Provider value={{ currentToken, setCurrentToken, endpoints, setEndpoints }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  token: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  apiEndpoints: PropTypes.instanceOf(Object)
};

AuthProvider.defaultProps = {
  apiEndpoints: {}
}

export const useAuth = () => React.useContext(AuthContext);
