// ==========================================================================
// FILENAME: javascript/calculator.js
// ==========================================================================

const exchangeRates = {
    USD: 1.0,
    PKR: 278.0, 
    GBP: 0.78,
    EUR: 0.92,
    AED: 3.67
};

const currencySigns = {
    USD: '$',
    PKR: '₨',
    GBP: '£',
    EUR: '€',
    AED: 'د.إ'
};

const professionSchema = {
    "Digital Marketing": {
        fields: [
            { id: "grossIncomeInput", label: "Gross Income", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "platformFeeInput", label: "Platform Fee % (Fiverr=20, Upwork=10)", placeholder: "e.g.,0", defaultValue: 0, type: "percentage" },
            { id: "softwareCostInput", label: "Software / Tools Cost", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "extraCostInput", label: "Ad Spend / Other Cost", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "taxRateInput", label: "Tax Rate %", placeholder: "e.g., 0", defaultValue: 0, type: "percentage" }
        ],
        calculate: (vals) => {
            const pFee = vals.grossIncomeInput * (vals.platformFeeInput / 100);
            const tax = vals.grossIncomeInput * (vals.taxRateInput / 100);
            return { 
                gross: vals.grossIncomeInput, 
                platformFee: pFee,
                softwareCost: vals.softwareCostInput,
                extraCost: vals.extraCostInput,
                tax: tax, 
                net: vals.grossIncomeInput - pFee - vals.softwareCostInput - vals.extraCostInput - tax 
            };
        }
    },
    "TikTok Shop": {
        fields: [
            { id: "sellingPrice", label: "Selling Price (Total Revenue)", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "productCost", label: "Product Cost", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "shipping", label: "Shipping Cost", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "platformCommission", label: "Platform Commission (%)", placeholder: "e.g., 0", defaultValue: 0, type: "percentage" },
            { id: "ads", label: "Ads Spend", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "taxRate", label: "Tax Rate (%)", placeholder: "e.g., 0", defaultValue: 0, type: "percentage" }
        ],
        calculate: (vals) => {
            const pFee = vals.sellingPrice * (vals.platformCommission / 100);
            const tax = vals.sellingPrice * (vals.taxRate / 100);
            const totalCosts = vals.productCost + vals.shipping + pFee + vals.ads;
            return { gross: vals.sellingPrice, platformFee: totalCosts, softwareCost: 0, extraCost: 0, tax: tax, net: vals.sellingPrice - totalCosts - tax };
        }
    },
    "Video Editing": {
        fields: [
            { id: "projectIncome", label: "Project Income", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "softwareSubscription", label: "Software Subscription", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "assetsCost", label: "Assets Cost", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "platformFee", label: "Platform Fee (%)", placeholder: "e.g., 0", defaultValue: 0, type: "percentage" },
            { id: "taxRate", label: "Tax Rate (%)", placeholder: "e.g., 0", defaultValue: 0, type: "percentage" }
        ],
        calculate: (vals) => {
            const pFee = vals.projectIncome * (vals.platformFee / 100);
            const tax = vals.projectIncome * (vals.taxRate / 100);
            const totalCosts = vals.softwareSubscription + vals.assetsCost + pFee;
            return { gross: vals.projectIncome, platformFee: totalCosts, softwareCost: 0, extraCost: 0, tax: tax, net: vals.projectIncome - totalCosts - tax };
        }
    },
    "Audio Editing": {
        fields: [
            { id: "projectIncome", label: "Project Income", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "pluginCost", label: "Plugin Cost", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "softwareCost", label: "Software Cost", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "platformFee", label: "Platform Fee (%)", placeholder: "e.g., 0", defaultValue: 0, type: "percentage" },
            { id: "taxRate", label: "Tax Rate (%)", placeholder: "e.g., 0", defaultValue: 0, type: "percentage" }
        ],
        calculate: (vals) => {
            const pFee = vals.projectIncome * (vals.platformFee / 100);
            const tax = vals.projectIncome * (vals.taxRate / 100);
            const totalCosts = vals.pluginCost + vals.softwareCost + pFee;
            return { gross: vals.projectIncome, platformFee: totalCosts, softwareCost: 0, extraCost: 0, tax: tax, net: vals.projectIncome - totalCosts - tax };
        }
    },
    "Graphic Design": {
        fields: [
            { id: "projectIncome", label: "Project Income", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "fontsAssetsCost", label: "Fonts & Assets Cost", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "softwareSubscription", label: "Software Subscription", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "platformFee", label: "Platform Fee (%)", placeholder: "e.g., 0", defaultValue: 0, type: "percentage" },
            { id: "taxRate", label: "Tax Rate (%)", placeholder: "e.g., 0", defaultValue: 0, type: "percentage" }
        ],
        calculate: (vals) => {
            const pFee = vals.projectIncome * (vals.platformFee / 100);
            const tax = vals.projectIncome * (vals.taxRate / 100);
            const totalCosts = vals.fontsAssetsCost + vals.softwareSubscription + pFee;
            return { gross: vals.projectIncome, platformFee: totalCosts, softwareCost: 0, extraCost: 0, tax: tax, net: vals.projectIncome - totalCosts - tax };
        }
    },
    "Content Writing": {
        fields: [
            { id: "projectIncome", label: "Project Income", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "researchCost", label: "Research Cost", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "aiToolCost", label: "AI Tool Cost", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "platformFee", label: "Platform Fee (%)", placeholder: "e.g., 0", defaultValue: 0, type: "percentage" },
            { id: "taxRate", label: "Tax Rate (%)", placeholder: "e.g., 0", defaultValue: 0, type: "percentage" }
        ],
        calculate: (vals) => {
            const pFee = vals.projectIncome * (vals.platformFee / 100);
            const tax = vals.projectIncome * (vals.taxRate / 100);
            const totalCosts = vals.researchCost + vals.aiToolCost + pFee;
            return { gross: vals.projectIncome, platformFee: totalCosts, softwareCost: 0, extraCost: 0, tax: tax, net: vals.projectIncome - totalCosts - tax };
        }
    },
    "Social Media": {
        fields: [
            { id: "monthlyIncome", label: "Monthly Income", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "adBudget", label: "Ad Budget", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "schedulingToolCost", label: "Scheduling Tool Cost", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "platformFee", label: "Platform Fee (%)", placeholder: "e.g., 0", defaultValue: 0, type: "percentage" },
            { id: "taxRate", label: "Tax Rate (%)", placeholder: "e.g., 0", defaultValue: 0, type: "percentage" }
        ],
        calculate: (vals) => {
            const pFee = vals.monthlyIncome * (vals.platformFee / 100);
            const tax = vals.monthlyIncome * (vals.taxRate / 100);
            const totalCosts = vals.adBudget + vals.schedulingToolCost + pFee;
            return { gross: vals.monthlyIncome, platformFee: totalCosts, softwareCost: 0, extraCost: 0, tax: tax, net: vals.monthlyIncome - totalCosts - tax };
        }
    },
    "Web Development": {
        fields: [
            { id: "projectIncome", label: "Project Income", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "hostingDomain", label: "Hosting & Domain", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "apiCost", label: "API Cost", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "platformFee", label: "Platform Fee (%)", placeholder: "e.g., 0", defaultValue: 0, type: "percentage" },
            { id: "taxRate", label: "Tax Rate (%)", placeholder: "e.g., 0", defaultValue: 0, type: "percentage" }
        ],
        calculate: (vals) => {
            const pFee = vals.projectIncome * (vals.platformFee / 100);
            const tax = vals.projectIncome * (vals.taxRate / 100);
            const totalCosts = vals.hostingDomain + vals.apiCost + pFee;
            return { gross: vals.projectIncome, platformFee: totalCosts, softwareCost: 0, extraCost: 0, tax: tax, net: vals.projectIncome - totalCosts - tax };
        }
    },
    "Photography": {
        fields: [
            { id: "sessionIncome", label: "Session Income", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "equipmentCost", label: "Equipment Cost", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "travelCost", label: "Travel Cost", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "editingSoftware", label: "Editing Software", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "platformFee", label: "Platform Fee (%)", placeholder: "e.g., 0", defaultValue: 0, type: "percentage" },
            { id: "taxRate", label: "Tax Rate (%)", placeholder: "e.g., 0", defaultValue: 0, type: "percentage" }
        ],
        calculate: (vals) => {
            const pFee = vals.sessionIncome * (vals.platformFee / 100);
            const tax = vals.sessionIncome * (vals.taxRate / 100);
            const totalCosts = vals.equipmentCost + vals.travelCost + vals.editingSoftware + pFee;
            return { gross: vals.sessionIncome, platformFee: totalCosts, softwareCost: 0, extraCost: 0, tax: tax, net: vals.sessionIncome - totalCosts - tax };
        }
    },
    "E-Commerce": {
        fields: [
            { id: "revenue", label: "Total Revenue", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "productCost", label: "Product Cost", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "shipping", label: "Shipping Cost", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "marketingCost", label: "Marketing Cost", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "platformFee", label: "Platform Fee (%)", placeholder: "e.g., 0", defaultValue: 0, type: "percentage" },
            { id: "taxRate", label: "Tax Rate (%)", placeholder: "e.g., 0", defaultValue: 0, type: "percentage" }
        ],
        calculate: (vals) => {
            const pFee = vals.revenue * (vals.platformFee / 100);
            const tax = vals.revenue * (vals.taxRate / 100);
            const totalCosts = vals.productCost + vals.shipping + vals.marketingCost + pFee;
            return { gross: vals.revenue, platformFee: totalCosts, softwareCost: 0, extraCost: 0, tax: tax, net: vals.revenue - totalCosts - tax };
        }
    },
    "SEO": {
        fields: [
            { id: "clientIncome", label: "Client Income", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "seoTools", label: "SEO Tools Cost", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "contentCost", label: "Content Cost", placeholder: "e.g., 0", defaultValue: 0, type: "currency" },
            { id: "platformFee", label: "Platform Fee (%)", placeholder: "e.g., 0", defaultValue: 0, type: "percentage" },
            { id: "taxRate", label: "Tax Rate (%)", placeholder: "e.g., 0", defaultValue: 0, type: "percentage" }
        ],
        calculate: (vals) => {
            const pFee = vals.clientIncome * (vals.platformFee / 100);
            const tax = vals.clientIncome * (vals.taxRate / 100);
            const totalCosts = vals.seoTools + vals.contentCost + pFee;
            return { gross: vals.clientIncome, platformFee: totalCosts, softwareCost: 0, extraCost: 0, tax: tax, net: vals.clientIncome - totalCosts - tax };
        }
    }
};

