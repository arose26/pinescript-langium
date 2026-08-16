indicator('Array Destructuring', { overlay: false });
function getValues() {
    var a = 10;
    var b = 20;
    return [
        a,
        b
    ];
}
var [x, y] = getValues();
plot(x, 'X Value', { color: color.blue });
plot(y, 'Y Value', { color: color.red });
function processValues() {
    var [c, d] = getValues();
    var result = c + d;
    return result;
}
plot(processValues(), 'Sum', { color: color.green });