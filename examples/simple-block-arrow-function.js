indicator('Simple Block Arrow Function', { overlay: false });
function f(x) {
    var y = x * 2;
    return y;
}
var result = f(10);
plot(result, 'Result', { color: color.blue });