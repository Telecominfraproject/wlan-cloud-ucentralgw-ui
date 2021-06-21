import React from 'react';
import ReactDOM from 'react-dom';
import 'index.css';
import { Provider } from 'react-redux';
import App from 'App';
import store from 'store';
import { icons } from 'assets/icons';
import 'i18n';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

React.icons = icons;

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
);
