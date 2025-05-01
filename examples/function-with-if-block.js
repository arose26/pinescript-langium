indicator('Function with If Block', { overlay: false });
function f(x) {
    if (x > 5) {
        return x * 2;
    } else {
        return x;
    }
}
var y = f(3);
var z = f(10);
plot(y, 'Result Y', { color: color.blue });
plot(z, 'Result Z', { color: color.red });

// Export the function
module.exports = { f };