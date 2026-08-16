indicator('Arrow Function with If Simple', { overlay: false });
function f() {
    if (true) {
        return 1;
    } else {
        return 0;
    }
}
var y = f();
plot(y, 'Result', { color: color.blue });