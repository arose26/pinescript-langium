function testNamedArgs() {
    plot(close, 'Close', {
        color: 'red',
        linewidth: 2
    });
}
testNamedArgs();