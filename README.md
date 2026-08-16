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

## Testing

The suite runs on [Vitest](https://vitest.dev/) and exercises the compiled
output in `out/`, so it needs a build first:

```bash
npm ci
npm run langium:generate
npm run build
npm test
```

What it covers, in `test/`:

- **`lexer.test.ts`** — the indentation machinery, which is the part most likely
  to break. INDENT/DEDENT synthesis, nested blocks, dedenting several levels at
  once, closing an open block at end of input, tabs scored as four spaces, CRLF,
  comments and blank lines, and indentation that does not line up with any open
  block.
- **`parser.test.ts`** — declarations, `:=` reassignment, tuple destructuring,
  if/else and nested if, `for ... to` / `for ... in` / `while`, both function
  body forms with default parameters, calls with positional and named
  arguments, qualified names like `ta.ema`, subscripts, ternaries and literals.
- **`transpiler.test.ts`** — the three transformations that define the project:
  indentation becomes braces, `:=` becomes `=`, and a block-bodied `f(x) =>`
  gets an explicit `return` of its final expression. Plus assertions on the
  ESTree intermediate representation itself.
- **`validator.test.ts`** — built-in function checking from
  `src/language/built-ins/`: unknown functions, missing required arguments,
  unknown named arguments, and the naming-convention diagnostics.
- **`golden.test.ts`** — every program under `examples/` is transpiled and
  compared against a committed expectation in `test/__golden__/`. Regenerate
  after an intentional change with `npx vitest run -u`.
- **`cli.test.ts`** — the command line entry point as a subprocess, run against
  copies in a temporary directory so nothing leaks between runs.

**The known bugs are pinned, not hidden.** `test/known-bugs.test.ts` states what
each defect *should* do and marks it `it.fails`, so those tests go red the day
someone fixes the bug. The example programs the compiler cannot handle are
listed by name and reason in `golden.test.ts` and reported as skipped rather
than blessed with a wrong expectation. A run currently reports 216 passing and
45 skipped; the skipped ones are that list plus the empty-array case, which
cannot be executed at all because it does not terminate.

## Status and limitations

This is a working prototype, not a finished product. Known gaps, honestly
stated:

- **`else if` collapses onto its parent.** `ElseIfClause` is an unassigned rule
  call in the grammar, so the else-if overwrites the outer condition and branch
  instead of nesting under them; the first branch disappears.
- **`switch` does not parse.** The rules exist but are unreachable from
  statement position, and the statement is silently dropped from the output.
- **A statement on the line straight after an indented block does not parse.**
  A blank line supplies the separator the grammar wants, which is why every
  working example has one.
- **Array support is experimental.** Non-empty literals and code generation
  work. An empty literal (`[]`) sends the parser into a loop that never
  terminates, and subscript assignment (`a[0] := x`) does not parse.
- **The `<` operator** was historically in conflict with template
  specifications. The custom token builder resolves it, and `test/parser.test.ts`
  covers `<` in while and if conditions, assignments and call arguments to keep
  it that way.
- **The library entry point ignores parse errors.**
  `transpilePineToJavascript` builds the document without validation, so callers
  get partial JavaScript with no signal that input was dropped. Use the language
  services directly if diagnostics matter.
- Coverage of PineScript's standard library is partial — the runtime shim
  implements the commonly used indicators, not the full surface.

Each of these is pinned by a test; see [Testing](#testing).

## License

MIT — see [LICENSE](LICENSE).

Not affiliated with or endorsed by TradingView. PineScript is TradingView's
language; this is an independent reimplementation of a parser and compiler for
it.
