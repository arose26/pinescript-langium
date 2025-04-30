var x = 10;
var y = 20;
if (x > y) {
    x = 30;
} else if (x == y) {
    x = 40;
} else {
    x = 50;
}
function test(a, b) {
    if (a > b) {
        a + b;
    } else if (a == b) {
        a * b;
    } else {
        a - b;
    }
}
var result = test(x, y);