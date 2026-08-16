indicator('Namespace Test', { overlay: true });
var sma = ta.sma(close, 14);
var ema = ta.ema(close, 14);
var maxValue = math.max(high, open);
var minValue = math.min(low, close);
var period = input.int(14, 'SMA Period', {
    minval: 1,
    maxval: 500
});
var sourceInput = input.source(close, 'Source');
var transparentRed = color.new(color.red, 70);
var customColor = color.rgb(255, 128, 0);
var result = sma + ema;
var diff = maxValue - minValue;
plot(sma, 'SMA', { color: color.blue });
plot(ema, 'EMA', { color: color.red });