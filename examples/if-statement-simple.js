indicator('If Statement Simple', { overlay: false });
var x = 10;
var result = 0;
if (x > 5) {
    result = x * 2;
} else {
    result = x;
}
plot(result, 'Result', { color: color.blue });