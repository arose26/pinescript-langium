indicator('Arrow Function with Block', { overlay: false });
function f(x = 10) {
    return x * 2;
}
var y = f();
plot(y, 'Result', { color: color.blue });

// Export the function
module.exports = { f };