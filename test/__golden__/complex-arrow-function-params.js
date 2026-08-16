indicator('Complex Arrow Function Params', { overlay: false });
function isInBullDivergence(indicator, price = close, length = 100, confirm = true, confLength = 1) {
    var isDiv = 0;
    var confirmOffset = confirm ? confLength : 0;
    var LL = indicator[0 + confirmOffset];
    return isDiv;
}
var result = isInBullDivergence(close, { length: 50 });
plot(result, 'Result', { color: color.blue });