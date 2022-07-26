import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { useAuth } from 'ucentral-libs';
import { toJson } from 'utils/helper';
import DeviceSearchBarInput from './Input';

const DeviceSearchBar = ({ action }) => {
  const history = useHistory();
  const { currentToken, endpoints } = useAuth();
  const [socket, setSocket] = useState(null);
  const [results, setResults] = useState([]);
  const [waitingSearch, setWaitingSearch] = useState('');

  const search = (value) => {
    if (socket) {
      if (socket.readyState === WebSocket.OPEN) {
        if (value.length > 1 && value.match('^[a-fA-F0-9-*]+$')) {
          setWaitingSearch('');
          socket.send(
            JSON.stringify({ command: 'serial_number_search', serial_prefix: value.toLowerCase() }),
          );
        } else {
          setResults([]);
        }
      } else if (socket.readyState !== WebSocket.CONNECTING && endpoints?.owgw !== undefined) {
        setWaitingSearch(value);
        setSocket(new WebSocket(`${endpoints.owgw.replace('https', 'wss')}/api/v1/ws`));
      } else {
        setWaitingSearch(value);
      }
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
        const result = toJson(event.data);
        if (result && result.serialNumbers) {
          setResults(result.serialNumbers);
        }
      };

      if (waitingSearch.length > 0) {
        search(waitingSearch);
      }
    }

    return () => closeSocket();
  }, [socket]);

  useEffect(() => {
    if (socket === null && endpoints?.owgw !== undefined) {
      setSocket(new WebSocket(`${endpoints.owgw.replace('https', 'wss')}/api/v1/ws`));
    }
  }, []);

  return (
    <DeviceSearchBarInput
      search={search}
      results={results}
      history={history}
      action={action}
      isDisabled={endpoints.owgw === undefined}
    />
  );
};

DeviceSearchBar.propTypes = {
  action: PropTypes.func,
};

DeviceSearchBar.defaultProps = {
  action: null,
};

export default DeviceSearchBar;
