// ==========================================================================
// FILENAME: javascript/compare.js
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

function calculateComparison() {
  currentCurrency = localStorage.getItem('fiq_currency') || "USD";

  const cmpInput = document.getElementById('cmp-amount');
  const amount = cmpInput ? (parseFloat(cmpInput.value) || 0) : 0;

  const fiverrNet  = amount * 0.80; 
  const fiverrLost = amount * 0.20;

  const upworkFee  = amount <= 500 ? amount * 0.20 : (500 * 0.20) + ((amount - 500) * 0.10);
  const upworkNet  = amount - upworkFee;

  const directNet  = amount * 1.00; 

  const fractionDigits = (currentCurrency === 'PKR') ? 0 : 2;
  const sign = currencySigns[currentCurrency] || '$';
  
  function fmt(n) {
    return sign + ' ' + Math.round(n).toLocaleString(undefined, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    });
  }

  const cmpFNet = document.getElementById('cmp-f-net');
  const cmpFLost = document.getElementById('cmp-f-lost');
  const cmpUNet = document.getElementById('cmp-u-net');
  const cmpULost = document.getElementById('cmp-u-lost');
  const cmpDNet = document.getElementById('cmp-d-net');
  const cmpDLost = document.getElementById('cmp-d-lost');

  if (cmpFNet) cmpFNet.textContent = 'Net: ' + fmt(fiverrNet);
  if (cmpFLost) cmpFLost.textContent = 'Fee: ' + fmt(fiverrLost);

  if (cmpUNet) cmpUNet.textContent = 'Net: ' + fmt(upworkNet);
  if (cmpULost) cmpULost.textContent = 'Fee: ' + fmt(upworkFee);

  if (cmpDNet) cmpDNet.textContent = 'Net: ' + fmt(directNet);
  if (cmpDLost) cmpDLost.textContent = 'No deductions ✓';

  const best = Math.max(fiverrNet, upworkNet, directNet);

  ['cmp-fiverr', 'cmp-upwork', 'cmp-direct'].forEach(function(id) {
    const cardEl = document.getElementById(id);
    if (cardEl) {
      cardEl.classList.remove('best');
      const oldBadge = cardEl.querySelector('.best-badge');
      if (oldBadge) oldBadge.remove();
    }
  });

  let bestId;
  if (best === directNet) {
    bestId = 'cmp-direct';
  } else if (best === upworkNet) {
    bestId = 'cmp-upwork';
  } else {
    bestId = 'cmp-fiverr';
  }

  const bestCard = document.getElementById(bestId);
  if (bestCard) {
    bestCard.classList.add('best');

    const badge = document.createElement('div');
    badge.className = 'best-badge';
    badge.textContent = '✓ Best earnings';
    bestCard.insertBefore(badge, bestCard.firstChild);
  }

  const advice = document.getElementById('cmp-advice');
  if (advice) {
    if (bestId === 'cmp-direct') {
      advice.textContent = `💡 Direct clients give you 100% of earnings! Saving you ${fmt(fiverrLost)} vs Fiverr.`;
    } else if (bestId === 'cmp-upwork') {
      advice.textContent = '💡 Upwork sliding structures give you a better return margin matrix than Fiverr here.';
    } else {
      advice.textContent = '💡 Consider direct clients or sliding platform contracts to maximize absolute take-home yields.';
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
    const cmpAmountInput = document.getElementById('cmp-amount');
    if (cmpAmountInput) {
        attachInputRestrictions(cmpAmountInput, 'currency');
        cmpAmountInput._lastValid = cmpAmountInput.value;
        attachZeroFocusHandling(cmpAmountInput);
        cmpAmountInput.addEventListener('input', calculateComparison);
    }
    calculateComparison();
});

window.addEventListener('storage', (e) => {
    if (e.key === 'fiq_currency') {
        const oldCurrency = currentCurrency;
        currentCurrency = e.newValue || 'USD';

        const conversionFactor = exchangeRates[currentCurrency] / exchangeRates[oldCurrency];
        
        const cmpAmountInput = document.getElementById('cmp-amount');
        if (cmpAmountInput && cmpAmountInput.value) {
            const converted = Math.round(parseFloat(cmpAmountInput.value) * conversionFactor);
            cmpAmountInput.value = Math.min(converted, 999999999.99);
            cmpAmountInput._lastValid = cmpAmountInput.value;
        }

        calculateComparison();
    }
});