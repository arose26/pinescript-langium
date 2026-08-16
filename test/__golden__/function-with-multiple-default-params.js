indicator('Function with Multiple Default Parameters', { overlay: false });
function f(x = 10, y = 20) {
    return x * y;
}
var z = f();
plot(z, 'Result', { color: color.blue });