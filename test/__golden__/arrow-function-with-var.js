indicator('Arrow Function with Variable', { overlay: false });
function f() {
    var result = 1;
    return result;
}
var y = f();
plot(y, 'Result', { color: color.blue });