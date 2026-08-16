var x = 0;
var y = 10;
while (x < 10) {
    x = x + 1;
    if (x % 2 == 0) {
        y = y + x;
    } else {
        y = y - 1;
        if (y < 5) {
            break;
        }
    }
}