// ==========================================================================
// FILENAME: javascript/invoice.js
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
            this.dataset.lastValid = '';
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
            input.dataset.lastValid = '';
            return;
        }

        const validPattern = /^\d*(\.\d{0,2})?$/;
        if (!validPattern.test(val)) {
            input.value = input.dataset.lastValid !== undefined ? input.dataset.lastValid : '';
            return;
        }

        const numVal = parseFloat(val);
        if (!isNaN(numVal) && numVal > maxVal) {
            input.value = input.dataset.lastValid !== undefined ? input.dataset.lastValid : '';
            return;
        }

        input.value = val;
        input.dataset.lastValid = val;
    });
}

// --------------------------------------------------------------------------
// VALIDATION & RESTRICTION HELPERS
// --------------------------------------------------------------------------
function validateTextRule(val, maxLength) {
    if (val === '') return true;
    if (val.length > maxLength) return false;
    if (val.startsWith(' ')) return false;
    if (!/^[a-zA-Z]+( [a-zA-Z]+)* ?$/.test(val)) return false;
    if (/([a-zA-Z])\1\1/i.test(val)) return false;
    return true;
}

function validateQuantity(val) {
    if (val === '') return true;
    if (!/^\d+$/.test(val)) return false;
    const num = Number(val);
    if (num < 0 || num > 999999999) return false;
    return true;
}

function validateUnitPrice(val) {
    if (val === '') return true;
    if (!/^\d+(\.\d{0,2})?$/.test(val)) return false;
    const num = parseFloat(val);
    if (num < 0 || num > 999999999.99) return false;
    return true;
}

function attachControlledInput(input, validator, initialVal = '') {
    let lastValid = validator(initialVal) ? initialVal : '';
    input.dataset.lastValid = lastValid;

    input.addEventListener('keydown', function (e) {
        if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'].includes(e.key)) {
            return;
        }
        if (e.ctrlKey || e.metaKey) {
            return;
        }
        if (this.type === 'number' && ['e', 'E', '+', '-'].includes(e.key)) {
            e.preventDefault();
        }
    });

    input.addEventListener('input', function () {
        let val = this.value;
        if (this.type === 'number') {
            val = cleanLeadingZeros(val);
        }

        if (validator(val)) {
            lastValid = val;
            this.value = val;
            this.dataset.lastValid = val;
        } else {
            this.value = lastValid;
        }
    });
}

function attachLineItemRestrictions(row) {
    const nameInput = row.querySelector('.item-name');
    const descInput = row.querySelector('.item-desc');
    const qtyInput = row.querySelector('.item-qty');
    const priceInput = row.querySelector('.item-price');

    if (nameInput) {
        nameInput.setAttribute('maxlength', '50');
        attachControlledInput(nameInput, val => validateTextRule(val, 50), nameInput.value);
    }

    if (descInput) {
        descInput.setAttribute('maxlength', '100');
        attachControlledInput(descInput, val => validateTextRule(val, 100), descInput.value);
    }

    if (qtyInput) {
        qtyInput.setAttribute('min', '0');
        qtyInput.setAttribute('max', '999999999');
        qtyInput.setAttribute('step', '1');
        qtyInput.setAttribute('inputmode', 'numeric');
        attachControlledInput(qtyInput, validateQuantity, qtyInput.value);
    }

    if (priceInput) {
        priceInput.setAttribute('min', '0');
        priceInput.setAttribute('max', '999999999.99');
        priceInput.setAttribute('step', '0.01');
        priceInput.setAttribute('inputmode', 'decimal');
        attachControlledInput(priceInput, validateUnitPrice, priceInput.value);
    }
}

