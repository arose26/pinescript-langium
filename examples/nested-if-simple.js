indicator('Nested If Simple', { overlay: false });
var x = 10;
var y = 5;
var result = 0;
if (x > 5) {
    if (y > 3) {
        result = x * y;
    } else {
        result = x + y;
    }
} else {
    result = x - y;
}
plot(result, 'Result', { color: color.blue });