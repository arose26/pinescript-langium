indicator('Simple For Loop', { overlay: false });
var sum = 0;
for (let i = 1; i <= 10; i++) {
    sum = sum + i;
}
plot(sum, 'Sum', { color: color.blue });