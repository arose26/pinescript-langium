// The token builder and the ESTree converter both trace every token and every
// AST node to console.log/console.warn. That is useful when debugging a single
// file by hand and unreadable across a whole test run, so it is muted here.
// console.error is left alone: the transpiler reports real failures through it.
console.log = () => { /* muted */ };
console.warn = () => { /* muted */ };
