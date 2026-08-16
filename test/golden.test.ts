import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { toJs } from './helpers.js';

/**
 * One golden-file test per example program: transpile it and compare the
 * generated JavaScript against a committed expectation in `test/__golden__/`.
 * Regenerate after an intentional change with `npx vitest run -u`.
 *
 * Every expectation in `__golden__/` was reviewed before being committed. Files
 * whose current output is wrong are not blessed; they are listed in
 * UNSUPPORTED below with the reason and skipped, so the gaps are visible in the
 * test report rather than frozen into an expectation that says the compiler is
 * behaving.
 */
const examplesDir = fileURLToPath(new URL('../examples/', import.meta.url));

/** Example programs the compiler cannot handle today, with the reason. */
const UNSUPPORTED: Record<string, string> = {
    // The grammar has three overlapping rules for `name(args) =>`. A block body
    // containing a for loop or an if statement trips the ambiguity and the
    // parser bails at the arrow.
    'arrow-function-block-example.pine': 'arrow-function grammar conflict',
    'arrow-function-with-if-var-simple.pine': 'arrow-function grammar conflict',
    'arrow-function-with-if-var.pine': 'arrow-function grammar conflict',
    'arrow-function-with-if.pine': 'arrow-function grammar conflict',
    'bull-divergence-function.pine': 'arrow-function grammar conflict',
    'combined-function-with-for.pine': 'arrow-function grammar conflict',
    'complex-arrow-function-with-for-loop.pine': 'arrow-function grammar conflict',
    'complex-arrow-function-with-if.pine': 'arrow-function grammar conflict',
    'complex-arrow-function.pine': 'arrow-function grammar conflict',
    'complex/function.pine': 'arrow-function grammar conflict',
    'for-loop-function-2.pine': 'arrow-function grammar conflict',
    'for-loop-function-3.pine': 'arrow-function grammar conflict',
    'for-loop-function-4.pine': 'arrow-function grammar conflict',
    'for-loop-function.pine': 'arrow-function grammar conflict',
    'for-loop-to.pine': 'arrow-function grammar conflict',
    'function-with-conditional.pine': 'arrow-function grammar conflict',
    'function-with-if-direct.pine': 'arrow-function grammar conflict',
    'function-with-nested-if.pine': 'arrow-function grammar conflict',
    'minimal-function-with-for-2.pine': 'arrow-function grammar conflict',
    'minimal-function-with-for-loop.pine': 'arrow-function grammar conflict',
    'minimal-function-with-for.pine': 'arrow-function grammar conflict',
    'simple-for-loop-function.pine': 'arrow-function grammar conflict',
    'simple-function-with-for-loop-2.pine': 'arrow-function grammar conflict',
    'simple-function-with-for-loop-3.pine': 'arrow-function grammar conflict',
    'simple-function-with-for-loop-4.pine': 'arrow-function grammar conflict',
    'simple-function-with-for-loop.pine': 'arrow-function grammar conflict',
    'simple/arrow-functions.pine': 'arrow-function grammar conflict',
    'simple/variable-reassignment.pine': 'arrow-function grammar conflict',

    // switch is in the grammar but unreachable from statement position; see
    // known-bugs.test.ts.
    'complex/switch.pine': 'switch does not parse',
    'simple/switch-complex.pine': 'switch does not parse',
    'simple/switch-simple.pine': 'switch does not parse',
    'simple/switch.pine': 'switch does not parse',
    'simple/switch-default.pine': 'switch with only a default case does not parse',
    'simple/switch-multi.pine': 'switch cases written with `=>`, grammar expects `->`',
    'simple/switch-no-expr.pine': 'switch cases written with `=>`, grammar expects `->`',
    'simple/switch-test.pine': 'switch cases written with `=>`, grammar expects `->`',

    // Array gaps.
    'simple/array.pine': 'empty array literal `[]` sends the parser into a loop',
    'simple/array-methods.pine': 'empty array literal `[]` sends the parser into a loop',
    'simple/array-modify.pine': 'subscript assignment `a[0] := x` does not parse',

    // One-off gaps.
    'complex-test.pine': '`method f(args)` block form without `=>` does not parse',
    'indentation-test.pine': 'multi-line string literals and switch do not parse',
    'simple/input-functions.pine': 'an argument list wrapped across lines does not parse',
    'simple/module-system.pine': '`import ns/name` without a version number does not parse',
    'simple/while-lt-special.pine': 'the file itself is deliberately invalid PineScript (`while x 5`)'
};

const examples = readdirSync(examplesDir, { recursive: true, encoding: 'utf8' })
    .map(name => name.split('\\').join('/'))
    .filter(name => name.endsWith('.pine'))
    .sort();

describe('golden files: examples/**/*.pine', () => {
    it('found the example programs', () => {
        expect(examples.length).toBeGreaterThan(100);
    });

    for (const name of examples) {
        const reason = UNSUPPORTED[name];
        if (reason) {
            it.skip(`${name} (unsupported: ${reason})`, () => { /* pinned above */ });
            continue;
        }
        it(name, async () => {
            const source = readFileSync(resolve(examplesDir, name), 'utf8');
            const generated = await toJs(source);
            await expect(generated).toMatchFileSnapshot(
                fileURLToPath(new URL(`./__golden__/${name.replace(/\.pine$/, '.js')}`, import.meta.url))
            );
        });
    }
});
