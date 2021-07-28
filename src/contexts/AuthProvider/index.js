import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axiosInstance from 'utils/axiosInstance';

const AuthContext = React.createContext();

export const AuthProvider = ({ token, apiEndpoints, children }) => {
  const [currentToken, setCurrentToken] = useState(token);
  const [endpoints, setEndpoints] = useState(apiEndpoints);
  const [avatar, setAvatar] = useState('');
  const [user, setUser] = useState({
    avatar: '',
  });

  const getAvatar = (newUserId) => {
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
      responseType: 'arraybuffer',
    };

    axiosInstance
      .get(
        `${endpoints.ucentralsec}/api/v1/avatar/${
          newUserId ?? user.Id
        }?timestamp=${new Date().getTime()}`,
        options,
      )
      .then((response) => {
        const base64 = btoa(
          new Uint8Array(response.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            '',
          ),
        );
        setAvatar(`data:;base64,${base64}`);
      })
      .catch(() => {});
  };

  const getUser = () => {
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .get(`${endpoints.ucentralsec}/api/v1/oauth2?me=true`, options)
      .then((response) => {
        setUser(response.data);
        if (response.data.Id && response.data.Id.length > 0) {
          getAvatar(response.data.Id);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (currentToken.length > 0 && endpoints?.ucentralsec?.length > 0) {
      getUser();
    }
  }, [currentToken]);

  return (
    <AuthContext.Provider
      value={{
        currentToken,
        setCurrentToken,
        endpoints,
        setEndpoints,
        user,
        setUser,
        avatar,
        getAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  token: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  apiEndpoints: PropTypes.instanceOf(Object),
};

AuthProvider.defaultProps = {
  apiEndpoints: {},
};

export const useAuth = () => React.useContext(AuthContext);
