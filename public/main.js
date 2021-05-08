import React from 'react';
import ReactDom from 'react-dom';
import Components from './components';
import Container from 'react-bootstrap/Container'
import './css/main.scss';
import { Provider } from 'react-redux';
import configureStore from './store';
import { BrowserRouter as Router } from "react-router-dom";


const Init = () => {
    return (
        <Provider store={configureStore()}>
            <Router>
                <Container fluid>
                    <Components.Header/>
                    <Components.Body/>
                </Container>
            </Router>
        </Provider>
    )
}
ReactDom.render(<Init/>, document.getElementById('root'));