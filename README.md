# pinescript-langium

A parser, language server, and **PineScript → JavaScript transpiler**, built on
[Langium](https://langium.org/). It takes TradingView's PineScript — an
indentation-sensitive language with no public grammar — and compiles it to
runnable JavaScript through a standard ESTree intermediate representation.

```pine
var a = 1
var b = 2
var c = a + b

if c > 2
    c := c + 1
else
    c := c - 1

f(x) =>
    y = x * 2
    y + 1

var result = f(c)
```

compiles to:

```js
var a = 1;
var b = 2;
var c = a + b;
if (c > 2) {
    c = c + 1;
} else {
    c = c - 1;
}
function f(x) {
    var y = x * 2;
    return y + 1;
}
var result = f(c);
```

Note what that involves: indentation became braces, PineScript's `:=`
reassignment became `=`, and `f(x) =>` — a block-bodied function whose final
expression is its return value — became a real JavaScript function with an
explicit `return`.

## Why this is not a toy

**Indentation-sensitive parsing on a token-stream parser.** PineScript uses
significant whitespace like Python, but Langium sits on Chevrotain, which
parses a flat token stream. Making that work needs a custom token builder that
synthesizes `INDENT`/`DEDENT` tokens from column positions, plus a lexer that
tracks the indentation stack across nested blocks
(`src/language/pine-script-token-builder.ts`, `pine-script-lexer.ts`). This is
the part that makes or breaks the project, and it is where most of the
difficulty lives.

**ESTree as the intermediate representation.** The transpiler does not emit
JavaScript strings. It converts the Langium AST into a standard
[ESTree](https://github.com/estree/estree) tree
(`src/cli/estree-converter.ts`) and hands that to `escodegen`. Going through a
real AST means operator precedence, parenthesization, and formatting are
handled by tooling that already knows the language, and it makes the output
composable with the rest of the JavaScript ecosystem.

**A runtime shim for the standard library.** PineScript programs call
built-ins — `ta.ema`, `ta.sma`, `ta.bb`, `ta.stoch`, `request.security`,
`input.*` — that have no JavaScript equivalent. The generated output is
prefixed with an implementation of those functions
(`src/runtime/`), so the emitted code runs standalone.

**Editor tooling, not just a compiler.** The Langium grammar drives a language
server and a VS Code extension (`src/extension/`, `src/language-server/`),
including validation of built-in function usage
(`src/language/built-ins/`). A TextMate grammar for syntax highlighting is
generated from the same source of truth as the parser.

## Architecture

```
.pine source
   │
   ├─ pine-script-token-builder.ts   custom INDENT/DEDENT synthesis
   ├─ pine-script.langium            grammar (also: ANTLR .g4 grammars)
   │
   ▼
Langium AST ──► estree-converter.ts ──► ESTree ──► escodegen ──► .js
   │
   ├─► pine-script-validator.ts      diagnostics
   └─► language server / VS Code extension
```

## Build and run

The generated parser is not checked in; it is produced from the grammar, so
**`langium:generate` must run before the first build**:

```bash
npm ci
npm run langium:generate
npm run build
```

Transpile a file:

```bash
node out/cli/estree-cli.js examples/simple/test-estree-simple.pine
```

That writes `<name>.estree.json` (the intermediate tree) and `<name>.js` (the
generated JavaScript) next to the input. The `examples/` directory has further
cases covering indentation, namespaces, switch statements, and arrays.

Verified on Node 26 with the committed lockfile. Use `npm ci` rather than
`npm install` — resolving the dependency ranges freshly can pull a Langium
version whose API this code does not target.

## Status and limitations

This is a working prototype, not a finished product. Known gaps, honestly
stated:

- **The `<` operator has a parsing conflict.** Workarounds: reverse the
  comparison (`5 > x`) or negate (`not (x >= 5)`).
- **Array support is experimental.** Code generation works; parsing array
  literals fails in some contexts.
- **No automated test suite.** Correctness is currently demonstrated by the
  example programs under `examples/`, checked by hand. This is the most
  valuable next contribution.
- Coverage of PineScript's standard library is partial — the runtime shim
  implements the commonly used indicators, not the full surface.

## License

MIT — see [LICENSE](LICENSE).

Not affiliated with or endorsed by TradingView. PineScript is TradingView's
language; this is an independent reimplementation of a parser and compiler for
it.
