import { describe, expect, it } from 'vitest';
import { parse, parseErrors } from './helpers.js';

const statements = (document: any) => document.parseResult.value.statements?.statements ?? [];

describe('parser: declarations and assignment', () => {
    it('parses a var declaration', async () => {
        const document = await parse('var a = 1\n');
        expect(await parseErrors('var a = 1\n')).toEqual([]);
        expect(statements(document)[0].$type).toBe('SimpleNameInitialization');
    });

    it('parses a declaration without the var keyword', async () => {
        expect(await parseErrors('a = 1\n')).toEqual([]);
    });

    it('parses varip', async () => {
        const document = await parse('varip a = 1\n');
        expect(statements(document)[0].declaration.mode).toBe('varip');
    });

    it('parses := reassignment as a distinct node type', async () => {
        const document = await parse('var a = 1\na := 2\n');
        expect(statements(document)[1].$type).toBe('SimpleReassignment');
    });

    it('parses tuple destructuring', async () => {
        const document = await parse('[a, b] = f()\n');
        const statement = statements(document)[0];
        expect(statement.$type).toBe('ArrayDestructuring');
        expect(statement.declaration.elements).toEqual(['a', 'b']);
    });

    it('accepts a version annotation, but does not capture it', async () => {
        // VERSION_ANNOTATION and COMMENT both match `//@version=5` and COMMENT
        // wins, so StartScript.version is never populated. Harmless in
        // practice — the annotation carries no semantics for the transpiler —
        // but worth pinning so a grammar change does not go unnoticed.
        const document = await parse('//@version=5\nvar a = 1\n');
        expect(await parseErrors('//@version=5\nvar a = 1\n')).toEqual([]);
        expect((document.parseResult.value as any).version).toBeUndefined();
    });

    it('parses an empty document', async () => {
        expect(await parseErrors('')).toEqual([]);
    });
});

describe('parser: control flow', () => {
    it('parses if with an indented block', async () => {
        expect(await parseErrors('var a = 1\nif a > 0\n    a := 2\n')).toEqual([]);
    });

    it('parses if with a parenthesised condition', async () => {
        expect(await parseErrors('var a = 1\nif (a > 0)\n    a := 2\n')).toEqual([]);
    });

    it('parses if/else', async () => {
        expect(await parseErrors('var a = 1\nif a > 0\n    a := 2\nelse\n    a := 3\n')).toEqual([]);
    });

    it('parses nested if inside if', async () => {
        expect(await parseErrors('var a = 1\nif a > 0\n    if a > 5\n        a := 2\n')).toEqual([]);
    });

    it('parses four levels of nested if/else', async () => {
        const source = [
            'var a = 1',
            'if a > 1',
            '    if a > 2',
            '        if a > 3',
            '            if a > 4',
            '                a := 5',
            '            else',
            '                a := 4',
            '        else',
            '            a := 3',
            '    else',
            '        a := 2',
            ''
        ].join('\n');
        expect(await parseErrors(source)).toEqual([]);
    });

    it('parses for ... to', async () => {
        expect(await parseErrors('var s = 0\nfor i = 1 to 10\n    s := s + i\n')).toEqual([]);
    });

    it('parses for ... to ... by', async () => {
        expect(await parseErrors('var s = 0\nfor i = 1 to 10 by 2\n    s := s + i\n')).toEqual([]);
    });

    it('parses for ... in', async () => {
        expect(await parseErrors('var s = 0\nfor x in xs\n    s := s + 1\n')).toEqual([]);
    });

    it('parses while', async () => {
        expect(await parseErrors('var a = 1\nwhile a > 0\n    a := a - 1\n')).toEqual([]);
    });

    it('parses break inside a loop', async () => {
        expect(await parseErrors('while true\n    break\n')).toEqual([]);
    });

    it('parses continue inside a loop', async () => {
        expect(await parseErrors('while true\n    continue\n')).toEqual([]);
    });
});

