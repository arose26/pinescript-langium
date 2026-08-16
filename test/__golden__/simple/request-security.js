var securityData = request.security(syminfo.tickerid, 'D', close);
var [haclose, haopen] = request.security(ticker.heikinashi(syminfo.tickerid), 'D', [
    close,
    open
]);
var dailyClose = request.security(syminfo.tickerid, 'D', close);
var weeklyClose = request.security(syminfo.tickerid, 'W', close);
var monthlyClose = request.security(syminfo.tickerid, 'M', close);
var dailyRSI = request.security(syminfo.tickerid, 'D', ta.rsi(close, 14));
var btcData = request.security('BINANCE:BTCUSDT', 'D', close);
var spyData = request.security('NYSE:SPY', 'D', close);
var heikinashi = ticker.heikinashi(syminfo.tickerid);
var modified = ticker.modify(syminfo.tickerid, 'SESSION', '1300-2000');
var ratio = close / dailyClose;
var signal = dailyRSI > 70 ? -1 : dailyRSI < 30 ? 1 : 0;