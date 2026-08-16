import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const cli = resolve(projectRoot, 'out/cli/estree-cli.js');

/**
 * End-to-end coverage of the shipped command line entry point. Inputs are
 * copied into a fresh temporary directory because the CLI writes its output
 * next to the input file; running it against examples/ in place would leave
 * artefacts behind and let one run seed the next.
 */
describe('estree-cli', () => {
    let workDir: string;

    beforeAll(() => {
        workDir = mkdtempSync(join(tmpdir(), 'pinescript-cli-'));
    });

    afterAll(() => {
        rmSync(workDir, { recursive: true, force: true });
    });

    // The CLI traces every AST node it visits to stdout, which overruns the
    // default 1 MB pipe buffer, so stdout is discarded and stderr given room.
    const run = (args: string[]) => execFileSync(process.execPath, [cli, ...args], {
        cwd: projectRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'ignore', 'pipe'],
        maxBuffer: 32 * 1024 * 1024
    });

    it('writes both the ESTree file and the JavaScript file next to the input', () => {
        const input = join(workDir, 'sample.pine');
        copyFileSync(resolve(projectRoot, 'examples/simple/test-estree-simple.pine'), input);

        run([input]);

        expect(existsSync(join(workDir, 'sample.estree.json'))).toBe(true);
        expect(existsSync(join(workDir, 'sample.js'))).toBe(true);
    });

    it('generates JavaScript that matches the README example', () => {
        const input = join(workDir, 'readme.pine');
        copyFileSync(resolve(projectRoot, 'examples/simple/test-estree-simple.pine'), input);

        run([input]);
        const generated = readFileSync(join(workDir, 'readme.js'), 'utf8');

        expect(generated).toContain('if (c > 2) {');
        expect(generated).toContain('c = c + 1;');
        expect(generated).toContain('function f(x) {');
        expect(generated).toContain('return y + 1;');
    });

    it('writes a parseable ESTree Program as the intermediate file', () => {
        const input = join(workDir, 'tree.pine');
        copyFileSync(resolve(projectRoot, 'examples/simple/if-else.pine'), input);

        run([input]);
        const estree = JSON.parse(readFileSync(join(workDir, 'tree.estree.json'), 'utf8'));

        expect(estree.type).toBe('Program');
        expect(estree.body.map((n: any) => n.type)).toEqual(['VariableDeclaration', 'IfStatement']);
    });

    it('prepends the runtime shim so the output stands alone', () => {
        const input = join(workDir, 'shim.pine');
        copyFileSync(resolve(projectRoot, 'examples/simple/namespace-test.pine'), input);

        run([input]);
        const generated = readFileSync(join(workDir, 'shim.js'), 'utf8');

        expect(generated).toContain('const ta = {');
        expect(generated).toContain('const math = {');
    });

    it('exits non-zero when the file does not exist', () => {
        expect(() => run([join(workDir, 'missing.pine')])).toThrow();
    });

    it('exits non-zero when the extension is not .pine', () => {
        const input = join(workDir, 'wrong.txt');
        copyFileSync(resolve(projectRoot, 'examples/simple/if.pine'), input);
        expect(() => run([input])).toThrow();
    });
});
