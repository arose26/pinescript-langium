indicator('Simple Comparison Test');
var a = 5;
var b = 10;
var isEqual = a == b;
var isNotEqual = a != b;
var isGreaterThan = a > b;
var isLessThanEqual = a <= b;
var isGreaterThanEqual = a >= b;
plot(1, 'Result', { color: color.blue });