import { describe, expect, it } from 'vitest';
import { toEstree, toJs } from './helpers.js';

describe('transpiler: the three defining transformations', () => {
    it('turns indentation into braces', async () => {
        expect(await toJs('var c = 3\nif c > 2\n    c := c + 1\n')).toBe(
            [
                'var c = 3;',
                'if (c > 2) {',
                '    c = c + 1;',
                '}'
            ].join('\n')
        );
    });

    it('turns := into plain JavaScript assignment', async () => {
        expect(await toJs('var a = 1\na := 2\n')).toBe('var a = 1;\na = 2;');
    });

    it('gives a block-bodied function an explicit return of its final expression', async () => {
        expect(await toJs('f(x) =>\n    y = x * 2\n    y + 1\n')).toBe(
            [
                'function f(x) {',
                '    var y = x * 2;',
                '    return y + 1;',
                '}'
            ].join('\n')
        );
    });

    it('returns from every branch when the final statement is an if/else', async () => {
        expect(await toJs('f(x) =>\n    if x > 1\n        1\n    else\n        0\n')).toBe(
            [
                'function f(x) {',
                '    if (x > 1) {',
                '        return 1;',
                '    } else {',
                '        return 0;',
                '    }',
                '}'
            ].join('\n')
        );
    });
});

describe('transpiler: statements', () => {
    it('emits if/else', async () => {
        expect(await toJs('var c = 3\nif c > 2\n    c := 1\nelse\n    c := 2\n')).toBe(
            'var c = 3;\nif (c > 2) {\n    c = 1;\n} else {\n    c = 2;\n}'
        );
    });

    it('emits nested if', async () => {
        expect(await toJs('var c = 3\nif c > 2\n    if c > 5\n        c := 0\n')).toBe(
            'var c = 3;\nif (c > 2) {\n    if (c > 5) {\n        c = 0;\n    }\n}'
        );
    });

    it('emits a counting for loop from for ... to', async () => {
        expect(await toJs('var s = 0\nfor i = 1 to 10\n    s := s + i\n')).toBe(
            'var s = 0;\nfor (let i = 1; i <= 10; i++) {\n    s = s + i;\n}'
        );
    });

    it('emits a while loop', async () => {
        expect(await toJs('var x = 5\nwhile x > 0\n    x := x - 1\n')).toBe(
            'var x = 5;\nwhile (x > 0) {\n    x = x - 1;\n}'
        );
    });

    it('emits break', async () => {
        expect(await toJs('while true\n    break\n')).toContain('break;');
    });

    it('drops the version annotation from the output', async () => {
        expect(await toJs('//@version=5\nvar a = 1\n')).toBe('var a = 1;');
    });

    it('drops comments from the output', async () => {
        expect(await toJs('// leading\nvar a = 1 // trailing\n')).toBe('var a = 1;');
    });
});

describe('transpiler: expressions', () => {
    it('emits a single-expression function as a function declaration', async () => {
        expect(await toJs('f(x) => x * 2\n')).toBe('function f(x) {\n    return x * 2;\n}');
    });

    it('keeps default parameter values', async () => {
        expect(await toJs('f(x = 10) => x * 2\n')).toBe('function f(x = 10) {\n    return x * 2;\n}');
    });

    it('keeps qualified names intact for namespaced calls', async () => {
        expect(await toJs('var e = ta.ema(close, 14)\n')).toBe('var e = ta.ema(close, 14);');
    });

    it('flattens array.* and matrix.* calls to the runtime shim names', async () => {
        // The runtime shim exports array_new_float/array_push rather than an
        // `array` object, so those two namespaces are rewritten with underscores.
        expect(await toJs('var a = array.new_float(0)\narray.push(a, 1)\n')).toBe(
            'var a = array_new_float(0);\narray_push(a, 1);'
        );
    });

    it('collects named arguments into a trailing options object', async () => {
        expect(await toJs('var r = plot(close, title = "x")\n')).toBe(
            'var r = plot(close, { title: \'x\' });'
        );
    });

    it('emits tuple destructuring as an array pattern', async () => {
        expect(await toJs('[a, b] = f()\n')).toBe('var [a, b] = f();');
    });

    it('emits a ternary', async () => {
        expect(await toJs('var y = x > 0 ? 1 : 2\n')).toBe('var y = x > 0 ? 1 : 2;');
    });

    it('emits not as !', async () => {
        expect(await toJs('var b = not true\n')).toBe('var b = !true;');
    });

    it('emits subscripting', async () => {
        expect(await toJs('var v = close[1]\n')).toBe('var v = close[1];');
    });

    it('emits string literals with single quotes', async () => {
        expect(await toJs('var s = "hi"\n')).toBe("var s = 'hi';");
    });

    it('preserves operator precedence through the ESTree round trip', async () => {
        expect(await toJs('var v = (1 + 2) * 3\n')).toBe('var v = (1 + 2) * 3;');
    });
});

