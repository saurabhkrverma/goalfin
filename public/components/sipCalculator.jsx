import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table'

class SIPCalculator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.onInputchange = this.onInputchange.bind(this);
        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.renderMaturityTimeline = this.renderMaturityTimeline.bind(this);
    }

    onInputchange(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    formatCurreny(amount) {
        const newAmt = amount.replace(/(\d)(?=(\d{2})+\d\.)/g, '$1,');
        return newAmt;
    }

    calculateMaturityAmountTimeline() {
        // Forumla used FV = (P × ((1 + i)^n - 1) / i)) × (1 + i)
        const principalAmount = Number(this.state.sipValue);
        const interestRate = Number(this.state.sipInterestRate) / 100 / 12; // yearly interest
        const numOfInstallments = Number(this.state.sipTenure) * 12; // In months
        const maturityAmtTimeline = [];
        for(let tenure = 2; tenure<=30; tenure=tenure+2){
            const amountInvested = Number(principalAmount * tenure * 12).toFixed(2);
            const maturityAmount = Number(((principalAmount * (Math.pow((1+interestRate),(tenure*12))-1))/interestRate) * (1+interestRate)).toFixed(2);
            const wealthGained = Number(maturityAmount - amountInvested).toFixed(2);
            const cagr = Number((Math.pow((maturityAmount/amountInvested),(1/tenure)) - 1) * 100).toFixed(2);// compounded annual growth rate
            maturityAmtTimeline.push({
                tenure,
                amountInvested: this.formatCurreny(amountInvested),
                maturityAmount: this.formatCurreny(maturityAmount),
                wealthGained: this.formatCurreny(wealthGained),
                cagr: this.formatCurreny(cagr)
            });
        };

        return maturityAmtTimeline;
    }

    calculateMaturityAmount() {
        // Forumla used FV = (P × ((1 + i)^n - 1) / i)) × (1 + i)
        const principalAmount = Number(this.state.sipValue);
        const interestRate = Number(this.state.sipInterestRate) / 100 / 12; // yearly interest
        const numOfInstallments = Number(this.state.sipTenure) * 12; // In months

        const amountInvested = Number(principalAmount * numOfInstallments).toFixed(2);
        const maturityAmount = Number(((principalAmount * (Math.pow((1+interestRate),numOfInstallments)-1))/interestRate) * (1+interestRate)).toFixed(2);
        const wealthGained = Number(maturityAmount - amountInvested).toFixed(2);
        const cagr = Number((Math.pow((maturityAmount/amountInvested),(1/Number(this.state.sipTenure))) - 1) * 100).toFixed(2);

        const result = {
            tenure: numOfInstallments/12,
            amountInvested,
            maturityAmount,
            wealthGained,
            cagr
        };

        return result
    }

    onFormSubmit(event) {
       const sipMaturity = this.calculateMaturityAmount();
       const sipMaturityTimeline = this.calculateMaturityAmountTimeline();
       console.log('sipMaturityValue', sipMaturity);
       console.log('sipMaturityTimelineValue', sipMaturityTimeline);
        this.setState({
            sipMaturity,
            sipMaturityTimeline
        });
    }

    renderMaturityTimeline() {
        const renderTimelineRows = (sipMaturityTimeline) => {
            return sipMaturityTimeline.map((sipObject, index) => {
                return (
                    <tr key={index}>
                        <td>{sipObject.tenure} years</td>
                        <td>{sipObject.amountInvested}</td>
                        <td>{sipObject.maturityAmount}</td>
                        <td>{sipObject.wealthGained}</td>
                        <td>{sipObject.cagr}</td>
                    </tr>
                )
            });
        };

        if(this.state.sipMaturityTimeline){
            return (
                <Table striped bordered hover responsive="lg">
                    <thead>
                    <tr>
                        <th>Duration</th>
                        <th>Amount Invested</th>
                        <th>Maturity Value</th>
                        <th>Wealth Created</th>
                        <th>CAGR</th>
                    </tr>
                    </thead>
                    <tbody>
                    {renderTimelineRows(this.state.sipMaturityTimeline)}
                    </tbody>
                </Table>
            );
        } else {
            return null;
        }
    }

    render() {
        return (
            <div>
                <Form>
                    <Form.Group controlId="sipAmount">
                        <Form.Label>Enter your monthy installent</Form.Label>
                        <Form.Control name='sipValue' type="number" placeholder="Enter amount" value={this.state.sipValue || ''} onChange={this.onInputchange}/>
                    </Form.Group>

                    <Form.Group controlId="sipTenure">
                        <Form.Label>Enter the number of years you would like to invest</Form.Label>
                        <Form.Control name='sipTenure' type="number" placeholder="Enter years" value={this.state.sipTenure || ''} onChange={this.onInputchange}/>
                    </Form.Group>

                    {/*<Form.Group controlId="sipTenure">*/}
                    {/*    <Form.Label>Range</Form.Label>*/}
                    {/*    <Form.Control name='sipTenure' type="range" min="1" max="100" value={this.state.sipTenure || 0} onChange={this.onInputchange}/>*/}
                    {/*</Form.Group>*/}

                    <Form.Group controlId="sipInterestRate">
                        <Form.Label>Expected rate of return on investment</Form.Label>
                        <Form.Control name='sipInterestRate' type="number" placeholder="Enter rate of return" value={this.state.sipInterestRate || ''} onChange={this.onInputchange}/>
                    </Form.Group>

                    <Button variant="primary" onClick={this.onFormSubmit}>
                        Submit
                    </Button>

                    <Form.Group controlId="sipMaturityValue">
                        <Form.Label>Expected rate of return on investment</Form.Label>
                        <Form.Control name='sipMaturityValue' type="number" placeholder="Maturity value" value={parseInt(this.state.sipMaturity && this.state.sipMaturity.maturityAmount) || ''} disabled/>
                    </Form.Group>

                </Form>
                {this.renderMaturityTimeline()}
            </div>
        )
    }
}

export default SIPCalculator;