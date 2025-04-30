import { NodeFileSystem } from 'langium/node';
import { createPineScriptServices } from './out/language/pine-script-module.js';
import fs from 'node:fs';
import path from 'node:path';
import { URI } from 'langium';

async function main() {
    // Create language services
    const services = createPineScriptServices(NodeFileSystem).PineScript;
    const documentBuilder = services.shared.workspace.DocumentBuilder;

    // Get all test files
    const testDir = path.resolve('./examples/simple');
    const testFiles = fs.readdirSync(testDir)
        .filter(file => file.endsWith('.pine'))
        .map(file => path.join(testDir, file));

    console.log(`Found ${testFiles.length} test files:\n${testFiles.join('\n')}\n`);

    // Test each file
    for (const filePath of testFiles) {
        console.log(`\n=== Testing ${path.basename(filePath)} ===`);

        // Read the file
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        console.log('File content:');
        console.log('-------------');
        console.log(fileContent);
        console.log('-------------');

        // Extract imports
        const importRegex = /import\s+([a-zA-Z_][a-zA-Z_0-9]*(?:\/[a-zA-Z_][a-zA-Z_0-9]*)*)(?:\s+as\s+([a-zA-Z_][a-zA-Z_0-9]*))?/g;
        let match;
        const imports = [];
        while ((match = importRegex.exec(fileContent)) !== null) {
            imports.push({
                path: match[1],
                alias: match[2]
            });
        }

        // Remove import statements from the content
        const contentWithoutImports = fileContent.replace(/import\s+([a-zA-Z_][a-zA-Z_0-9]*(?:\/[a-zA-Z_][a-zA-Z_0-9]*)*)(?:\s+as\s+([a-zA-Z_][a-zA-Z_0-9]*))?/g, '');

        // Parse the document
        console.log('\nParsing document...');
        const uri = URI.file(filePath).toString();
        const document = services.shared.workspace.LangiumDocumentFactory.fromString(contentWithoutImports, uri);

        // Build the document
        await documentBuilder.build([document], { validationChecks: 'all' });

        // Check for errors
        const parseResult = document.parseResult;

        if (parseResult.lexerErrors.length > 0) {
            console.error('Lexer errors:');
            parseResult.lexerErrors.forEach(error => console.error(`- ${error.message}`));
        }

        if (parseResult.parserErrors.length > 0) {
            console.error('Parser errors:');
            parseResult.parserErrors.forEach(error => console.error(`- ${error.message}`));
        }

        if (parseResult.lexerErrors.length === 0 && parseResult.parserErrors.length === 0) {
            console.log('Parsing successful!');
            console.log('AST root type:', parseResult.value.$type);
            console.log('Number of statements:', parseResult.value.statements?.statements?.length || 0);

            // Display the processed file text
            const fileText = document.textDocument.getText();
            console.log('\nProcessed file text (without imports):');
            console.log(fileText);

            // Display imports found
            if (imports.length > 0) {
                console.log('\nImports found:');
                imports.forEach(imp => {
                    console.log(`- ${imp.path}${imp.alias ? ` as ${imp.alias}` : ''}`);
                });
            }

            // Print the AST structure
            console.log('\nAST Structure:');
            printASTStructure(parseResult.value, 0);
        }

        console.log('\n=== End of test ===');
    }
}

function printASTStructure(node, indent) {
    const indentStr = '  '.repeat(indent);

    if (!node) {
        console.log(`${indentStr}null`);
        return;
    }

    console.log(`${indentStr}${node.$type}`);

    for (const key in node) {
        if (key.startsWith('$')) continue;

        const value = node[key];

        if (Array.isArray(value)) {
            console.log(`${indentStr}  ${key}: [Array with ${value.length} items]`);
            value.forEach(item => {
                if (item && typeof item === 'object' && item.$type) {
                    printASTStructure(item, indent + 2);
                } else {
                    console.log(`${indentStr}    ${item}`);
                }
            });
        } else if (value && typeof value === 'object' && value.$type) {
            console.log(`${indentStr}  ${key}:`);
            printASTStructure(value, indent + 2);
        } else {
            console.log(`${indentStr}  ${key}: ${value}`);
        }
    }
}

main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
});
