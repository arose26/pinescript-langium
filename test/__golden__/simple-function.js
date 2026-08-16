indicator('Simple Function', { overlay: false });
function add(a, b) {
    return a + b;
}
var result = add(5, 10);
plot(result, 'Result', { color: color.blue });