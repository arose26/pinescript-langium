function testArrayLiteral() {
    [
        1,
        2,
        3
    ];
}
function testArrayExpressions() {
    [
        1 + 2,
        3 * 4,
        5 / 2
    ];
}
function testArrayReturn() {
    var a = 1;
    var b = 2;
    [
        a,
        b,
        a + b
    ];
}
var result1 = testArrayLiteral();
var result2 = testArrayExpressions();
var result3 = testArrayReturn();