import { PineScriptToESTreeConverter } from './estree-converter.js';

/**
 * Convert a Langium AST to an ESTree-compatible AST
 * @param ast The Langium AST to convert
 * @returns An ESTree-compatible AST
 */
export function convertToESTree(ast: any): any {
    const converter = new PineScriptToESTreeConverter();
    return converter.convert(ast);
}