let currentCurrency = localStorage.getItem('fiq_currency') || 'USD';
let currentProfession = localStorage.getItem('fiq_active_profession') || 'Digital Marketing';

const calculatorHeader = document.getElementById('calculatorHeader');
const grossIncomeDisplay = document.getElementById('grossIncomeDisplay');
const platformFeeDisplay = document.getElementById('platformFeeDisplay'); 
const softwareCostDisplay = document.getElementById('softwareCostDisplay');
const extraCostDisplay = document.getElementById('extraCostDisplay');
const taxDisplay = document.getElementById('taxDisplay');
const netProfitDisplay = document.getElementById('netProfitDisplay');

const formContainer = document.getElementById('dynamicFormContainer'); 

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

function renderDynamicForm(profession, checkOldValues = false) {
    if (!formContainer) return;

    const schema = professionSchema[profession];
    if (!schema) return;

    const savedAllInputs = JSON.parse(localStorage.getItem('fiq_profession_inputs') || '{}');
    const savedProfInputs = savedAllInputs[profession] || {};

    const conversionFactor = exchangeRates[currentCurrency] / exchangeRates['PKR'];
    formContainer.innerHTML = ''; 

    schema.fields.forEach(field => {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'form-group'; 

        const label = document.createElement('label');
        label.innerText = field.label;
        label.setAttribute('for', field.id);

        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'form-control';
        input.id = field.id;
        input.placeholder = "0";

        attachInputRestrictions(input, field.type);

        if (savedProfInputs[field.id] !== undefined && savedProfInputs[field.id] !== '') {
            input.value = savedProfInputs[field.id];
        } else if (checkOldValues) {
            const oldNode = document.getElementById(field.id);
            if (oldNode) input.value = oldNode.value;
        } else {
            if (field.defaultValue && field.defaultValue !== 0) {
                if (field.type === 'currency') {
                    input.value = Math.round(field.defaultValue * conversionFactor);
                } else {
                    input.value = field.defaultValue;
                }
            } else {
                input.value = '';
            }
        }

        input._lastValid = input.value;

        attachZeroFocusHandling(input);
        input.addEventListener('input', calculateNetProfit);

        inputGroup.appendChild(label);
        inputGroup.appendChild(input);
        formContainer.appendChild(inputGroup);
    });
}

