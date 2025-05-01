indicator('Arrow Function with If Simple', { overlay: false });
function f() {
    if (true) {
        1;
    } else {
        0;
    }
}
var y = f();
plot(y, 'Result', { color: color.blue });