import fs from 'fs';
import path from 'path';
import { createPineScriptServices } from './out/language/pine-script-module.js';
import { NodeFileSystem } from 'langium/node';
import { extractDocument } from './out/cli/cli-util.js';
import util from 'util';

async function main() {
    // Get the file path from command line arguments
    const filePath = process.argv[2];

    if (!filePath) {
        console.error('Please provide a file path');
        process.exit(1);
    }

    try {
        // Create the language services
        const services = createPineScriptServices(NodeFileSystem).PineScript;

        // Parse the file
        console.log(`Parsing ${filePath}...`);
        const document = await extractDocument(filePath, services);

        // Get the AST
        const ast = document.parseResult?.value;
        if (!ast) {
            console.error('Failed to parse the file');
            process.exit(1);
        }

        // Print the AST structure
        console.log('AST Structure:');
        console.log(util.inspect(ast, { depth: 10, colors: true }));

        // Save the AST to a file
        const astOutputPath = path.join(path.dirname(filePath), `${path.basename(filePath, path.extname(filePath))}.ast.json`);
        fs.writeFileSync(astOutputPath, JSON.stringify(ast, (key, value) => {
            // Skip Langium-specific properties
            if (key === '$cstNode') return undefined;
            if (key === '$container') return undefined;
            if (key === '$containerProperty') return undefined;
            if (key === '$containerIndex') return undefined;
            if (key === '$document') return undefined;
            return value;
        }, 2));
        console.log(`AST saved to: ${astOutputPath}`);

        return true;
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

// Use IIFE to handle top-level await
(async () => {
    try {
        await main();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
})();
