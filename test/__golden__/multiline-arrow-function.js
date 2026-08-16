indicator('Multiline Arrow Function', { overlay: false });
function f() {
    var a = 1;
    var b = 2;
    return a + b;
}
var y = f();
plot(y, 'Result', { color: color.blue });