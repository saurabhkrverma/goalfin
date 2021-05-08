import React from 'react';

class Footer extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={"footer"}>
                <span className="text-muted">Place sticky footer content here.</span>
            </div>
        )
    }
}

export default Footer;