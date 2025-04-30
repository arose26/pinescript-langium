function testFunc(a, b) {
    a + b;
}
function testArray() {
    [
        1,
        2,
        3
    ];
}
function testIfElse(a, b) {
    if (a > b) {
        a + b;
    } else {
        a - b;
    }
}
var result1 = testFunc(10, 20);
var result2 = testArray();
var result3 = testIfElse(10, 20);