// --------------------------------------------------------------------------
// HEADER RESTRICTION LOGIC
// --------------------------------------------------------------------------
function setupRestrictions() {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('inv-date');
    const dateError = document.getElementById('inv-date-error');

    if (dateInput) {
        dateInput.setAttribute('max', today);
        dateInput.addEventListener('input', () => {
            if (dateInput.value > today) {
                dateInput.value = today;
                dateInput.classList.add('input-error');
                if (dateError) {
                    dateError.textContent = "Future invoice dates are blocked.";
                    dateError.style.display = 'block';
                }
            } else {
                dateInput.classList.remove('input-error');
                if (dateError) dateError.style.display = 'none';
            }
        });
    }

    const restrictedInputs = [
        { id: 'inv-from', errorId: 'inv-from-error' },
        { id: 'inv-to', errorId: 'inv-to-error' }
    ];

    restrictedInputs.forEach(({ id, errorId }) => {
        const input = document.getElementById(id);
        const errorEl = document.getElementById(errorId);
        if (!input) return;

        input.setAttribute('maxlength', '50');

        input.addEventListener('input', function () {
            let val = this.value;
            let errorMsg = '';

            if (/[^a-zA-Z ]/.test(val)) {
                errorMsg = 'Numbers and special characters are not allowed.';
                val = val.replace(/[^a-zA-Z ]/g, '');
            }

            if (/  +/.test(val)) {
                errorMsg = 'Multiple spaces are not allowed.';
                val = val.replace(/  +/g, ' ');
            }

            if (val.startsWith(' ')) {
                val = val.trimStart();
            }

            if (val.length > 50) {
                errorMsg = 'Maximum 50 characters allowed.';
                val = val.substring(0, 50);
            }

            const counts = {};
            let filteredVal = '';
            let exceededLetter = null;

            for (const char of val) {
                if (/[a-zA-Z]/.test(char)) {
                    const key = char.toLowerCase();
                    counts[key] = (counts[key] || 0) + 1;
                    if (counts[key] > 2) {
                        if (!exceededLetter) exceededLetter = char.toUpperCase();
                        continue;
                    }
                }
                filteredVal += char;
            }

            if (exceededLetter) {
                errorMsg = `Letters may not appear more than 2 times.`;
                val = filteredVal;
            }

            this.value = val;

            if (errorEl) {
                if (errorMsg) {
                    errorEl.textContent = errorMsg;
                    errorEl.style.display = 'block';
                    this.classList.add('input-error');
                } else {
                    errorEl.style.display = 'none';
                    this.classList.remove('input-error');
                }
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const dateInput = document.getElementById('inv-date');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    const invTaxEl = document.getElementById('inv-tax');
    if (invTaxEl) {
        attachInputRestrictions(invTaxEl, 'percentage');
        invTaxEl.dataset.lastValid = invTaxEl.value;
        attachZeroFocusHandling(invTaxEl);
        invTaxEl.addEventListener('input', previewInvoice);
    }

    setupRestrictions();
    initInvoiceItemsEngine();
    previewInvoice();
});

function initInvoiceItemsEngine() {
    const container = document.getElementById('invoice-items-container');
    const addItemBtn = document.getElementById('add-item-btn');
    const limitMessage = document.getElementById('limit-message');
    const maxItems = 8; 

    function updateUIState() {
        if (!container || !addItemBtn) return;
        const rows = container.querySelectorAll('.invoice-item-row');
        if (rows.length >= maxItems) {
            addItemBtn.disabled = true;
            addItemBtn.style.opacity = '0.5';
            addItemBtn.style.cursor = 'not-allowed';
            if (limitMessage) limitMessage.classList.remove('hidden');
        } else {
            addItemBtn.disabled = false;
            addItemBtn.style.opacity = '1';
            addItemBtn.style.cursor = 'pointer';
            if (limitMessage) limitMessage.classList.add('hidden');
        }
    }

    function createItemRow(itemName = '', desc = '', qty = 1, price = '') {
        if (!container) return;
        const rowsCount = container.querySelectorAll('.invoice-item-row').length;
        if (rowsCount >= maxItems) return;

        const rowId = 'item-row-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        const rowHTML = `
            <div class="invoice-item-row" id="${rowId}">
              <div class="grid-2" style="gap: 10px; margin-bottom: 8px;">
                <div class="form-group" style="margin-bottom: 0;">
                  <label>Item / Service Name</label>
                  <input type="text" class="item-name" value="${itemName}" placeholder="Item / Service Name" maxlength="50">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label>Description (Optional)</label>
                  <input type="text" class="item-desc" value="${desc}" placeholder="Optional details" maxlength="100">
                </div>
              </div>
              <div style="display: flex; gap: 10px; align-items: flex-end;">
                <div class="form-group" style="margin-bottom: 0; flex: 1;">
                  <label>Quantity</label>
                  <input type="number" class="item-qty" value="${qty}" min="0" max="999999999" step="1" inputmode="numeric">
                </div>
                <div class="form-group" style="margin-bottom: 0; flex: 2;">
                  <label>Unit Price</label>
                  <input type="number" class="item-price" value="${price}" placeholder="0" min="0" max="999999999.99" step="0.01" inputmode="decimal">
                </div>
                <div style="flex: 1; text-align: right; padding-bottom: 10px; font-weight: 600; color: #4b5563; font-size: 13px;">
                  Row Total: <span class="item-row-total">0.00</span>
                </div>
              </div>
              <button type="button" class="remove-item-btn"><i class="fa fa-trash"></i> Remove</button>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', rowHTML);
        const newRow = document.getElementById(rowId);

        attachLineItemRestrictions(newRow);

        newRow.querySelectorAll('input[type="number"]').forEach(input => {
            attachZeroFocusHandling(input);
        });

        newRow.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                calculateRowTotal(newRow);
                previewInvoice();
            });
        });

        newRow.querySelector('.remove-item-btn').addEventListener('click', () => {
            newRow.remove();
            updateUIState();
            previewInvoice();
        });

        calculateRowTotal(newRow);
        updateUIState();
    }

    function calculateRowTotal(row) {
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const total = qty * price;
        
        currentCurrency = localStorage.getItem('fiq_currency') || "USD";
        const fractionDigits = (currentCurrency === 'PKR') ? 0 : 2;
        
        row.querySelector('.item-row-total').textContent = total.toLocaleString(undefined, {
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits
        });
        row.dataset.calculatedTotal = total; 
    }

    if (addItemBtn) {
        addItemBtn.addEventListener('click', () => {
            createItemRow('', '', 1, '');
            previewInvoice();
        });
    }

    window.gatherInvoiceLineItems = function() {
        const data = [];
        if (!container) return data;
        container.querySelectorAll('.invoice-item-row').forEach(row => {
            data.push({
                name: row.querySelector('.item-name').value || '',
                desc: row.querySelector('.item-desc').value || '',
                qty: parseFloat(row.querySelector('.item-qty').value) || 0,
                price: parseFloat(row.querySelector('.item-price').value) || 0,
                total: parseFloat(row.dataset.calculatedTotal) || 0
            });
        });
        return data;
    };

    if (container && container.querySelectorAll('.invoice-item-row').length === 0) {
        createItemRow('', '', 1, '');
    }
}

