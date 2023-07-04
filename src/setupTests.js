// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom/extend-expect';
import { CanvasPattern } from 'canvas';

/* eslint-disable import/no-extraneous-dependencies */
import 'react-app-polyfill/stable';
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only';
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import crypto from 'crypto';

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

global.URL.createObjectURL = jest.fn(() => 'fooblob');

global.CanvasPattern = CanvasPattern;
global.URL.createObjectURL = jest.fn(() => 'fooblob');

global.mockStore = configureStore([thunk]);
global.crypto = {
  getRandomValues: (arr) => crypto.randomBytes(arr.length),
};
