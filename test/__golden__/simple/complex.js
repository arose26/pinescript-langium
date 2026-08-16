function add(a, b) {
    return a + b;
}
function factorial(n) {
    if (n <= 1) {
        return 1;
    } else {
        return n * factorial(n - 1);
    }
}
var x = 5;
var result = factorial(x);
var sum = 0;
for (let i = 1; i <= x; i++) {
    sum = sum + add(i, i);
}
if (sum > 20) {
    sum = 20;
} else {
    sum = sum + 5;
}