function previewInvoice() {
    currentCurrency = localStorage.getItem('fiq_currency') || "USD";

    const invFromEl = document.getElementById('inv-from');
    const invToEl = document.getElementById('inv-to');
    const invDateEl = document.getElementById('inv-date');
    const invTaxEl = document.getElementById('inv-tax');

    const from = invFromEl ? (invFromEl.value || 'Freelancer') : 'Freelancer';
    const to = invToEl ? (invToEl.value || 'Client') : 'Client';
    const date = invDateEl ? (invDateEl.value || '') : '';
    const taxRate = invTaxEl ? (parseFloat(invTaxEl.value) || 0) : 0;

    let items = [];
    if (typeof window.gatherInvoiceLineItems === 'function') {
        items = window.gatherInvoiceLineItems();
    }

    const amount = items.reduce((sum, item) => sum + item.total, 0);
    const taxAmt = amount * (taxRate / 100);
    const total = amount + taxAmt;

    const fractionDigits = (currentCurrency === 'PKR') ? 0 : 2;
    const sign = currencySigns[currentCurrency] || '$';

    function fmt(n) {
        return sign + ' ' + n.toLocaleString(undefined, {
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits
        });
    }

    const pFrom = document.getElementById('p-from');
    const pTo = document.getElementById('p-to');
    const pDate = document.getElementById('p-date');
    const pSubtotal = document.getElementById('p-subtotal');
    const pTotal = document.getElementById('p-total');

    if (pFrom) pFrom.textContent = from;
    if (pTo) pTo.textContent = to;
    if (pDate) pDate.textContent = 'Date: ' + date;
    if (pSubtotal) pSubtotal.textContent = fmt(amount);
    if (pTotal) pTotal.textContent = 'Total: ' + fmt(total);

    const tbody = document.getElementById('p-invoice-items-body');
    if (tbody) {
        tbody.innerHTML = '';

        if (items.length === 0) {
            tbody.innerHTML = `
                <tr style="border-bottom: 1px solid #eef2f6;">
                  <td colspan="4" style="padding: 12px 0; color: #999; text-align: center;">No items added</td>
                </tr>
            `;
        } else {
            items.forEach(item => {
                const displayName = item.name || 'Service Item';
                const descriptionLine = item.desc ? `<div style="font-size: 11px; color: #777; margin-top: 2px;">${item.desc}</div>` : '';
                const rowHTML = `
                    <tr style="border-bottom: 1px solid #eef2f6; vertical-align: top;">
                      <td style="padding: 12px 0;">
                        <div style="font-weight: 600; color: #222;">${displayName}</div>
                        ${descriptionLine}
                      </td>
                      <td style="padding: 12px 0; text-align: center;">${item.qty}</td>
                      <td style="padding: 12px 0; text-align: right;">${fmt(item.price)}</td>
                      <td style="padding: 12px 0; text-align: right; font-weight: 600;">${fmt(item.total)}</td>
                    </tr>
                `;
                tbody.insertAdjacentHTML('beforeend', rowHTML);
            });
        }
    }

    const taxRow = document.getElementById('p-tax-row');
    if (taxRow) {
        if (taxRate > 0) {
            taxRow.style.display = '';
            const pTaxLabel = document.getElementById('p-tax-label');
            const pTaxVal = document.getElementById('p-tax-val');
            if (pTaxLabel) pTaxLabel.textContent = 'Tax (' + taxRate + '%):';
            if (pTaxVal) pTaxVal.textContent = fmt(taxAmt);
        } else {
            taxRow.style.display = 'none';
        }
    }
}

function downloadInvoicePDF() {
    window.print();
}

window.addEventListener('storage', (e) => {
    if (e.key === 'fiq_currency') {
        const oldCurrency = currentCurrency;
        currentCurrency = e.newValue || 'USD';

        const conversionFactor = exchangeRates[currentCurrency] / exchangeRates[oldCurrency];
        const container = document.getElementById('invoice-items-container');
        
        if (container) {
            container.querySelectorAll('.invoice-item-row').forEach(row => {
                const priceInput = row.querySelector('.item-price');
                if (priceInput && priceInput.value) {
                    priceInput.value = Math.round(parseFloat(priceInput.value) * conversionFactor);
                }
                
                const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
                const price = parseFloat(priceInput ? priceInput.value : 0) || 0;
                const total = qty * price;
                const fractionDigits = (currentCurrency === 'PKR') ? 0 : 2;
                
                const totalEl = row.querySelector('.item-row-total');
                if (totalEl) {
                    totalEl.textContent = total.toLocaleString(undefined, {
                        minimumFractionDigits: fractionDigits,
                        maximumFractionDigits: fractionDigits
                    });
                }
                row.dataset.calculatedTotal = total;
            });
        }
        
        previewInvoice();
    }
});