describe('parser: functions', () => {
    it('parses a single-expression function body', async () => {
        const document = await parse('f(x) => x * 2\n');
        expect(await parseErrors('f(x) => x * 2\n')).toEqual([]);
        expect(statements(document)[0].$type).toBe('ArrowFunctionExpression');
    });

    it('parses a block function body', async () => {
        const document = await parse('f(x) =>\n    y = x * 2\n    y + 1\n');
        expect(statements(document)[0].$type).toBe('ArrowFunctionBlock');
    });

    it('parses default parameter values', async () => {
        const document = await parse('f(x = 10, y = 20) =>\n    x + y\n');
        const parameters = statements(document)[0].parameters.parameters;
        expect(parameters.map((p: any) => p.name)).toEqual(['x', 'y']);
        expect(parameters[0].defaultValue.value).toBe(10);
    });

    it('parses a function with no parameters', async () => {
        expect(await parseErrors('f() =>\n    1\n')).toEqual([]);
    });

    it('parses an if/else inside a function body', async () => {
        expect(await parseErrors('f(x) =>\n    if x > 1\n        1\n    else\n        0\n')).toEqual([]);
    });

    it('parses a for loop inside a function body', async () => {
        expect(await parseErrors('f(n) =>\n    s = 0\n    for i = 1 to n\n        s := s + i\n')).toEqual([]);
    });
});

describe('parser: expressions', () => {
    it('parses a call with positional arguments', async () => {
        const document = await parse('var r = f(1, 2)\n');
        expect(document.parseResult.value.statements.statements[0].expression.arguments.arguments).toHaveLength(2);
    });

    it('parses named arguments', async () => {
        const document = await parse('var r = plot(series = close, title = "x")\n');
        const args = document.parseResult.value.statements.statements[0].expression.arguments.arguments;
        expect(args.map((a: any) => a.name)).toEqual(['series', 'title']);
    });

    it('parses a qualified namespace call', async () => {
        const document = await parse('var e = ta.ema(close, 14)\n');
        const callee = document.parseResult.value.statements.statements[0].expression.expression;
        expect(callee.name.parts).toEqual(['ta', 'ema']);
    });

    it('parses a three-part qualified name', async () => {
        expect(await parseErrors('var x = a.b.c\n')).toEqual([]);
    });

    it('parses a method call on an expression', async () => {
        expect(await parseErrors('var s = arr.size()\n')).toEqual([]);
    });

    it('parses subscripting', async () => {
        expect(await parseErrors('var v = close[1]\n')).toEqual([]);
    });

    it('parses a non-empty array literal', async () => {
        const document = await parse('var a = [1, 2, 3]\n');
        expect(document.parseResult.value.statements.statements[0].expression.$type).toBe('ArrayExpression');
    });

    it('parses a ternary conditional', async () => {
        expect(await parseErrors('var y = x > 0 ? 1 : 2\n')).toEqual([]);
    });

    it('parses nested ternaries', async () => {
        expect(await parseErrors('var y = a > 1 ? 1 : b > 2 ? 2 : 3\n')).toEqual([]);
    });

    it('parses unary not and unary minus', async () => {
        expect(await parseErrors('var a = not true\nvar b = -5\n')).toEqual([]);
    });

    it('parses string, boolean and colour literals', async () => {
        expect(await parseErrors('var s = "hi"\nvar b = true\nvar c = #FF0000\n')).toEqual([]);
    });

    it('parses an import statement', async () => {
        expect(await parseErrors('import foo/bar/1 as baz\n')).toEqual([]);
    });
});

describe('parser: the less-than operator', () => {
    // README lists `<` as having a parsing conflict with template specifications.
    // The custom token builder moves template syntax onto its own keywords, so
    // these all parse today; the tests exist to catch a regression.
    it.each([
        ['comparison in a while condition', 'var x = 0\nwhile x < 5\n    x := x + 1\n'],
        ['comparison in an if condition', 'var x = 0\nif x < 5\n    x := 1\n'],
        ['comparison in an assignment', 'var b = 1 < 2\n'],
        ['comparison inside a call argument', 'var b = f(x < 5)\n'],
        ['less-than-or-equal', 'var b = 1 <= 2\n']
    ])('parses %s', async (_label, source) => {
        expect(await parseErrors(source)).toEqual([]);
    });
});
