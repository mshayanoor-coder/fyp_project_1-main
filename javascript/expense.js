// ==========================================================================
// FILENAME: javascript/expense.js
// ==========================================================================

const exchangeRates = { USD: 1.0, PKR: 278.0, GBP: 0.78, EUR: 0.92, AED: 3.67 };
const currencySigns = { USD: '$', PKR: '₨', GBP: '£', EUR: '€', AED: 'د.إ' };

let currentCurrency = localStorage.getItem('fiq_currency') || 'USD';

function attachZeroFocusHandling(input) {
    if (!input.placeholder) input.placeholder = "0";
    input.addEventListener('focus', function () {
        if (this.value === '0') {
            this.value = '';
        } else {
            this.select();
        }
    });
}

function calculateExpenses() {
    currentCurrency = localStorage.getItem('fiq_currency') || "USD";
    
    const allInputs = document.querySelectorAll('.exp-input');
    let total = 0;

    allInputs.forEach(function(input) {
        total += parseFloat(input.value) || 0;
    });

    const fractionDigits = (currentCurrency === 'PKR') ? 0 : 2;
    const sign = currencySigns[currentCurrency] || '$';

    const formattedTotal = total.toLocaleString(undefined, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
    });

    const expTotalEl = document.getElementById('exp-total');
    if (expTotalEl) {
        expTotalEl.textContent = sign + ' ' + formattedTotal;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.exp-input').forEach(input => {
        attachZeroFocusHandling(input);
        input.addEventListener('input', calculateExpenses);
    });
    calculateExpenses();
});

window.addEventListener('storage', (e) => {
    if (e.key === 'fiq_currency') {
        const oldCurrency = currentCurrency;
        currentCurrency = e.newValue || 'USD';

        const conversionFactor = exchangeRates[currentCurrency] / exchangeRates[oldCurrency];

        const allInputs = document.querySelectorAll('.exp-input');
        allInputs.forEach(input => {
            if (input && input.value) {
                input.value = Math.round(parseFloat(input.value) * conversionFactor);
            }
        });

        calculateExpenses();
    }
});