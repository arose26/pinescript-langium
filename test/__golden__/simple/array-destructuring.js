var [a, b] = [
    1,
    2
];
var [middle, upper, lower] = ta.bb(close, 20, 2);
var [haclose, haopen] = request.security(ticker.heikinashi(syminfo.tickerid), '', [
    close,
    open
]);
var result = middle + (upper - lower);