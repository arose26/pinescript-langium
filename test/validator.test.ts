import { describe, expect, it } from 'vitest';
import { diagnostics } from './helpers.js';

const ERROR = 1;
const WARNING = 2;

const messages = (list: { message: string }[]) => list.map(d => d.message);

describe('validator: built-in function calls', () => {
    it('accepts a correct call to a known built-in', async () => {
        expect(await diagnostics('var a = ta.sma(close, 14)\n')).toEqual([]);
    });

    it('warns about an unknown function in a known namespace', async () => {
        const found = await diagnostics('var a = ta.notARealFunction(1)\n');
        expect(found).toEqual([
            { severity: WARNING, message: 'Unknown built-in function: ta.notARealFunction' }
        ]);
    });

    it('errors when a required argument is missing', async () => {
        const found = await diagnostics('var a = ta.sma(close)\n');
        expect(found[0].severity).toBe(ERROR);
        expect(found[0].message).toBe('Function ta.sma requires at least 2 arguments, but got 1');
    });

    it('errors on a named argument the built-in does not declare', async () => {
        const found = await diagnostics('var a = ta.sma(close, badparam = 3)\n');
        expect(found[0].severity).toBe(ERROR);
        expect(found[0].message).toBe('Unknown parameter name: badparam for function ta.sma');
    });

    it('leaves calls to user-defined (non-namespaced) functions alone', async () => {
        expect(await diagnostics('f(x) => x\nvar a = f(1, 2, 3)\n')).toEqual([]);
    });
});

describe('validator: naming conventions', () => {
    it('warns about a variable name that does not start lowercase', async () => {
        expect(messages(await diagnostics('var Xyz = 1\n'))).toEqual([
            'Variable name should start with a lowercase letter and contain only letters, numbers, and underscores.'
        ]);
    });

    it('warns about a function name that does not start lowercase', async () => {
        const found = await diagnostics('Xyz(a) => a\n');
        expect(found.every(d => d.severity === WARNING)).toBe(true);
        expect(found[0].message).toContain('Function name should start with a lowercase letter');
    });

    it('accepts conventional names', async () => {
        expect(await diagnostics('var myVar_1 = 1\nmyFunc(x) => x\n')).toEqual([]);
    });
});

describe('validator: diagnostic filtering', () => {
    it('surfaces genuine parse errors as diagnostics', async () => {
        const found = await diagnostics('var a = 1\nswitch a\n    1 -> a := 2\n');
        expect(found.some(d => d.severity === ERROR)).toBe(true);
    });

    it('suppresses the "Expecting end of file but found `=>`" parse error', async () => {
        // registerValidationChecks() filters this one message out on purpose,
        // because the arrow-function grammar conflict emits it on scripts that
        // otherwise transpile. Nothing else filters it, so it must not appear.
        const found = await diagnostics('f(x) =>\n    for i = 1 to 2\n        x := x + 1\n');
        expect(messages(found)).not.toContain('Expecting end of file but found `=>`.');
    });
});
