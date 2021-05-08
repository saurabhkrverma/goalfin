import React from 'react';
import { connect } from 'react-redux';
import { Switch, Route} from "react-router-dom";
import SIPCalculator from './sipCalculator.jsx';
import FDCalculator from './fdCalculator.jsx';
import RDCalculator from './rdCalculator.jsx';

class Body extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Switch>
                <Route path="/sipcalc">
                    <SIPCalculator/>
                </Route>
                <Route path="/rdcalc">
                    <RDCalculator/>
                </Route>
                <Route path="/fdcalc">
                    <FDCalculator/>
                </Route>
                <Route path="/">
                    <div>{this.props.app.welcome_msg} pakka?</div>
                </Route>
            </Switch>
        )
    }

}

const mapStateToProps = (state) => {
    return {
        app: state.app
    }
}

export default connect(mapStateToProps)(Body)