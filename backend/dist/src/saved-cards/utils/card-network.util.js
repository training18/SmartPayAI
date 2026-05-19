"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectCardNetwork = detectCardNetwork;
function detectCardNetwork(first4) {
    const digits = (first4 ?? '').replace(/[^0-9]/g, '').slice(0, 4);
    if (!digits)
        return { network: 'UNKNOWN', label: 'Unknown' };
    const d2 = digits.slice(0, 2);
    const d3 = digits.slice(0, 3);
    const n4 = digits.length === 4 ? parseInt(digits, 10) : NaN;
    if (digits[0] === '4')
        return { network: 'VISA', label: 'Visa' };
    if (/^5[1-5]$/.test(d2))
        return { network: 'MASTERCARD', label: 'Mastercard' };
    if (!Number.isNaN(n4) && n4 >= 2221 && n4 <= 2720) {
        return { network: 'MASTERCARD', label: 'Mastercard' };
    }
    if (d2 === '34' || d2 === '37')
        return { network: 'AMEX', label: 'American Express' };
    if (digits === '9792')
        return { network: 'TROY', label: 'Troy' };
    if (!Number.isNaN(n4) && n4 >= 3528 && n4 <= 3589)
        return { network: 'JCB', label: 'JCB' };
    if (/^30[0-5]$/.test(d3) || d2 === '36' || d2 === '38' || d2 === '39') {
        return { network: 'DINERS', label: 'Diners Club' };
    }
    if (digits === '6011' || d2 === '65' || /^64[4-9]$/.test(d3)) {
        return { network: 'DISCOVER', label: 'Discover' };
    }
    if (d2 === '62')
        return { network: 'UNIONPAY', label: 'UnionPay' };
    return { network: 'UNKNOWN', label: 'Unknown' };
}
//# sourceMappingURL=card-network.util.js.map