function calculateNetProfit() {
    const schema = professionSchema[currentProfession];
    if (!schema) return;

    const inputValues = {};
    const rawStoredValues = {};
    let hasAnyInput = false;

    schema.fields.forEach(field => {
        const inputNode = document.getElementById(field.id);
        const val = inputNode ? inputNode.value.trim() : '';
        rawStoredValues[field.id] = val;

        if (val !== '' && !isNaN(parseFloat(val)) && parseFloat(val) !== 0) {
            hasAnyInput = true;
        }

        const parsed = inputNode ? parseFloat(inputNode.value) : 0;
        inputValues[field.id] = (isNaN(parsed) || !isFinite(parsed) || parsed < 0) ? 0 : parsed;
    });

    const savedAllInputs = JSON.parse(localStorage.getItem('fiq_profession_inputs') || '{}');
    if (hasAnyInput) {
        savedAllInputs[currentProfession] = rawStoredValues;
    } else {
        delete savedAllInputs[currentProfession];
    }
    localStorage.setItem('fiq_profession_inputs', JSON.stringify(savedAllInputs));

    const results = schema.calculate(inputValues);

    if (grossIncomeDisplay) grossIncomeDisplay.innerText = formatCurrency(results.gross, currentCurrency);
    if (taxDisplay) taxDisplay.innerText = `- ${formatCurrency(results.tax, currentCurrency)}`;
    if (netProfitDisplay) netProfitDisplay.innerText = formatCurrency(results.net, currentCurrency);

    if (currentProfession === "Digital Marketing") {
        if (platformFeeDisplay) platformFeeDisplay.innerText = `- ${formatCurrency(results.platformFee, currentCurrency)}`;
        if (softwareCostDisplay) {
            softwareCostDisplay.parentElement.style.display = 'flex';
            softwareCostDisplay.innerText = `- ${formatCurrency(results.softwareCost, currentCurrency)}`;
        }
        if (extraCostDisplay) {
            extraCostDisplay.parentElement.style.display = 'flex';
            extraCostDisplay.innerText = `- ${formatCurrency(results.extraCost, currentCurrency)}`;
        }
    } else {
        if (platformFeeDisplay) platformFeeDisplay.innerText = `- ${formatCurrency(results.platformFee, currentCurrency)}`;
        if (softwareCostDisplay) softwareCostDisplay.parentElement.style.display = 'none';
        if (extraCostDisplay) extraCostDisplay.parentElement.style.display = 'none';
    }

    const allNet = JSON.parse(localStorage.getItem('fiq_professions_net') || '{}');
    if (hasAnyInput) {
        allNet[currentProfession] = results.net;
    } else {
        delete allNet[currentProfession];
    }
    localStorage.setItem('fiq_professions_net', JSON.stringify(allNet));
}

