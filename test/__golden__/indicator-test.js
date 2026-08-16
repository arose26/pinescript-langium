indicator('My Indicator', { overlay: true });
var sma = ta.sma(close, 14);
plot(sma, 'SMA', { color: color.blue });