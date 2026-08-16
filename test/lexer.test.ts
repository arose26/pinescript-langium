import { describe, expect, it } from 'vitest';
import { lexerErrors, parseErrors, tokenNames } from './helpers.js';

/**
 * PineScript is indentation sensitive; Chevrotain is not. The custom token
 * builder turns column positions into synthetic INDENT/DEDENT tokens, and this
 * is the part of the project most likely to break. These tests assert on the
 * raw token stream rather than on parse results so a regression points at the
 * lexer directly.
 */
describe('indentation: INDENT/DEDENT synthesis', () => {
    it('emits no INDENT for a flat script', () => {
        const tokens = tokenNames('a = 1\nb = 2\n');
        expect(tokens).not.toContain('INDENT');
        expect(tokens).not.toContain('DEDENT');
    });

    it('wraps an indented block in INDENT ... DEDENT', () => {
        expect(tokenNames('if a\n    b = 1\n')).toEqual([
            'if', 'NAME', 'NEWLINE',
            'INDENT', 'NAME', '=', 'NUMBER', 'NEWLINE',
            'DEDENT'
        ]);
    });

    it('nests one INDENT per level', () => {
        const tokens = tokenNames('if a\n    if b\n        c = 1\n');
        expect(tokens.filter(t => t === 'INDENT')).toHaveLength(2);
        expect(tokens.filter(t => t === 'DEDENT')).toHaveLength(2);
    });

    it('closes both levels when dedenting from a nested block to column zero', () => {
        const tokens = tokenNames('if a\n    if b\n        c = 1\nd = 2\n');
        // The two DEDENTs must arrive back to back, before the top-level statement.
        const firstDedent = tokens.indexOf('DEDENT');
        expect(tokens[firstDedent + 1]).toBe('DEDENT');
        expect(tokens.slice(firstDedent + 2)).toEqual(['NAME', '=', 'NUMBER', 'NEWLINE']);
    });

    it('closes an open block at end of input even without a trailing newline', () => {
        expect(tokenNames('if a\n    b = 1')).toEqual([
            'if', 'NAME', 'NEWLINE',
            'INDENT', 'NAME', '=', 'NUMBER',
            'DEDENT'
        ]);
    });

    it('produces no lexer errors for a deeply nested script', () => {
        expect(lexerErrors('if a\n    if b\n        if c\n            d = 1\n')).toEqual([]);
    });
});

describe('indentation: tabs and spaces', () => {
    it('accepts a tab-indented block', () => {
        expect(tokenNames('if a\n\tb = 1\n')).toContain('INDENT');
    });

    it('nests tab-indented blocks', () => {
        const tokens = tokenNames('if a\n\tif b\n\t\tc = 1\n');
        expect(tokens.filter(t => t === 'INDENT')).toHaveLength(2);
        expect(tokens.filter(t => t === 'DEDENT')).toHaveLength(2);
    });

    it('treats one tab as four spaces, so the two are the same level', () => {
        // calculateIndentationLevel() in pine-script-token-builder.ts scores a
        // tab as 4. Four spaces then one tab must therefore stay in one block.
        const tokens = tokenNames('if a\n    b = 1\n\tc = 2\n');
        expect(tokens.filter(t => t === 'INDENT')).toHaveLength(1);
        expect(tokens.filter(t => t === 'DEDENT')).toHaveLength(1);
    });

    it('handles CRLF line endings the same as LF', () => {
        expect(tokenNames('if a\r\n    b = 1\r\n')).toEqual(tokenNames('if a\n    b = 1\n'));
    });
});

describe('indentation: comments and blank lines', () => {
    it('keeps a comment-only line inside its block', () => {
        const tokens = tokenNames('if a\n    // note\n    b = 1\n');
        expect(tokens.filter(t => t === 'INDENT')).toHaveLength(1);
        expect(tokens).toContain('COMMENT');
    });

    it('keeps a trailing comment inside its block', async () => {
        expect(await parseErrors('var a = 2\nif a > 1\n    a := 1 // note\n')).toEqual([]);
    });

    it('does not indent inside parentheses', () => {
        // ignoreIndentationDelimiters keeps a wrapped argument list out of the
        // indentation stack.
        const tokens = tokenNames('x = f(1,\n  2)\n');
        expect(tokens).not.toContain('INDENT');
    });

    it('closes and reopens the block around a blank line (known limitation)', () => {
        // A blank line inside a block emits DEDENT ... INDENT rather than being
        // ignored. See the parser-level consequence in known-bugs.test.ts.
        expect(tokenNames('if a\n    b = 1\n\n    c = 2\n')).toEqual([
            'if', 'NAME', 'NEWLINE',
            'INDENT', 'NAME', '=', 'NUMBER', 'NEWLINE',
            'DEDENT', 'NEWLINE',
            'INDENT', 'NAME', '=', 'NUMBER', 'NEWLINE',
            'DEDENT'
        ]);
    });
});

describe('indentation: inconsistent indentation', () => {
    it('does not report a lexer error for a dedent to an unopened level', () => {
        // 8 spaces then 4 spaces never matches an entry on the indentation
        // stack. Python would raise IndentationError; this lexer stays silent
        // and folds both lines into the same block.
        const source = 'if a\n        b = 1\n    c = 2\n';
        expect(lexerErrors(source)).toEqual([]);
        expect(tokenNames(source).filter(t => t === 'INDENT')).toHaveLength(1);
        expect(tokenNames(source).filter(t => t === 'DEDENT')).toHaveLength(1);
    });

    it('accepts an under-indented continuation line without complaint', async () => {
        expect(await parseErrors('var a = 2\nif a > 1\n    a := 1\n  a := 2\n')).toEqual([]);
    });
});
