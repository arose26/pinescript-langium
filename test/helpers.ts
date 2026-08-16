/**
 * Shared plumbing for the test suite.
 *
 * Everything here talks to the compiled output in `out/`, which is what the
 * package actually ships, so `npm run langium:generate && npm run build` must
 * have run before `npm test`. The entry points exercised are:
 *
 *   parse()      source string -> Langium AST      (pine-script-module.js)
 *   toEstree()   Langium AST   -> ESTree           (estree-converter.js)
 *   toJs()       source string -> JavaScript       (estree-cli.js, the shipped API)
 *   tokenNames() source string -> token stream     (the indentation-aware lexer)
 */
import { EmptyFileSystem, URI } from 'langium';
import type { LangiumDocument } from 'langium';
// out/ is emitted JavaScript; the build does not produce declaration files, so
// these imports are untyped. Vitest transpiles without type checking.
import { createPineScriptServices } from '../out/language/pine-script-module.js';
import { PineScriptToESTreeConverter } from '../out/cli/estree-converter.js';
import { transpilePineToJavascript } from '../out/cli/estree-cli.js';
import { getBuiltinsCode } from '../out/cli/builtins.js';

const services = createPineScriptServices(EmptyFileSystem).PineScript;

/** Langium caches documents by URI, so every parse needs a fresh one. */
let documentCounter = 0;

export async function parse(text: string, options: { validation?: boolean } = {}): Promise<LangiumDocument> {
    const uri = URI.parse(`memory://test-${documentCounter++}.pine`);
    const document = services.shared.workspace.LangiumDocumentFactory.fromString(text, uri);
    await services.shared.workspace.DocumentBuilder.build([document], { validation: options.validation ?? false });
    return document;
}

/** Lexer + parser error messages, in that order. */
export async function parseErrors(text: string): Promise<string[]> {
    const document = await parse(text);
    const result = document.parseResult as any;
    return [
        ...result.lexerErrors.map((e: any) => e.message),
        ...result.parserErrors.map((e: any) => e.message)
    ];
}

export interface Diagnostic { severity: number; message: string }

export async function diagnostics(text: string): Promise<Diagnostic[]> {
    const document = await parse(text, { validation: true });
    return (document.diagnostics ?? []).map(d => ({ severity: d.severity as number, message: d.message }));
}

/** Token type names produced by the indentation-aware lexer, hidden tokens excluded. */
export function tokenNames(text: string): string[] {
    return services.parser.Lexer.tokenize(text).tokens.map((t: any) => t.tokenType.name);
}

export function lexerErrors(text: string): string[] {
    return services.parser.Lexer.tokenize(text).errors.map((e: any) => e.message);
}

export async function toEstree(text: string): Promise<any> {
    const document = await parse(text);
    return new PineScriptToESTreeConverter().convert(document.parseResult.value);
}

const builtinsPrefix = getBuiltinsCode() + '\n\n';

/**
 * The shipped `transpilePineToJavascript`, with the built-in runtime shim that
 * it prepends stripped back off so assertions are about the generated code.
 */
export async function toJs(text: string): Promise<string> {
    const code: string | null = await transpilePineToJavascript(text);
    if (code === null) {
        throw new Error('transpilePineToJavascript returned null');
    }
    if (!code.startsWith(builtinsPrefix)) {
        throw new Error('generated code did not start with the built-in runtime shim');
    }
    return code.slice(builtinsPrefix.length).trimEnd();
}

export { builtinsPrefix };
