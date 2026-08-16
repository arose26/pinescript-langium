var [middle, upper, lower] = ta.bb(close, 20, 2);
stc = math.max(math.min(stc, 100), 0);
var upper = ta.ema(ta.change(close) <= 0 ? 0 : stddev, 14);
var [haclose, haopen] = request.security(ticker.heikinashi(syminfo.tickerid), '', [
    close,
    open
]);
var source = input.source({
    defval: close,
    title: 'Source',
    group: 'General Settings'
});
var isDiv = 0;
var confirmOffset = true ? 1 : 0;
var LL = indicator[0 + confirmOffset];
if (isPL(indicator, { right: confirmOffset }) && indicator < 50) {
    for (let i = 1 + confirmOffset; i <= 100 + confirmOffset; i++) {
        if (LL > indicator[i] && indicator[i] < indicator[i + 1]) {
            LL = indicator[i];
            if (price[i] > price[confirmOffset] && ta.lowestbars(price, i) < 3) {
                isDiv = i;
            }
        }
    }
}