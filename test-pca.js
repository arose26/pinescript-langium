var source = close;
function test(a, b) {
    a > b ? a : b;
}
function getArray() {
    [
        1,
        2,
        3
    ];
}
function testIfElse(a, b) {
    if (a > b) {
        a + b;
    } else if (a == b) {
        a * b;
    } else {
        a - b;
    }
}
var result = test(10, 20);
var arr = getArray();
var ifResult = testIfElse(10, 20);