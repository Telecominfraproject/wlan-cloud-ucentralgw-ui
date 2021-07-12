/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import ReactDOM from 'react-dom';
import 'index.css';
import App from 'App';
import { icons } from 'assets/icons';
import '@babel/polyfill';
import 'i18n';

React.icons = icons;

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);