describe('transpiler: logical operators', () => {
    it('emits && for and', async () => {
        expect(await toJs('var b = x > 1 and y > 2\n')).toBe('var b = x > 1 && y > 2;');
    });

    it('emits || for or', async () => {
        expect(await toJs('var b = x > 1 or y > 2\n')).toBe('var b = x > 1 || y > 2;');
    });

    it('emits a condition inside if', async () => {
        expect(await toJs('var z = 0\nif x > 1 and y > 2\n    z := 1\n')).toContain('if (x > 1 && y > 2)');
    });

    it('folds a chain of and left to right', async () => {
        expect(await toJs('var b = a and b and c\n')).toBe('var b = a && b && c;');
    });

    it('folds a chain of or left to right', async () => {
        expect(await toJs('var b = a or b or c\n')).toBe('var b = a || b || c;');
    });

    it('binds and tighter than or', async () => {
        // `a or (b and c)`: && sits below || in the tree, so escodegen needs no
        // parentheses. A flat or wrongly-nested tree would print differently.
        expect(await toJs('var b = a or b and c\n')).toBe('var b = a || b && c;');
        expect(await toJs('var b = a and b or c\n')).toBe('var b = a && b || c;');
    });

    it('keeps the parentheses that override precedence', async () => {
        expect(await toJs('var b = (a or b) and c\n')).toBe('var b = (a || b) && c;');
    });

    it('binds not tighter than and', async () => {
        expect(await toJs('var b = not a and b\n')).toBe('var b = !a && b;');
    });

    it('produces LogicalExpression nodes rather than BinaryExpression', async () => {
        const estree = await toEstree('var b = a and b or c\n');
        expect(estree.body[0].declarations[0].init).toMatchObject({
            type: 'LogicalExpression',
            operator: '||',
            left: { type: 'LogicalExpression', operator: '&&' },
            right: { type: 'Identifier', name: 'c' }
        });
    });
});

describe('transpiler: ESTree intermediate representation', () => {
    it('produces a Program node', async () => {
        const estree = await toEstree('var a = 1\n');
        expect(estree.type).toBe('Program');
        expect(estree.sourceType).toBe('script');
    });

    it('produces a VariableDeclaration for a var statement', async () => {
        const estree = await toEstree('var a = 1\n');
        expect(estree.body[0]).toMatchObject({
            type: 'VariableDeclaration',
            kind: 'var',
            declarations: [{
                type: 'VariableDeclarator',
                id: { type: 'Identifier', name: 'a' },
                init: { type: 'Literal', value: 1 }
            }]
        });
    });

    it('produces an AssignmentExpression for :=', async () => {
        const estree = await toEstree('var a = 1\na := 2\n');
        expect(estree.body[1]).toMatchObject({
            type: 'ExpressionStatement',
            expression: { type: 'AssignmentExpression', operator: '=' }
        });
    });

    it('produces a FunctionDeclaration with a BlockStatement body', async () => {
        const estree = await toEstree('f(x) =>\n    x + 1\n');
        expect(estree.body[0]).toMatchObject({
            type: 'FunctionDeclaration',
            id: { type: 'Identifier', name: 'f' },
            body: { type: 'BlockStatement' }
        });
    });
});

describe('transpiler: output shape', () => {
    it('prepends the built-in runtime shim to the generated code', async () => {
        // toJs() strips the shim; this asserts it was there to strip.
        await expect(toJs('var a = 1\n')).resolves.toBe('var a = 1;');
    });
});
