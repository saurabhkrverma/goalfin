import {applyMiddleware, compose, createStore} from 'redux';
import thunkMiddleware from 'redux-thunk';
import rootReducer from '../reducers'

const INITIAL_STATE = {
    app: {
        welcome_msg:  'Welcome to GoalFin - a web app to help you meet all your financial goals'
    }
}

export default function configureStore(state = INITIAL_STATE) {
    return createStore(rootReducer, state, compose(
        applyMiddleware(thunkMiddleware)
    ));
}
