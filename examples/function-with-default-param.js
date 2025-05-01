indicator('Function with Default Parameter', { overlay: false });
function f(x) {
    return x * 2;
}
var y = f();
plot(y, 'Result', { color: color.blue });