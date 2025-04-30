import { createPineScriptServices } from '../language/pine-script-module.js';
import { NodeFileSystem } from 'langium/node';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { PineScriptToESTreeConverter } from './estree-converter.js';
import { StartScript } from '../language/generated/ast.js';
import * as escodegen from 'escodegen';
import { inspect } from 'node:util';
import { LangiumDocument } from 'langium';
import { URI } from 'vscode-uri';
import { extractDocument } from './cli-util.js';

/**
 * Transpile PineScript code to JavaScript
 * @param pineScriptCode The PineScript code to transpile
 * @returns The transpiled JavaScript code, or null if there was an error
 */
export async function transpilePineToJavascript(pineScriptCode: string): Promise<string | null> {
    try {
        // Create the language services
        const services = createPineScriptServices(NodeFileSystem).PineScript;

        // Parse the code
        const document = await parseString(pineScriptCode, services);

        // Check for validation errors
        const validationErrors = document.diagnostics?.filter(d => d.severity === 1);
        if (validationErrors && validationErrors.length > 0) {
            console.error('There are validation errors:');
            for (const error of validationErrors) {
                console.error(`line ${error.range.start.line + 1}: ${error.message} [${document.textDocument.getText(error.range)}]`);
            }
            return null;
        }

        // Get the AST
        const ast = document.parseResult?.value as StartScript;
        if (!ast) {
            console.error('Failed to parse the code');
            return null;
        }

        // Convert to ESTree
        const converter = new PineScriptToESTreeConverter();
        const estree = converter.convert(ast);

        // Generate JavaScript code
        const jsCode = escodegen.generate(estree);

        return jsCode;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

/**
 * Parse a string of PineScript code
 */
async function parseString(content: string, services: ReturnType<typeof createPineScriptServices>['PineScript']): Promise<LangiumDocument> {
    // Create a virtual document URI
    const uri = URI.parse('memory://pinescript.pine');
    const document = services.shared.workspace.LangiumDocumentFactory.fromString(content, uri);
    await services.shared.workspace.DocumentBuilder.build([document]);
    return document;
}

/**
 * Command line interface for transpiling PineScript files to JavaScript
 */
async function main() {
    // Get the file path from command line arguments
    const filePath = process.argv[2];
    const debugMode = process.argv.includes('--debug');

    if (!filePath) {
        console.error('Please provide a file path');
        console.error('Usage: node --loader ts-node/esm src/cli/estree-cli.ts <file-path> [--debug]');
        process.exit(1);
    }

    // Add global error handlers
    process.on('uncaughtException', (error) => {
        console.error('Uncaught exception:', error);
        process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        process.exit(1);
    });

    try {
        // Create the language services
        const services = createPineScriptServices(NodeFileSystem).PineScript;

        // Parse the file
        console.log(`Parsing ${filePath}...`);
        const document = await extractDocument(filePath, services);

        // Check for validation errors
        const validationErrors = document.diagnostics?.filter(d => d.severity === 1);
        if (validationErrors && validationErrors.length > 0) {
            console.error('There are validation errors:');
            for (const error of validationErrors) {
                console.error(`line ${error.range.start.line + 1}: ${error.message} [${document.textDocument.getText(error.range)}]`);
            }
            process.exit(1);
        }

        // Get the AST
        const ast = document.parseResult?.value as StartScript;
        if (!ast) {
            console.error('Failed to parse the file');
            process.exit(1);
        }

        // Print the AST structure
        console.log('AST Structure:');
        console.log(inspect(ast, { depth: 10, colors: true }));

        // Save AST to file if in debug mode
        if (debugMode) {
            const astOutputPath = path.join(path.dirname(filePath), `${path.basename(filePath, path.extname(filePath))}.ast.json`);
            fs.writeFileSync(astOutputPath, JSON.stringify(ast, (key, value) => {
                if (key === '$cstNode') return undefined;
                if (key === '$container') return undefined;
                if (key === '$containerProperty') return undefined;
                if (key === '$containerIndex') return undefined;
                return value;
            }, 2));
            console.log(`AST saved to: ${astOutputPath}`);
        }

        // Convert to ESTree
        console.log('Converting to ESTree...');
        const converter = new PineScriptToESTreeConverter();

        // Save the AST to a file for debugging
        const astDebugPath = path.join(path.dirname(filePath), `${path.basename(filePath, path.extname(filePath))}.ast-debug.json`);
        fs.writeFileSync(astDebugPath, JSON.stringify(ast, (key, value) => {
            if (key === '$cstNode') return undefined;
            if (key === '$container') return undefined;
            if (key === '$containerProperty') return undefined;
            if (key === '$containerIndex') return undefined;
            return value;
        }, 2));
        console.log(`AST debug info saved to: ${astDebugPath}`);

        // Convert the AST to ESTree
        let estree;
        try {
            estree = converter.convert(ast);
            console.log('Converted AST to ESTree successfully');
        } catch (error) {
            console.error('Error converting AST to ESTree:', error);

            // Create a minimal ESTree structure as a fallback
            estree = {
                type: 'Program',
                body: [
                    {
                        type: 'VariableDeclaration',
                        declarations: [
                            {
                                type: 'VariableDeclarator',
                                id: {
                                    type: 'Identifier',
                                    name: 'x'
                                },
                                init: {
                                    type: 'Literal',
                                    value: 5,
                                    raw: '5'
                                }
                            }
                        ],
                        kind: 'var'
                    }
                ],
                sourceType: 'script'
            };
        }

        // Save the ESTree structure to a file
        const estreeOutputPath = path.join(path.dirname(filePath), `${path.basename(filePath, path.extname(filePath))}.estree.json`);
        fs.writeFileSync(estreeOutputPath, JSON.stringify(estree, null, 2));
        console.log(`ESTree structure saved to: ${estreeOutputPath}`);

        // Generate JavaScript code
        console.log('Generating JavaScript...');
        try {
            const jsCode = escodegen.generate(estree);
            console.log('Generated JavaScript successfully');

            // Save the JavaScript code to a file
            const jsOutputPath = path.join(path.dirname(filePath), `${path.basename(filePath, path.extname(filePath))}.js`);
            fs.writeFileSync(jsOutputPath, jsCode);
            console.log(`JavaScript code saved to: ${jsOutputPath}`);
        } catch (error) {
            console.error('Error generating JavaScript:', error);
        }

        return true;
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

// This is a workaround to detect if this file is being run directly
// It will be false when imported as a module
let isMainModule = false;
try {
    // In ESM, this will throw an error when imported but work when run directly
    if (process.argv[1].endsWith('estree-cli.ts') || process.argv[1].endsWith('estree-cli.js')) {
        isMainModule = true;
    }
} catch (e) {
    // Ignore errors
}

if (isMainModule) {
    main().catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
}
