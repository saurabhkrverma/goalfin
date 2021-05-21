class Interests {

    static calculateCAGR = function(maturityAmount, amountInvested, tenure){
        // compounded annual growth rate
        const cagr = Number(Number((Math.pow((maturityAmount/amountInvested),(1/tenure)) - 1) * 100).toFixed(2));
        return cagr;
    }

    static calculateSIPMaturiy = function(sipValue, sipTenure, sipInterestRate, expenseRatio, inflationAccounted){
        // Forumla used FV = (P × ((1 + i)^n - 1) / i)) × (1 + i)
        const principalAmount = Number(sipValue);
        const interestRate = Number(sipInterestRate) / 100 / 12; // yearly interest
        const numOfInstallments = Number(sipTenure) * 12; // In months
        const totalExpenseRatio = Number(expenseRatio) / 100 / 12; // yearly charges for fund management
        const inflationRate = 6 / 100 / 12; // On avegare
        const expenseRatioAdjustedInterestRate = interestRate - totalExpenseRatio;
        const effectiveInterestRate = inflationAccounted ? expenseRatioAdjustedInterestRate - inflationRate : expenseRatioAdjustedInterestRate;

        const amountInvested = Number(Number(principalAmount * sipTenure * 12).toFixed(2));
        const maturityAmount = Number(Number(((principalAmount * (Math.pow((1+interestRate),(sipTenure*12))-1))/interestRate) * (1+interestRate)).toFixed(2));
        const maturityWithExpenseRatio = Number(Number(((principalAmount * (Math.pow((1+expenseRatioAdjustedInterestRate),(sipTenure*12))-1))/expenseRatioAdjustedInterestRate) * (1+expenseRatioAdjustedInterestRate)).toFixed(2));
        const maturityWithInflation = inflationAccounted ? Number(Number(((principalAmount * (Math.pow((1+effectiveInterestRate),(sipTenure*12))-1))/effectiveInterestRate) * (1+effectiveInterestRate)).toFixed(2)) : maturityWithExpenseRatio;
        const amcCharges = Number(Number(maturityAmount - maturityWithExpenseRatio).toFixed(2));
        const wealthGained = Number(Number(maturityWithInflation - amountInvested).toFixed(2));
        const cagr = Number(Number((Math.pow((maturityWithInflation/amountInvested),(1/sipTenure)) - 1) * 100).toFixed(2));// compounded annual growth rate

        return {
            sipTenure,
            amountInvested,
            maturityAmount,
            maturityWithExpenseRatio,
            maturityWithInflation,
            amcCharges,
            wealthGained,
            cagr
        };
    }
}

export default Interests;