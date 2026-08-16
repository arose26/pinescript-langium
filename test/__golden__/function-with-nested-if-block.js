indicator('Function with Nested If Block', { overlay: false });
function f(x = 10, y = 5) {
    if (x > 5) {
        if (y > 3) {
            return x * y;
        } else {
            return x + y;
        }
    } else {
        return x - y;
    }
}
var a = f(10, 5);
var b = f(10, 2);
var c = f(3, 5);
plot(a, 'Result A', { color: color.blue });
plot(b, 'Result B', { color: color.red });
plot(c, 'Result C', { color: color.green });