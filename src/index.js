// import polyfills for ie 11
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only';
import React from 'react';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import App from './Components/App';
import store from './store/store';
import './index.css';
import * as serviceWorker from './serviceWorker';

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(
  <Provider store={store}>
    <App />
  </Provider>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
