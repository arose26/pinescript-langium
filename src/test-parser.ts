import { NodeFileSystem } from 'langium/node';
import { createPinescriptServices } from './language-server/pinescript-module.js';
import { URI } from 'vscode-uri';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Test the PineScript parser.
 */
async function main(): Promise<void> {
    // Create the language services
    const services = createPinescriptServices(NodeFileSystem);

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
        // Create a document from the file content
        const uri = URI.file(fullPath);
        console.log('Processing file:', uri.toString());

        // Parse the content directly using the parser
        const parser = services.Pinescript.parser.LangiumParser;
        const lexer = services.Pinescript.parser.Lexer;

        // Tokenize the input
        const tokens = lexer.tokenize(content);
        console.log('Tokens:', tokens.tokens.length);

        // Parse the tokens
        const result = parser.parse(content);

        // Print the result
        console.log('Parse result:', result.lexerErrors.length > 0 || result.parserErrors.length > 0 ? 'Failed' : 'Success');

        if (result.lexerErrors.length > 0) {
            console.log('Lexer errors:', result.lexerErrors.length);
            result.lexerErrors.forEach((error, index) => {
                console.log(`  Error ${index + 1}: ${error.message}`);
            });
        }

        if (result.parserErrors.length > 0) {
            console.log('Parser errors:', result.parserErrors.length);
            result.parserErrors.forEach((error, index) => {
                console.log(`  Error ${index + 1}: ${error.message}`);
            });
        }

        // Print the AST
        if (result.value) {
            console.log('AST:', result.value);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

main().catch(console.error);
