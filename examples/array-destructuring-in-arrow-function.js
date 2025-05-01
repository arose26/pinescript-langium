indicator('Array Destructuring in Arrow Function', { overlay: false });
function myFunc() {
    var [a, b, c] = [
        1,
        2,
        3
    ];
    return a + b + c;
}
var result = myFunc();
plot(result, 'Result', { color: color.blue });