indicator('Complex Function', { overlay: false });
function complexFunc(x = 10, y = 5, z = 2) {
    var result = 0;
    var multiplier = 1;
    if (x > 5) {
        multiplier = 2;
        if (y > 3) {
            if (z > 1) {
                return result = x * y * z * multiplier;
            } else {
                return result = x * y * multiplier;
            }
        } else {
            return result = x + y * multiplier;
        }
    } else {
        multiplier = 0.5;
        return result = (x - y) * multiplier;
    }
    return result;
}
var a = complexFunc(10, 5, 2);
var b = complexFunc(10, 2, 3);
var c = complexFunc(3, 5, 1);
plot(a, 'Result A', { color: color.blue });
plot(b, 'Result B', { color: color.red });
plot(c, 'Result C', { color: color.green });