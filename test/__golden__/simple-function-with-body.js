indicator('Simple Function with Body', { overlay: false });
function add(a, b) {
    var result = a + b;
    return result;
}
var value = add(5, 10);
plot(value, 'Result', { color: color.blue });