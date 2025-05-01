indicator('Function with Direct Return', { overlay: false });
function f(x) {
    return x * 2;
}
var y = f(3);
var z = f(10);
plot(y, 'Result Y', { color: color.blue });
plot(z, 'Result Z', { color: color.red });