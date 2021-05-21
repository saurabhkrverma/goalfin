class Decorators {

    static formatCurreny = function(amount) {
        if(amount === undefined || amount === null){
            return amount;
        }

        if(typeof amount === 'number'){
            amount = Number(amount).toFixed(2);
        }

        if(typeof amount === 'string') {
            const newAmt = amount.replace(/(\d)(?=(\d{2})+\d\.)/g, '$1,');
            return newAmt;
        } else {
            return amount;
        }
    }

    static fixedDigitNumber(amount) {
        if(!amount) {
            return amount
        }

        return Number(Number(amount).toFixed(2));
    }
}

export default Decorators;