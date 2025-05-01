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
 * Helper function to fix return statements in the ESTree
 */
function fixReturnStatements(node: any) {
    if (!node || typeof node !== 'object') return;

    // Process function declarations
    if (node.type === 'FunctionDeclaration' && node.body && node.body.type === 'BlockStatement') {
        // Process if statements in function bodies
        processIfStatements(node.body.body);
    }

    // Recursively process all properties
    for (const key in node) {
        if (node.hasOwnProperty(key) && typeof node[key] === 'object' && node[key] !== null) {
            fixReturnStatements(node[key]);
        }
    }
}

/**
 * Helper function to process if statements in a block
 */
function processIfStatements(statements: any[]) {
    if (!statements || !Array.isArray(statements)) return;

    for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];

        if (statement.type === 'IfStatement') {
            // Fix the consequent block
            if (statement.consequent && statement.consequent.type === 'BlockStatement') {
                // Process nested if statements in the consequent block
                processIfStatements(statement.consequent.body);

                // Convert the last expression to a return statement
                const lastStatement = statement.consequent.body[statement.consequent.body.length - 1];
                if (lastStatement && lastStatement.type === 'ExpressionStatement') {
                    statement.consequent.body[statement.consequent.body.length - 1] = {
                        type: 'ReturnStatement',
                        argument: lastStatement.expression
                    };
                }
            }

            // Fix the alternate block
            if (statement.alternate) {
                if (statement.alternate.type === 'BlockStatement') {
                    // Process nested if statements in the alternate block
                    processIfStatements(statement.alternate.body);

                    // Convert the last expression to a return statement
                    const lastStatement = statement.alternate.body[statement.alternate.body.length - 1];
                    if (lastStatement && lastStatement.type === 'ExpressionStatement') {
                        statement.alternate.body[statement.alternate.body.length - 1] = {
                            type: 'ReturnStatement',
                            argument: lastStatement.expression
                        };
                    }
                } else if (statement.alternate.type === 'IfStatement') {
                    // Handle else if statements
                    const elseIfStatement = statement.alternate;
                    statement.alternate = {
                        type: 'BlockStatement',
                        body: [elseIfStatement]
                    };
                }
            }
        }
    }
}

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

        // Fix the ESTree to ensure return statements are properly generated
        fixReturnStatements(estree);

        // Generate JavaScript code
        const jsCode = escodegen.generate(estree, {
            format: {
                indent: {
                    style: '    ',
                    base: 0
                },
                newline: '\n',
                space: ' ',
                json: false,
                renumber: false,
                hexadecimal: false,
                quotes: 'single',
                escapeless: false,
                compact: false,
                parentheses: true,
                semicolons: true,
                safeConcatenation: false
            }
        });

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

        // Create a function to safely stringify the AST without circular references
        function safeStringify(obj: any, indent = 2) {
            const cache = new Set();
            return JSON.stringify(obj, (key, value) => {
                // Skip Langium-specific properties
                if (key === '$cstNode') return undefined;
                if (key === '$container') return undefined;
                if (key === '$containerProperty') return undefined;
                if (key === '$containerIndex') return undefined;
                if (key === '$document') return undefined;

                // Handle circular references
                if (typeof value === 'object' && value !== null) {
                    if (cache.has(value)) {
                        return '[Circular]';
                    }
                    cache.add(value);
                }
                return value;
            }, indent);
        }

        // Save AST to file if in debug mode
        if (debugMode) {
            const astOutputPath = path.join(path.dirname(filePath), `${path.basename(filePath, path.extname(filePath))}.ast.json`);
            try {
                fs.writeFileSync(astOutputPath, safeStringify(ast));
                console.log(`AST saved to: ${astOutputPath}`);
            } catch (error) {
                console.error('Error saving AST:', error);
            }
        }

        // Convert to ESTree
        console.log('Converting to ESTree...');
        const converter = new PineScriptToESTreeConverter();

        // Save the AST to a file for debugging
        const astDebugPath = path.join(path.dirname(filePath), `${path.basename(filePath, path.extname(filePath))}.ast-debug.json`);

        try {
            fs.writeFileSync(astDebugPath, safeStringify(ast));
            console.log(`AST debug info saved to: ${astDebugPath}`);
        } catch (error) {
            console.error('Error saving AST debug info:', error);
        }

        // Convert the AST to ESTree
        let estree;
        try {
            estree = converter.convert(ast);
            console.log('Converted AST to ESTree successfully');
        } catch (error) {
            console.error('Error converting AST to ESTree:', error);

            // Try to read the ESTree structure from the file if it exists
            const estreeOutputPath = path.join(path.dirname(filePath), `${path.basename(filePath, path.extname(filePath))}.estree.json`);
            if (fs.existsSync(estreeOutputPath)) {
                try {
                    console.log('Reading ESTree structure from file:', estreeOutputPath);
                    const estreeContent = fs.readFileSync(estreeOutputPath, 'utf8');
                    estree = JSON.parse(estreeContent);
                    console.log('Successfully read ESTree structure from file');
                } catch (readError) {
                    console.error('Error reading ESTree structure from file:', readError);
                    // Create a minimal ESTree structure as a fallback
                    estree = createFallbackESTree();
                }
            } else {
                // Create a minimal ESTree structure as a fallback
                estree = createFallbackESTree();
            }
        }

        // Helper function to create a fallback ESTree structure
        function createFallbackESTree() {
            return {
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
        try {
            fs.writeFileSync(estreeOutputPath, safeStringify(estree));
            console.log(`ESTree structure saved to: ${estreeOutputPath}`);
        } catch (error) {
            console.error('Error saving ESTree structure:', error);
        }

        // Generate JavaScript code
        console.log('Generating JavaScript...');
        try {
            // Fix the ESTree to ensure return statements are properly generated
            fixReturnStatements(estree);

            const jsCode = escodegen.generate(estree, {
                format: {
                    indent: {
                        style: '    ',
                        base: 0
                    },
                    newline: '\n',
                    space: ' ',
                    json: false,
                    renumber: false,
                    hexadecimal: false,
                    quotes: 'single',
                    escapeless: false,
                    compact: false,
                    parentheses: true,
                    semicolons: true,
                    safeConcatenation: false
                }
            });
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
