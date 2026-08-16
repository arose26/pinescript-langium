indicator('Minimal Arrow Function', { overlay: false });
function f() {
    return 1;
}
var y = f();
plot(y, 'Result', { color: color.blue });