import React from 'react';
import ReactDom from 'react-dom';
import Components from './components';
import './css/main.css';

import { Provider } from 'react-redux'
import configureStore from './store'
const Init = () => {
    return (
        <Provider store={configureStore()}>
            <Components.Header/>
            <Components.App/>
        </Provider>
    )
}
ReactDom.render(<Init/>, document.getElementById('root'));