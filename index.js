/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { MenuProvider } from 'react-native-popup-menu';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from './src/store';

const store = configureStore()

const ContactsAppRedux = () => (
    <Provider store={store}><MenuProvider><App /></MenuProvider></Provider>
)

AppRegistry.registerComponent(appName, () => ContactsAppRedux);
