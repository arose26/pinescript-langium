var result = condition ? valueIfTrue : valueIfFalse;
var upper = ta.ema(ta.change(source) <= 0 ? 0 : stddev, lengthEma);
var lower = ta.ema(ta.change(source) > 0 ? 0 : stddev, lengthEma);
var color = price > prevPrice ? price > highestPrice ? color.green : color.blue : price < lowestPrice ? color.red : color.yellow;
var index = condition ? 0 : 1;
var value = array[index];
plot({
    series: close,
    title: 'Close',
    color: close > open ? color.green : color.red
});
var signal = rsi > 70 && price > sma ? 1 : rsi < 30 && price < sma ? -1 : 0;