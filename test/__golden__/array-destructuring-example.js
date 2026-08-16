indicator('Array Destructuring Example', { overlay: false });
function getValues() {
    return [
        10,
        20,
        30
    ];
}
var [a, b, c] = getValues();
plot(a, 'A', { color: color.red });
plot(b, 'B', { color: color.green });
plot(c, 'C', { color: color.blue });