function formatCurrency(value, currency) {
    const fractionDigits = (currency === 'PKR') ? 0 : 2;
    const sign = currencySigns[currency] || '$';
    const formatted = Math.abs(value).toLocaleString(undefined, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
    });
    return value < 0 ? `-${sign} ${formatted}` : `${sign} ${formatted}`;
}

function calculateProfessionMargins() {
    const oldCurrency = currentCurrency;
    currentCurrency = localStorage.getItem('fiq_currency') || 'USD';

    const conversionFactor = exchangeRates[currentCurrency] / exchangeRates[oldCurrency];
    const schema = professionSchema[currentProfession];

    if (schema) {
        schema.fields.forEach(field => {
            const inputNode = document.getElementById(field.id);
            if (inputNode && field.type === 'currency' && inputNode.value) {
                const converted = Math.round(parseFloat(inputNode.value) * conversionFactor);
                inputNode.value = Math.min(converted, 999999999.99);
                inputNode._lastValid = inputNode.value;
            }
        });
    }

    calculateNetProfit();
}

const tabButtons = document.querySelectorAll('.category-btn');
tabButtons.forEach(button => {
    button.addEventListener('click', function() {
        document.querySelector('.category-btn.active')?.classList.remove('active');
        this.classList.add('active');

        let rawProfession = this.getAttribute('data-profession');
        currentProfession = rawProfession;
        localStorage.setItem('fiq_active_profession', currentProfession);

        if (calculatorHeader) calculatorHeader.innerText = `${currentProfession} Calculator`;

        renderDynamicForm(currentProfession, false);
        calculateNetProfit();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    if (currentProfession) {
        document.querySelector('.category-btn.active')?.classList.remove('active');
        const activeBtn = Array.from(tabButtons).find(btn => btn.getAttribute('data-profession') === currentProfession);
        if (activeBtn) activeBtn.classList.add('active');
        if (calculatorHeader) calculatorHeader.innerText = `${currentProfession} Calculator`;
    }

    renderDynamicForm(currentProfession, false);
    calculateNetProfit();
});

window.addEventListener('storage', (e) => {
    if (e.key === 'fiq_currency') {
        calculateProfessionMargins();
    }
});