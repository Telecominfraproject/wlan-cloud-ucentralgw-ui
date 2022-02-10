import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { useAuth, DeviceSearchBar as SearchBar } from 'ucentral-libs';
import { checkIfJson } from 'utils/helper';

const DeviceSearchBar = ({ action }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { currentToken, endpoints } = useAuth();
  const [socket, setSocket] = useState(null);
  const [results, setResults] = useState([]);
  const [waitingSearch, setWaitingSearch] = useState('');

  const search = (value) => {
    if (socket.readyState === WebSocket.OPEN) {
      if (value.length > 1 && value.match('^[a-fA-F0-9-*]+$')) {
        setWaitingSearch('');
        socket.send(
          JSON.stringify({ command: 'serial_number_search', serial_prefix: value.toLowerCase() }),
        );
      } else {
        setResults([]);
      }
    } else if (socket.readyState !== WebSocket.CONNECTING) {
      setWaitingSearch(value);
      setSocket(new WebSocket(`${endpoints.owgw.replace('https', 'wss')}/api/v1/ws`));
    } else {
      setWaitingSearch(value);
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

      if (waitingSearch.length > 0) {
        search(waitingSearch);
      }
    }

    return () => closeSocket();
  }, [socket]);

  useEffect(() => {
    if (socket === null && endpoints?.owgw) {
      setSocket(new WebSocket(`${endpoints.owgw.replace('https', 'wss')}/api/v1/ws`));
    }
  }, []);

  return <SearchBar t={t} search={search} results={results} history={history} action={action} />;
};

DeviceSearchBar.propTypes = {
  action: PropTypes.func,
};

DeviceSearchBar.defaultProps = {
  action: null,
};

export default DeviceSearchBar;
