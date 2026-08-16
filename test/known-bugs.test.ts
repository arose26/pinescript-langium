import { describe, expect, it } from 'vitest';
import { parseErrors, toJs } from './helpers.js';

/**
 * Defects that are real and reproducible today.
 *
 * Each test states what the compiler *should* do and is marked `it.fails`, so
 * the suite stays green while the bug exists and turns red the moment someone
 * fixes it — at which point the marker comes off and the test becomes a normal
 * regression test. The one exception is the empty-array case, which hangs the
 * parser and therefore has to be `it.skip`; running it would never return.
 */

describe('known bug: else-if drops the outer branch', () => {
    // ElseIfClause is an unassigned rule call in pine-script.langium, so the
    // else-if overwrites `condition` and `thenBlock` on its parent IfStructure
    // instead of nesting under it. The first branch disappears entirely.
    it.fails('should keep all three branches of an if / else if / else chain', async () => {
        const source = 'var a = 2\nif a > 3\n    a := 1\nelse if a > 1\n    a := 2\nelse\n    a := 3\n';
        expect(await toJs(source)).toContain('if (a > 3)');
    });

    it('currently collapses to the else-if condition only (pinned)', async () => {
        const source = 'var a = 2\nif a > 3\n    a := 1\nelse if a > 1\n    a := 2\nelse\n    a := 3\n';
        expect(await toJs(source)).toBe(
            'var a = 2;\nif (a > 1) {\n    a = 2;\n} else {\n    a = 3;\n}'
        );
    });
});

describe('known bug: switch does not parse', () => {
    it.fails('should parse a switch with pattern cases', async () => {
        expect(await parseErrors('var x = 2\nswitch x\n    1 -> x := 10\n    2 -> x := 20\n')).toEqual([]);
    });

    it.fails('should parse a switch with a default case', async () => {
        expect(await parseErrors('var x = 2\nswitch x\n    1 -> x := 10\n    -> x := 0\n')).toEqual([]);
    });

    it('currently rejects switch at statement position (pinned)', async () => {
        const errors = await parseErrors('var x = 2\nswitch x\n    1 -> x := 10\n');
        expect(errors).toContain('Expecting end of file but found `switch`.');
    });

    it('drops the switch from the generated JavaScript (pinned)', async () => {
        // Worse than the parse error: transpilePineToJavascript does not run
        // validation, so the unparsed tail is silently discarded.
        expect(await toJs('var x = 2\nswitch x\n    1 -> x := 10\n')).toBe('var x = 2;');
    });
});

describe('known bug: array literals', () => {
    // README calls array support experimental. The specific failure is the
    // empty literal: `[]` sends the parser into a loop that never terminates,
    // so this case can only be described, never executed.
    it.skip('should parse an empty array literal (hangs the parser - do not enable)', async () => {
        expect(await parseErrors('var e = []\n')).toEqual([]);
    });

    it.fails('should allow subscript assignment into an array', async () => {
        expect(await parseErrors('var a = [1, 2]\na[0] := 10\n')).toEqual([]);
    });

    it('currently rejects subscript assignment (pinned)', async () => {
        const errors = await parseErrors('var a = [1, 2]\na[0] := 10\n');
        expect(errors.join(' ')).toContain("Expecting token of type 'LSQB' but found `:=`");
    });

    it('handles non-empty array literals correctly', async () => {
        expect(await toJs('var a = [1, 2]\n')).toBe('var a = [\n    1,\n    2\n];');
    });
});

describe('known bug: a statement directly after a block does not parse', () => {
    // Statements requires a NEWLINE between two statements, but the newline
    // that ended the block was consumed inside it. A blank line supplies the
    // missing separator, which is why every example file that works has one.
    it.fails('should accept a top-level statement on the line after a block', async () => {
        expect(await parseErrors('var a = 2\nif a > 1\n    a := 1\nvar z = 9\n')).toEqual([]);
    });

    it('currently needs a blank line as a separator (pinned)', async () => {
        expect(await parseErrors('var a = 2\nif a > 1\n    a := 1\nvar z = 9\n'))
            .toContain('Expecting end of file but found `var`.');
        expect(await parseErrors('var a = 2\nif a > 1\n    a := 1\n\nvar z = 9\n')).toEqual([]);
    });
});

describe('known bug: blank and comment-only lines inside a block', () => {
    it.fails('should ignore a blank line inside a block', async () => {
        expect(await parseErrors('var a = 2\nif a > 1\n    a := 1\n\n    a := 2\n')).toEqual([]);
    });

    it.fails('should ignore a comment-only line inside a block', async () => {
        expect(await parseErrors('var a = 2\nif a > 1\n    // note\n    a := 1\n')).toEqual([]);
    });
});

describe('known bug: statements dropped by the converter', () => {
    it.fails('should emit a compound assignment for +=', async () => {
        expect(await toJs('var a = 1\na += 2\n')).toBe('var a = 1;\na += 2;');
    });

    it('currently emits an empty statement for += (pinned)', async () => {
        expect(await toJs('var a = 1\na += 2\n')).toBe('var a = 1;\n;');
    });

    it.fails('should emit something for an import statement', async () => {
        expect(await toJs('import foo/bar/1 as baz\n')).not.toBe(';');
    });

    it.fails('should use the declared iterator name in a for ... in loop', async () => {
        expect(await toJs('for myVar in xs\n    y := myVar\n')).toContain('for (const myVar of xs)');
    });

    it('currently hard-codes the for ... in iterator as i (pinned)', async () => {
        expect(await toJs('for myVar in xs\n    y := myVar\n')).toContain('for (const i of xs)');
    });
});

describe('known limitation: the library entry point ignores parse errors', () => {
    it('transpiles unparseable input without reporting anything', async () => {
        // transpilePineToJavascript builds the document without validation, so
        // document.diagnostics is empty and the null-on-error branch is dead.
        // Callers get partial JavaScript with no signal that input was dropped.
        const source = 'var a = 1\nswitch a\n    1 -> a := 2\n';
        expect((await parseErrors(source)).length).toBeGreaterThan(0);
        await expect(toJs(source)).resolves.toBe('var a = 1;');
    });
});
