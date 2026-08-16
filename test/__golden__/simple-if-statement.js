indicator('Simple If Statement', { overlay: false });
var x = 10;
var result = 0;
if (x > 5) {
    result = 1;
}
plot(result, 'Result', { color: color.blue });