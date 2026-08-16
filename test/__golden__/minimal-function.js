indicator('Minimal Function', { overlay: false });
function f() {
    return 42;
}
var result = f();
plot(result, 'Result', { color: color.blue });