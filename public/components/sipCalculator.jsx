import React from 'react';
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import InputGroup from 'react-bootstrap/InputGroup'
import { Formik } from 'formik';
import * as yup from 'yup';
import { Line } from 'react-chartjs-2';

import Decorators from '../utils/decorators.js';
import Interests from '../utils/interests';

const schema = yup.object().shape({
    sipValue: yup.number().integer().required().min(0).max(1000000000),
    sipTenure: yup.number().integer().required().min(1).max(60),
    sipInterestRate: yup.number().required().min(1).max(100),
    stepupOpted: yup.boolean(),
    stepupPercentage: yup.number().integer().when('stepupOpted', (stepupOpted, schema) => {
        return stepupOpted ? schema.min(0).max(100) : schema;
    }),
    expenseRatioAdjusted: yup.boolean(),
    expenseRatio: yup.number().when('expenseRatioAdjusted', (expenseRatioAdjusted, schema) => {
        return expenseRatioAdjusted ? schema.min(0).max(2.25) : schema;
    }),
    inflationAccounted: yup.boolean()
});

//(sipInterestRate ? schema.lessThan(sipInterestRate) :

class SIPCalculator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.componentRefs = {
            sipForm: React.createRef(),
            sipResult: React.createRef(),
            sipTimeline: React.createRef()
        }
        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.renderSIPResult = this.renderSIPResult.bind(this);
        this.renderMaturityTimeline = this.renderMaturityTimeline.bind(this);
    }

    calculateMaturityAmountTimeline({ sipValue, sipTenure, sipInterestRate, expenseRatio, inflationAccounted }) {
        const maturityAmtTimeline = [];

        // For specific requested tenure
        const result = Interests.calculateSIPMaturiy(sipValue, sipTenure, sipInterestRate, expenseRatio, inflationAccounted);
        maturityAmtTimeline.push({
            ...result
        });

        // For projected timline
        const timelineLimit = sipTenure*2,
            timelineStep = Math.ceil(timelineLimit/10), // To have 10 steps max
            timelineTenure = (timelineStep === 1) ? 1 : (sipTenure%2 === 0) ? 2 : 1;

        for(let tenure=timelineTenure; tenure<=timelineLimit; tenure=tenure+timelineStep){
            const result = Interests.calculateSIPMaturiy(sipValue, tenure, sipInterestRate, expenseRatio, inflationAccounted);
            maturityAmtTimeline.push({
                ...result
            });
        };
        return maturityAmtTimeline;
    }

    calculateStepUpMaturityAmount({ sipValue, sipTenure, sipInterestRate, expenseRatio, inflationAccounted, stepupPercentage }) {
        const steupMaturityAmountTimeline = [];
        const sipValueOverYears = [];
        sipValueOverYears.push(sipValue);
        for(let currentYear=0; currentYear<sipTenure; currentYear++){
            const lastYearSipValue = sipValueOverYears[currentYear-1] || 0;
            const currentSipValue = sipValueOverYears[currentYear];
            const nextSipValue = currentSipValue * (1+(stepupPercentage/100));
            const currentPincipalAmount = currentSipValue - lastYearSipValue;
            sipValueOverYears.push(nextSipValue);
            const result = Interests.calculateSIPMaturiy(currentPincipalAmount, sipTenure-currentYear, sipInterestRate, expenseRatio, inflationAccounted);
            steupMaturityAmountTimeline.push({
                ...result
            });
        }
        let stepupMaturityAmount =  steupMaturityAmountTimeline.reduce((accumulator, currentValue) => {
            const sipTenure = Math.max(currentValue.sipTenure, (accumulator.sipTenure || 0));
            const amountInvested = Decorators.fixedDigitNumber(currentValue.amountInvested + (accumulator.amountInvested || 0));
            const maturityAmount = Decorators.fixedDigitNumber(currentValue.maturityAmount + (accumulator.maturityAmount || 0 )) ;
            const maturityWithExpenseRatio = Decorators.fixedDigitNumber(currentValue.maturityWithExpenseRatio + ( accumulator.maturityWithExpenseRatio || 0));
            const maturityWithInflation = Decorators.fixedDigitNumber(currentValue.maturityWithInflation + ( accumulator.maturityWithInflation || 0));
            const amcCharges = Decorators.fixedDigitNumber(currentValue.amcCharges + ( accumulator.amcCharges || 0));
            const wealthGained = Decorators.fixedDigitNumber(currentValue.wealthGained + (accumulator.wealthGained || 0));
            return {
                sipTenure,
                amountInvested,
                maturityAmount,
                maturityWithExpenseRatio,
                maturityWithInflation,
                amcCharges,
                wealthGained
            }
        }, {});

        stepupMaturityAmount.cagr = Interests.calculateCAGR(stepupMaturityAmount.maturityWithInflation,stepupMaturityAmount.amountInvested,stepupMaturityAmount.sipTenure);
        return [stepupMaturityAmount];
    }

    onFormSubmit(values, actions) {
        const isStepupOpted = !!(values.stepupOpted);
        const sipMaturityTimeline = isStepupOpted ? this.calculateStepUpMaturityAmount(values) : this.calculateMaturityAmountTimeline(values);
        this.setState({
            stepupOpted: values.stepupOpted,
            expenseRatioAdjusted: values.expenseRatioAdjusted,
            inflationAdjusted: values.inflationAccounted,
            sipMaturityTimeline
        });
        this.componentRefs.sipResult.current.scrollIntoView( {behavior: 'smooth', block: 'start' });
    }

    renderMaturityTimeline() {
        const renderTimelineRows = (sipMaturityTimeline) => {
            return sipMaturityTimeline.map((sipObject, index) => {
                return (
                    <tr key={index}>
                        <td>{sipObject.sipTenure} years</td>
                        <td>{Decorators.formatCurreny(sipObject.amountInvested)}</td>
                        <td>{Decorators.formatCurreny(sipObject.maturityAmount)}</td>
                        {this.state.expenseRatioAdjusted && <td>{Decorators.formatCurreny(sipObject.maturityWithExpenseRatio)}</td>}
                        {this.state.inflationAdjusted && <td>{Decorators.formatCurreny(sipObject.maturityWithInflation)}</td>}
                        <td className={"amountDeducted"}>{Decorators.formatCurreny(sipObject.amcCharges)}</td>
                        <td className={"amountAppreciation"}>{Decorators.formatCurreny(sipObject.wealthGained)}</td>
                        <td>{Decorators.formatCurreny(sipObject.cagr)}</td>
                    </tr>
                )
            });
        };

        if(this.state.sipMaturityTimeline && this.state.sipMaturityTimeline.length > 1){
            return (
                <Col md={12}>
                    <Table striped hover responsive="lg" className={"sipMaturityTimelineTable"}>
                    <thead>
                    <tr>
                        <th>Duration</th>
                        <th>Amount Invested</th>
                        <th>Maturity Amount</th>
                        {this.state.expenseRatioAdjusted && <th>After TER adjusted</th>}
                        {this.state.inflationAdjusted && <th>After inflation adjusted</th>}
                        <th>AMC Charge</th>
                        <th>Wealth Created</th>
                        <th>CAGR</th>
                    </tr>
                    </thead>
                    <tbody>
                    {renderTimelineRows(this.state.sipMaturityTimeline)}
                    </tbody>
                </Table>
                </Col>
            );
        } else {
            return null;
        }
    }

    renderSIPChart() {
        const sipFilteredTimeline = this.state.sipMaturityTimeline.reduce((accumulator, currentValue, index)=>{
            if(!this.state.stepupOpted && index===0){
                // ignore the first object as its the finalt maturity value;
                return accumulator;
            }
            accumulator.sipTenureTimeline.push(currentValue.sipTenure);
            accumulator.amountInvestedTimeline.push(currentValue.amountInvested);
            accumulator.maturityAmountTimeline.push(currentValue.maturityWithInflation)
            return accumulator;
        },{sipTenureTimeline:[],amountInvestedTimeline:[], maturityAmountTimeline:[]});
        const data = {
            labels: [0, ...sipFilteredTimeline.sipTenureTimeline],
            datasets: [
                {
                    label: 'amount Invested',
                    data: [0, ...sipFilteredTimeline.amountInvestedTimeline],
                    fill: true,
                    backgroundColor: 'rgb(255, 243, 205, 0.5)',
                    borderColor: '#856404',
                },
                {
                    label: 'maturity amount',
                    data: [0, ...sipFilteredTimeline.maturityAmountTimeline],
                    fill: true,
                    backgroundColor: 'rgb(212, 237, 218, 0.5)',
                    borderColor: '#155724',
                },
            ],
        };
        const options = {
            responsive: true,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'years'
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'projected amount (lakhs)'
                    },
                    ticks: {
                        // Include a dollar sign in the ticks
                        callback: function(value, index, values) {
                            return Number(value/100000);
                        }
                    },
                    grid: {
                        display: false
                    },
                }
            }
        };
        return(
            <Line data={data} options={options} />
        );
    }

    renderSIPResult() {
        if(this.state.sipMaturityTimeline && this.state.sipMaturityTimeline.length>0) {
            const sipObject = this.state.sipMaturityTimeline[0];
            return(
                <Card as={Col} md={5} className={"sipCards sipResults"}>
                    <Card.Header as="h5">Results</Card.Header>
                    <Card.Body>
                        <div>
                            <div> <label><b>SIP Tenure: </b></label>  {sipObject.sipTenure} years</div>
                            <div> <label><b>Amount Invested: </b></label> {Decorators.formatCurreny(sipObject.amountInvested)}</div>
                            <div> <label><b>Maturity Amount : </b></label> {Decorators.formatCurreny(sipObject.maturityAmount)}</div>
                            {this.state.expenseRatioAdjusted && <div> <label><b>After TER adjusted : </b></label> {Decorators.formatCurreny(sipObject.maturityWithExpenseRatio)}</div>}
                            {this.state.inflationAdjusted && <div> <label><b>After inflation adjusted: </b></label> {Decorators.formatCurreny(sipObject.maturityWithInflation)}</div>}
                            <div className={"amountDeducted"}> <label><b>AMC charges : </b></label> {Decorators.formatCurreny(sipObject.amcCharges)}</div>
                            <div className={"amountAppreciation"}> <label><b>Wealth Gained : </b></label> {Decorators.formatCurreny(sipObject.wealthGained)}</div>
                            <div> <label><b>CAGR : </b></label> {sipObject.cagr}</div>
                            {this.renderSIPChart()}
                        </div>
                    </Card.Body>
                </Card>
            );
        } else {
            return null;
        }
    }

    renderSIPForm() {
        const defaultValues = {
            sipValue:  10000,
            stepupOpted: false,
            stepupPercentage: '',
            sipTenure: 10,
            sipInterestRate: 10,
            expenseRatioAdjusted: false,
            expenseRatio: '',
            inflationAccounted: false
        }
        return (
            <Card as={Col} md={5} className={"sipCards sipForm"}>
                <Card.Header as="h5">Calculate Returns for SIP Investments</Card.Header>
                <Card.Body>
                    <Formik validationSchema={schema} onSubmit={this.onFormSubmit} initialValues={defaultValues} >
                        {props => (
                            <Form noValidate onSubmit={props.handleSubmit}>

                                <Form.Group controlId="sipAmount">
                                    <Form.Label>Enter your monthy installent</Form.Label>
                                    <Form.Control name='sipValue' type="number" placeholder="Enter amount" value={props.values.sipValue} onChange={props.handleChange} isValid={!props.errors.sipValue} isInvalid={!!props.errors.sipValue}/>
                                    <Form.Control.Feedback type="invalid">{props.errors.sipValue}</Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group controlId="sipTenure">
                                    <Form.Label>Enter the number of years you would like to invest</Form.Label>
                                    <Form.Control name='sipTenure' type="number" placeholder="Enter years" value={props.values.sipTenure} onChange={props.handleChange} isValid={!props.errors.sipTenure} isInvalid={!!props.errors.sipTenure}/>
                                    <Form.Control.Feedback type="invalid">{props.errors.sipTenure}</Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group controlId="sipInterestRate">
                                    <Form.Label>Expected rate of return on investment</Form.Label>
                                    <Form.Control name='sipInterestRate' type="number" placeholder="Enter rate of return" value={props.values.sipInterestRate} onChange={props.handleChange} isValid={!props.errors.sipInterestRate} isInvalid={!!props.errors.sipInterestRate}/>
                                    <Form.Control.Feedback type="invalid">{props.errors.sipInterestRate}</Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group controlId="steupOptions">
                                    <Form.Label>Enable and enter annual step-up</Form.Label>
                                    <InputGroup className="mb-3">
                                        <InputGroup.Prepend>
                                            <InputGroup.Checkbox name="stepupOpted" value={props.values.stepupOpted} onChange={props.handleChange}/>
                                        </InputGroup.Prepend>
                                        <Form.Control name="stepupPercentage" placeholder="Enter step-up %"  value={props.values.stepupPercentage} disabled={!props.values.stepupOpted} onChange={props.handleChange}  isInvalid={!!props.errors.stepupPercentage}/>
                                        <Form.Control.Feedback type="invalid">{props.errors.stepupPercentage}</Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group controlId="expenseRatioOptions" className={"amountDeducted"}>
                                    <Form.Label>Enable and expense ratio leived by AMC</Form.Label>
                                    <InputGroup className="mb-3">
                                        <InputGroup.Prepend>
                                            <InputGroup.Checkbox name="expenseRatioAdjusted" value={props.values.expenseRatioAdjusted} onChange={props.handleChange}/>
                                        </InputGroup.Prepend>
                                        <Form.Control name='expenseRatio' type="number" placeholder="Enter expense ratio" value={props.values.expenseRatio} disabled={!props.values.expenseRatioAdjusted} onChange={props.handleChange} isInvalid={!!props.errors.expenseRatio}/>
                                        <Form.Control.Feedback type="invalid">{props.errors.expenseRatio}</Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group controlId="inflationAccounted" className={"amountDeducted"}>
                                    <Form.Check name='inflationAccounted' type="checkbox" label="Adjust for inflation rate (averaged to 6%)" value={props.values.inflationAccounted} onChange={props.handleChange}/>
                                </Form.Group>

                                <Form.Group className={"text-center"}>
                                    <Button variant="dark" type="submit">Calculate</Button>
                                </Form.Group>

                            </Form>
                        )}
                    </Formik>
                </Card.Body>
            </Card>
        )
    }

    render() {

        return (
            <Container fluid>
                <Row className={"sipCardsContainer"} ref={this.componentRefs.sipForm}>
                    {this.renderSIPForm()}
                </Row>
                <Row className={"sipCardsContainer"} ref={this.componentRefs.sipResult}>
                    {this.renderSIPResult()}
                </Row>
                <Row ref={this.componentRefs.sipTimeline}>
                    {this.renderMaturityTimeline()}
                </Row>
            </Container>
        )
    }
}

export default SIPCalculator;