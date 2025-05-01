import { describe, it, expect } from 'vitest';
import { parseHelper } from '../utils/parse-helper';
import { convertToESTree } from '../../src/cli/estree-converter';
import * as escodegen from 'escodegen';

describe('Complex PineScript Features', () => {
    const parse = parseHelper();

    it('should parse and convert complex for loops', async () => {
        const code = `
            for i = 0 to 10
                if i % 2 == 0
                    x := i * 2
                else
                    x := i * 3
        `;
        const result = await parse(code);
        expect(result.parserErrors).toHaveLength(0);
        
        const estree = convertToESTree(result.value);
        const js = escodegen.generate(estree);
        
        expect(js).toContain('for (let i = 0; i <= 10; i++)');
        expect(js).toContain('if (i % 2 === 0)');
        expect(js).toContain('x = i * 2');
        expect(js).toContain('x = i * 3');
    });

    it('should parse and convert for loops with step', async () => {
        const code = `
            for i = 0 to 10 by 2
                x := i
        `;
        const result = await parse(code);
        expect(result.parserErrors).toHaveLength(0);
        
        const estree = convertToESTree(result.value);
        const js = escodegen.generate(estree);
        
        expect(js).toContain('for (let i = 0; i <= 10; i += 2)');
        expect(js).toContain('x = i');
    });

    it('should parse and convert for-in loops', async () => {
        const code = `
            arr = array.new_float(5, 0)
            for i in arr
                x := i
        `;
        const result = await parse(code);
        expect(result.parserErrors).toHaveLength(0);
        
        const estree = convertToESTree(result.value);
        const js = escodegen.generate(estree);
        
        expect(js).toContain('const arr = array.new_float(5, 0)');
        expect(js).toContain('for (const i of arr)');
        expect(js).toContain('x = i');
    });

    it('should parse and convert array destructuring assignment', async () => {
        const code = `
            arr = array.new_float(3, 0)
            [a, b, c] = arr
        `;
        const result = await parse(code);
        expect(result.parserErrors).toHaveLength(0);
        
        const estree = convertToESTree(result.value);
        const js = escodegen.generate(estree);
        
        expect(js).toContain('const arr = array.new_float(3, 0)');
        expect(js).toContain('const [a, b, c] = arr');
    });

    it('should parse and convert array functions', async () => {
        const code = `
            arr = array.new_float(5, 0)
            array.push(arr, 10)
            x = array.get(arr, 0)
            array.set(arr, 1, 20)
            size = array.size(arr)
        `;
        const result = await parse(code);
        expect(result.parserErrors).toHaveLength(0);
        
        const estree = convertToESTree(result.value);
        const js = escodegen.generate(estree);
        
        expect(js).toContain('const arr = array.new_float(5, 0)');
        expect(js).toContain('array.push(arr, 10)');
        expect(js).toContain('const x = array.get(arr, 0)');
        expect(js).toContain('array.set(arr, 1, 20)');
        expect(js).toContain('const size = array.size(arr)');
    });

    it('should parse and convert matrix functions', async () => {
        const code = `
            mat = matrix.new(3, 3, 0)
            matrix.set(mat, 0, 0, 1)
            x = matrix.get(mat, 0, 0)
            transposed = matrix.transpose(mat)
            rows = matrix.rows(mat)
            cols = matrix.cols(mat)
        `;
        const result = await parse(code);
        expect(result.parserErrors).toHaveLength(0);
        
        const estree = convertToESTree(result.value);
        const js = escodegen.generate(estree);
        
        expect(js).toContain('const mat = matrix.new(3, 3, 0)');
        expect(js).toContain('matrix.set(mat, 0, 0, 1)');
        expect(js).toContain('const x = matrix.get(mat, 0, 0)');
        expect(js).toContain('const transposed = matrix.transpose(mat)');
        expect(js).toContain('const rows = matrix.rows(mat)');
        expect(js).toContain('const cols = matrix.cols(mat)');
    });

    it('should parse and convert complex ternary expressions', async () => {
        const code = `
            x = a > b ? c + d : e * f
            y = a > b ? c > d ? e : f : g
        `;
        const result = await parse(code);
        expect(result.parserErrors).toHaveLength(0);
        
        const estree = convertToESTree(result.value);
        const js = escodegen.generate(estree);
        
        expect(js).toContain('const x = a > b ? c + d : e * f');
        expect(js).toContain('const y = a > b ? c > d ? e : f : g');
    });

    it('should parse and convert variable reassignment with := operator', async () => {
        const code = `
            x = 10
            x := 20
            x := x + 5
        `;
        const result = await parse(code);
        expect(result.parserErrors).toHaveLength(0);
        
        const estree = convertToESTree(result.value);
        const js = escodegen.generate(estree);
        
        expect(js).toContain('const x = 10');
        expect(js).toContain('x = 20');
        expect(js).toContain('x = x + 5');
    });

    it('should parse and convert input functions with named parameters', async () => {
        const code = `
            src = input.source(defval=close, title="Source", group="General")
            len = input.int(defval=14, title="Length", minval=1, maxval=100)
        `;
        const result = await parse(code);
        expect(result.parserErrors).toHaveLength(0);
        
        const estree = convertToESTree(result.value);
        const js = escodegen.generate(estree);
        
        expect(js).toContain('const src = input.source(close, { title: "Source", group: "General" })');
        expect(js).toContain('const len = input.int(14, { title: "Length", minval: 1, maxval: 100 })');
    });
});
