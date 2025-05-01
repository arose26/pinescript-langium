indicator('Function with Multiple Default Parameters', { overlay: false });
function f(x, y) {
    return x * y;
}
var z = f();
plot(z, 'Result', { color: color.blue });