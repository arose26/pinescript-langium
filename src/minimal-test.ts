import { EmptyFileSystem } from 'langium';
import { createLangiumGrammarServices } from 'langium/grammar';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Minimal test for the PineScript parser.
 */
async function main(): Promise<void> {
    // Get the file path from command line arguments
    const filePath = process.argv[2];
    if (!filePath) {
        console.error('Please provide a file path');
        process.exit(1);
    }

    // Read the file
    const fullPath = path.resolve(process.cwd(), filePath);
    const content = fs.readFileSync(fullPath, 'utf8');

    try {
        console.log('Processing file:', fullPath);
        console.log('\nFile content:');
        console.log('-----------------------------------');
        console.log(content);
        console.log('-----------------------------------\n');

        // Read the grammar file
        const grammarPath = path.resolve(process.cwd(), 'src/language/pine-script.langium');
        const grammarContent = fs.readFileSync(grammarPath, 'utf8');

        // Create grammar services
        const services = createLangiumGrammarServices(EmptyFileSystem).grammar;

        // Parse the grammar
        console.log('Parsing grammar...');
        const grammarParseResult = services.parser.LangiumParser.parse(grammarContent);

        if (grammarParseResult.lexerErrors.length > 0 || grammarParseResult.parserErrors.length > 0) {
            console.error('Failed to parse grammar');
            process.exit(1);
        }

        // We can't directly generate a parser from the grammar in Langium 3.x
        // Instead, we'll use the existing parser from our module
        console.log('Using existing parser...');

        // Import our module
        const { createPinescriptServices } = await import('./language-server/pinescript-module.js');
        const pinescriptServices = createPinescriptServices(EmptyFileSystem);

        // Get the parser
        const parser = pinescriptServices.Pinescript.parser.LangiumParser;

        // Parse the input
        console.log('Parsing input...');
        const parseResult = parser.parse(content);

        // Check for errors
        if (parseResult.lexerErrors.length > 0 || parseResult.parserErrors.length > 0) {
            console.log('Parse failed with errors');

            if (parseResult.lexerErrors.length > 0) {
                console.log(`\nLexer errors (${parseResult.lexerErrors.length}):`);
                parseResult.lexerErrors.forEach((error: any, i: number) => {
                    console.log(`  Error ${i+1}: ${error.message}`);
                });
            }

            if (parseResult.parserErrors.length > 0) {
                console.log(`\nParser errors (${parseResult.parserErrors.length}):`);
                parseResult.parserErrors.forEach((error: any, i: number) => {
                    console.log(`  Error ${i+1}: ${error.message}`);
                });
            }
        } else {
            console.log('Parse successful!');

            // Print the AST root type
            if (parseResult.value) {
                console.log(`\nAST root type: ${parseResult.value.$type}`);

                // Print a simplified version of the AST
                console.log('\nSimplified AST:');
                const simplifiedAst = simplifyAst(parseResult.value);
                console.log(JSON.stringify(simplifiedAst, null, 2));
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

/**
 * Simplify an AST node for display.
 */
function simplifyAst(node: any, depth: number = 0, maxDepth: number = 3): any {
    if (depth >= maxDepth) {
        return '...';
    }

    if (!node || typeof node !== 'object') {
        return node;
    }

    if (Array.isArray(node)) {
        return node.map(item => simplifyAst(item, depth + 1, maxDepth));
    }

    const result: any = {};

    // Add the type if available
    if (node.$type) {
        result.$type = node.$type;
    }

    // Add other properties, excluding special properties
    for (const key of Object.keys(node)) {
        if (key.startsWith('$') && key !== '$type') {
            continue;
        }

        result[key] = simplifyAst(node[key], depth + 1, maxDepth);
    }

    return result;
}

main().catch(console.error);
