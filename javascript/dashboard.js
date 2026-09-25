// ==========================================================================
// FILENAME: javascript/dashboard.js
// ==========================================================================

const exchangeRates = { USD: 1.0, PKR: 278.0, GBP: 0.78, EUR: 0.92, AED: 3.67 };
const currencySigns = { USD: '$', PKR: '₨', GBP: '£', EUR: '€', AED: 'د.إ' };

let currentCurrency = localStorage.getItem('fiq_currency') || 'USD';

function cleanLeadingZeros(val) {
    if (!val) return '';
    if (/^0+$/.test(val)) return '0';
    if (/^0+\d/.test(val)) return val.replace(/^0+/, '');
    return val;
}

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
        let val = cleanLeadingZeros(input.value);

        if (val === '') {
            input.value = '';
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

        input.value = val;
        input._lastValid = val;
    });
}

function loadDashboardState() {
    const allNet = JSON.parse(localStorage.getItem('fiq_professions_net') || '{}');
    const netKeys = Object.keys(allNet);
    const netSum = Object.values(allNet).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const totalExp = localStorage.getItem('fiq_total_expense');
    const savedDash = JSON.parse(localStorage.getItem('fiq_dashboard_inputs') || '{}');

    const dIncomeEl = document.getElementById('d-income');
    const dHouseEl = document.getElementById('d-house');
    const dBizexpEl = document.getElementById('d-bizexp');
    const dTaxrateEl = document.getElementById('d-taxrate');

    if (dIncomeEl) {
        if (netKeys.length > 0) {
            dIncomeEl.value = netSum !== 0 ? netSum.toFixed(2) : "0";
        } else {
            dIncomeEl.value = '';
        }
        dIncomeEl._lastValid = dIncomeEl.value;
    }

    if (dHouseEl) {
        if (totalExp !== null && totalExp !== undefined && totalExp !== '') {
            dHouseEl.value = parseFloat(totalExp) > 0 ? parseFloat(totalExp).toFixed(2) : "0";
        } else {
            dHouseEl.value = '';
        }
        dHouseEl._lastValid = dHouseEl.value;
    }

    if (dBizexpEl && savedDash.bizExp !== undefined) {
        dBizexpEl.value = savedDash.bizExp;
        dBizexpEl._lastValid = dBizexpEl.value;
    }
    if (dTaxrateEl && savedDash.taxRate !== undefined) {
        dTaxrateEl.value = savedDash.taxRate;
        dTaxrateEl._lastValid = dTaxrateEl.value;
    }
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

    localStorage.setItem('fiq_dashboard_inputs', JSON.stringify({
        income: dIncomeEl ? dIncomeEl.value : '',
        bizExp: dBizexpEl ? dBizexpEl.value : '',
        taxRate: dTaxrateEl ? dTaxrateEl.value : '',
        house: dHouseEl ? dHouseEl.value : ''
    }));

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
    const currencyFields = ['d-income', 'd-bizexp', 'd-house'];
    currencyFields.forEach(id => {
        const inputEl = document.getElementById(id);
        if (inputEl) {
            attachInputRestrictions(inputEl, 'currency');
            inputEl._lastValid = inputEl.value;
            attachZeroFocusHandling(inputEl);
            inputEl.addEventListener('input', calculateDashboard);
        }
    });

    const taxRateEl = document.getElementById('d-taxrate');
    if (taxRateEl) {
        attachInputRestrictions(taxRateEl, 'percentage');
        taxRateEl._lastValid = taxRateEl.value;
        attachZeroFocusHandling(taxRateEl);
        taxRateEl.addEventListener('input', calculateDashboard);
    }

    loadDashboardState();
    calculateDashboard();
});

window.addEventListener('storage', (e) => {
    if (e.key === 'fiq_professions_net' || e.key === 'fiq_total_expense') {
        loadDashboardState();
        calculateDashboard();
    }

    if (e.key === 'fiq_currency') {
        const oldCurrency = currentCurrency;
        currentCurrency = e.newValue || 'USD';

        const conversionFactor = exchangeRates[currentCurrency] / exchangeRates[oldCurrency];

        const inputIds = ['d-income', 'd-bizexp', 'd-house'];
        inputIds.forEach(id => {
            const el = document.getElementById(id);
            if (el && el.value) {
                const converted = Math.round(parseFloat(el.value) * conversionFactor);
                el.value = Math.min(converted, 999999999.99);
                el._lastValid = el.value;
            }
        });

        calculateDashboard();
    }
});