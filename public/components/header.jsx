import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Link } from "react-router-dom";

class Header extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
                <Navbar bg='dark'  variant={"dark"}>
                    <Navbar.Brand href="/">Goalfin</Navbar.Brand>
                    <Nav variant="pills" defaultActiveKey="/home">
                        <Nav.Item>
                            <Nav.Link as={Link} to="/sipcalc">SIP Calculator</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link as={Link} to="/rdcalc">RD Calculator</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link as={Link} to="/fdcalc">FD Calculator</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="disabled" disabled>
                                coming soon
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Navbar>
        )
    }
}

export default Header;