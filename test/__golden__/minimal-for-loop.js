indicator('Minimal For Loop', { overlay: false });
var sum = 0;
for (let i = 1; i <= 5; i++) {
    sum = sum + i;
}
plot(sum, 'Sum', { color: color.blue });