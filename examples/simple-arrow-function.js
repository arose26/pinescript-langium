indicator('Simple Arrow Function', { overlay: false });
function f(x) {
    return x * 2;
}
var y = f(10);
plot(y, 'Result', { color: color.blue });