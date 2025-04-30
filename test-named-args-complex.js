function testMixedArgs() {
    plot(close, 'Close', {
        color: 'red',
        linewidth: 2,
        style: plot.style_line
    });
}
function testNestedArgs() {
    plot(ta.sma(close, { length: 20 }), 'SMA', {
        color: 'blue',
        linewidth: 2
    });
}
function testMethodArgs() {
    array.push(myArray, {
        value: 42,
        index: 0
    });
}
testMixedArgs();
testNestedArgs();
testMethodArgs();