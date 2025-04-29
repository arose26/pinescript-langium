import { createPineScriptServices } from './out/language/pine-script-module.js';
import { NodeFileSystem } from 'langium/node';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Helper function to handle circular references in JSON.stringify
function getCircularReplacer() {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular]';
            }
            seen.add(value);
        }
        
        // Skip internal properties
        if (key.startsWith('$')) {
            return undefined;
        }
        
        return value;
    };
}

async function main() {
    // Get the file path from command line arguments
    const filePath = process.argv[2];
    if (!filePath) {
        console.error('Please provide a file path');
        process.exit(1);
    }

    // Create the language services
    const services = createPineScriptServices(NodeFileSystem).PineScript;
    const parser = services.parser;
    const lexer = parser.LangiumParser.lexer;

    // Read the file content
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Tokenize the content
    console.log('Tokenizing...');
    const tokens = lexer.tokenize(content);
    console.log(`Found ${tokens.tokens.length} tokens`);
    
    // Print the first 20 tokens
    console.log('First 20 tokens:');
    for (let i = 0; i < Math.min(20, tokens.tokens.length); i++) {
        const token = tokens.tokens[i];
        console.log(`Token ${i}: ${token.image} (${token.tokenType.name})`);
    }
    
    // Parse the content
    console.log('\nParsing...');
    const result = await services.parser.LangiumParser.parse(content);
    
    if (result.lexerErrors.length > 0 || result.parserErrors.length > 0) {
        console.log('Lexer errors:');
        for (const error of result.lexerErrors) {
            console.log(`- ${error.message}`);
        }
        
        console.log('Parser errors:');
        for (const error of result.parserErrors) {
            console.log(`- ${error.message}`);
        }
    } else {
        console.log('Parsing successful!');
    }
    
    // Print the AST
    console.log('\nAST:');
    console.log(JSON.stringify(result.value, getCircularReplacer(), 2));
}

main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
});
