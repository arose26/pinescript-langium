indicator('Arrow Function Example', { overlay: false });
function MaxMinNz(value, max = 100, min = 0, def = 50) {
    return nz(math.max(math.min(value, max), min), def);
}
var value = 75;
var result = MaxMinNz(value);
plot(result, 'Result', { color: color.blue });