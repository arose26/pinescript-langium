indicator('Deeply Nested If Statements', { overlay: false });
function complexCondition(a, b, c, d) {
    var result = 0;
    if (a > 5) {
        if (b > 3) {
            if (c > 2) {
                if (d > 0) {
                    return result = a * b * c * d;
                } else {
                    return result = a * b * c;
                }
            } else {
                if (d > 0) {
                    return result = a * b + d;
                } else {
                    return result = a * b;
                }
            }
        } else {
            if (c > 2) {
                return result = a + c;
            } else {
                return result = a;
            }
        }
    } else {
        if (b > 3) {
            return result = b;
        } else {
            return result = 0;
        }
    }
    return result;
}
var r1 = complexCondition(10, 5, 3, 1);
var r2 = complexCondition(10, 5, 3, 0);
var r3 = complexCondition(10, 5, 1, 1);
var r4 = complexCondition(10, 2, 3, 1);
var r5 = complexCondition(3, 5, 3, 1);
plot(r1, 'All True', { color: color.green });
plot(r2, 'Three True', { color: color.blue });
plot(r3, 'Mixed 1', { color: color.red });
plot(r4, 'Mixed 2', { color: color.yellow });
plot(r5, 'First False', { color: color.purple });