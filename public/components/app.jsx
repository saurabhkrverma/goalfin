import React from 'react';
import { connect } from 'react-redux';

class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <dic>{this.props.app.welcome_msg}</dic>
        )
    }

}

const mapStateToProps = (state) => {
    return {
        app: state.app
    }
}

export default connect(mapStateToProps)(App)