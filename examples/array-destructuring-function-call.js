indicator('Array Destructuring Function Call', { overlay: false });
function bbMethod(length, mult) {
    var [middle, upper, lower] = ta.bb(close, length, mult);
    return (close - lower) / (upper - lower) * 100;
}
var result = bbMethod(20, 2);
plot(result, 'Result', { color: color.blue });