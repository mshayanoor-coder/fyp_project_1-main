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
            this._lastValid = '';
        } else {
            this.select();
        }
    });
}

function attachInputRestrictions(input, fieldType) {
    const maxVal = (fieldType === 'percentage') ? 100 : 999999999.99;

    input.min = "0";
    input.max = String(maxVal);
    input.step = "0.01";
    input.setAttribute("inputmode", "decimal");

    input.addEventListener('keydown', (e) => {
        if (['e', 'E', '+', '-'].includes(e.key)) {
            e.preventDefault();
        }
    });

    input.addEventListener('input', () => {
        const val = input.value;

        if (val === '') {
            input._lastValid = '';
            return;
        }

        const validPattern = /^\d*(\.\d{0,2})?$/;
        if (!validPattern.test(val)) {
            input.value = input._lastValid !== undefined ? input._lastValid : '';
            return;
        }

        const numVal = parseFloat(val);
        if (!isNaN(numVal) && numVal > maxVal) {
            input.value = input._lastValid !== undefined ? input._lastValid : '';
            return;
        }

        input._lastValid = val;
    });
}

function restoreExpenseInputs() {
    const savedInputs = JSON.parse(localStorage.getItem('fiq_saved_expense_inputs') || '{}');
    const allInputs = document.querySelectorAll('.exp-input');
    allInputs.forEach((input, index) => {
        if (savedInputs[index] !== undefined && savedInputs[index] !== '') {
            input.value = savedInputs[index];
            input._lastValid = input.value;
        }
    });
}

function calculateExpenses() {
    currentCurrency = localStorage.getItem('fiq_currency') || "USD";
    
    const allInputs = document.querySelectorAll('.exp-input');
    let total = 0;
    const inputState = {};

    allInputs.forEach(function(input, index) {
        const val = parseFloat(input.value) || 0;
        total += val;
        inputState[index] = input.value;
    });

    // Permanently persist individual field inputs and total
    localStorage.setItem('fiq_saved_expense_inputs', JSON.stringify(inputState));
    localStorage.setItem('fiq_total_expense', total);

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
        attachInputRestrictions(input, 'currency');
        input._lastValid = input.value;
        attachZeroFocusHandling(input);
        input.addEventListener('input', calculateExpenses);
    });
    restoreExpenseInputs();
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
                const converted = Math.round(parseFloat(input.value) * conversionFactor);
                input.value = Math.min(converted, 999999999.99);
                input._lastValid = input.value;
            }
        });

        calculateExpenses();
    }
});