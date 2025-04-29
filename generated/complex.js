
        // This file was generated from complex.pine
        
        function add(a, b) {
                a + b;
            }
function factorial(n) {
                if (n <= 1) {
                1;
            } else {
                n * factorial(n - 1);
            }
            }
let x = 5;
let result = factorial(x);
let sum = 0;
for (let i = 1; i <= x; i += 1) {
                sum = sum + add(i, i);
            }
if (sum > 20) {
                sum = 20;
            } else {
                sum = sum + 5;
            }
    