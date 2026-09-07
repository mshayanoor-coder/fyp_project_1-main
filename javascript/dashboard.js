// ==========================================================================
// FILENAME: javascript/dashboard.js
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

function calculateDashboard() {
    currentCurrency = localStorage.getItem('fiq_currency') || "USD";

    const dIncomeEl = document.getElementById('d-income');
    const dBizexpEl = document.getElementById('d-bizexp');
    const dTaxrateEl = document.getElementById('d-taxrate');
    const dHouseEl = document.getElementById('d-house');

    const income = dIncomeEl ? (parseFloat(dIncomeEl.value) || 0) : 0;
    const bizExp = dBizexpEl ? (parseFloat(dBizexpEl.value) || 0) : 0;
    const taxRate = dTaxrateEl ? (parseFloat(dTaxrateEl.value) || 0) : 0;
    const house = dHouseEl ? (parseFloat(dHouseEl.value) || 0) : 0;

    const taxAmt = income * (taxRate / 100);
    const realNet = income - bizExp - taxAmt - house;

    const fractionDigits = (currentCurrency === 'PKR') ? 0 : 2;
    const sign = currencySigns[currentCurrency] || '$';

    function fmt(n) {
        return sign + ' ' + n.toLocaleString(undefined, {
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits
        });
    }

    const grossEl = document.getElementById('d-r-gross');
    const bizEl = document.getElementById('d-r-biz');
    const taxEl = document.getElementById('d-r-tax');
    const houseEl = document.getElementById('d-r-house');

    if (grossEl) grossEl.textContent = fmt(income);
    if (bizEl) bizEl.textContent = '- ' + fmt(bizExp);
    if (taxEl) taxEl.textContent = '- ' + fmt(taxAmt);
    if (houseEl) houseEl.textContent = '- ' + fmt(house);

    const netEl = document.getElementById('d-r-net');
    if (netEl) netEl.textContent = fmt(realNet);

    const msg = document.getElementById('d-r-msg');
    if (msg && netEl) {
        if (realNet >= 0) {
            netEl.style.color = '#1D9E75';
            msg.textContent = '✓ Positive! You earn more than you spend.';
            msg.style.color = '#1D9E75';
        } else {
            netEl.style.color = '#D85A30';
            msg.textContent = '⚠ Warning: Expenses exceed income! Review spending.';
            msg.style.color = '#D85A30';
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const inputIds = ['d-income', 'd-bizexp', 'd-taxrate', 'd-house'];
    inputIds.forEach(id => {
        const inputEl = document.getElementById(id);
        if (inputEl) {
            attachZeroFocusHandling(inputEl);
            inputEl.addEventListener('input', calculateDashboard);
        }
    });
    calculateDashboard();
});

window.addEventListener('storage', (e) => {
    if (e.key === 'fiq_currency') {
        const oldCurrency = currentCurrency;
        currentCurrency = e.newValue || 'USD';

        const conversionFactor = exchangeRates[currentCurrency] / exchangeRates[oldCurrency];

        const inputIds = ['d-income', 'd-bizexp', 'd-house'];
        inputIds.forEach(id => {
            const el = document.getElementById(id);
            if (el && el.value) {
                el.value = Math.round(parseFloat(el.value) * conversionFactor);
            }
        });

        calculateDashboard();
    }
});