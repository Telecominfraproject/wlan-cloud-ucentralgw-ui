import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, DeviceSearchBar as SearchBar } from 'ucentral-libs';
import { checkIfJson } from 'utils/helper';

const DeviceSearchBar = () => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const [socket, setSocket] = useState(null);
  const [results, setResults] = useState([]);

  const search = (e) => {
    if (socket.readyState === WebSocket.OPEN) {
      if (e.target.value.length > 0) {
        socket.send(
          JSON.stringify({ command: 'serial_number_search', serial_prefix: e.target.value }),
        );
      } else {
        setResults([]);
      }
    } else if (socket.readyState !== WebSocket.CONNECTING) {
      setSocket(new WebSocket(`${endpoints.ucentralgw.replace('https', 'wss')}/api/v1/ws`));
    }
  };

  const closeSocket = () => {
    if (socket !== null) {
      socket.close();
    }
  };

  useEffect(() => {
    if (socket !== null) {
      socket.onopen = () => {
        socket.send(`token:${currentToken}`);
      };

      socket.onmessage = (event) => {
        if (checkIfJson(event.data)) {
          const result = JSON.parse(event.data);
          if (result.command === 'serial_number_search' && result.serialNumbers) {
            setResults(result.serialNumbers);
          }
        }
      };
    }

    return () => closeSocket();
  }, [socket]);

  useEffect(() => {
    if (socket === null) {
      setSocket(new WebSocket(`${endpoints.ucentralgw.replace('https', 'wss')}/api/v1/ws`));
    }
  }, []);

  return <SearchBar t={t} search={search} results={results} />;
};

export default DeviceSearchBar;
