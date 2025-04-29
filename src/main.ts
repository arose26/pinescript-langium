import { NodeFileSystem } from 'langium/node';
import { createPinescriptServices } from './language-server/pinescript-module';
import { URI } from 'vscode-uri';
import * as fs from 'fs';
import * as path from 'path';
import { PinescriptTokenBuilder } from './language-server/token-builder';
import { PinescriptParser } from './language-server/pinescript-parser';

/**
 * Parse and validate a PineScript file.
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

        // Create a token builder and parser
        const tokenBuilder = new PinescriptTokenBuilder();
        const parser = new PinescriptParser(tokenBuilder, services.Pinescript);

        // Parse the content
        console.log('\nParsing content...');
        try {
            const parseResult = parser.parse(content);
            console.log('Parse successful!');

            // Check for lexer errors
            if (parseResult.lexerErrors && parseResult.lexerErrors.length > 0) {
                console.log('Lexer errors:', parseResult.lexerErrors.length);
                parseResult.lexerErrors.forEach((error, index) => {
                    console.log(`  Error ${index + 1}: ${error.message}`);
                });
            } else {
                console.log('No lexer errors.');
            }

            // Check for parser errors
            if (parseResult.parserErrors && parseResult.parserErrors.length > 0) {
                console.log('Parser errors:', parseResult.parserErrors.length);
                parseResult.parserErrors.forEach((error, index) => {
                    console.log(`  Error ${index + 1}: ${error.message}`);
                });
            } else {
                console.log('No parser errors.');
            }

            // Print the AST structure (just the top level)
            if (parseResult.value) {
                console.log('\nAST structure:');
                try {
                    // Create a custom replacer function to handle circular references
                    const getCircularReplacer = () => {
                        const seen = new WeakSet();
                        return (key: string, value: any) => {
                            // Skip container properties to avoid circular references
                            if (key === '$container' || key === '$containerProperty' || key === '$containerIndex' || key === '$cstNode') {
                                return '[Circular]';
                            }
                            if (typeof value === 'object' && value !== null) {
                                if (seen.has(value)) {
                                    return '[Circular]';
                                }
                                seen.add(value);
                            }
                            return value;
                        };
                    };

                    // Stringify the AST with the custom replacer
                    const astString = JSON.stringify(parseResult.value, getCircularReplacer(), 2);
                    console.log(astString.substring(0, 500) + (astString.length > 500 ? '...' : ''));
                } catch (error) {
                    console.error('Error stringifying AST:', error);

                    // Print a simplified version of the AST
                    console.log('Simplified AST:');
                    const simplifiedAst = {
                        $type: parseResult.value.$type,
                        statements: (parseResult.value as any).statements?.map((stmt: any) => ({
                            $type: stmt.$type
                        }))
                    };
                    console.log(JSON.stringify(simplifiedAst, null, 2));
                }
            }
        } catch (parseError) {
            console.error('Error during parsing:', parseError);
        }
    } catch (error) {
        console.error('Error processing file:', error);
    }
}

main().catch(console.error);
