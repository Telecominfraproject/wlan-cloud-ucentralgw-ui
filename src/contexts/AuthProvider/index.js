import React, { useState } from 'react';
import PropTypes from 'prop-types';

const AuthContext = React.createContext();

export const AuthProvider = ({ token, children }) => {
  const [currentToken, setCurrentToken] = useState(token);

  return (
    <AuthContext.Provider value={{ currentToken, setCurrentToken }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  token: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export const useAuth = () => React.useContext(AuthContext);
