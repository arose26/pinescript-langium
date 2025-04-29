import * as fs from 'fs';
import * as path from 'path';
import { createPinescriptServices } from './language-server/pinescript-module';
import { PinescriptTokenBuilder } from './language-server/token-builder';

// Create a simple test for the indentation preprocessor
async function testIndentationPreprocessor() {
    console.log('Testing indentation preprocessor...');

    // Read the test file
    const testFilePath = path.resolve(__dirname, '../examples/indentation-test.pine');
    const testFileContent = fs.readFileSync(testFilePath, 'utf-8');

    // Create a token builder
    const tokenBuilder = new PinescriptTokenBuilder();

    // Tokenize the test file
    const tokens = tokenBuilder.tokenize(testFileContent);

    // Print the tokens
    console.log('Tokens:');
    for (const token of tokens) {
        const tokenType = token.tokenType?.name || 'UNKNOWN';
        const tokenText = token.image.replace(/\n/g, '\\n').substring(0, 20);
        console.log(`${tokenType}: "${tokenText}${tokenText.length >= 20 ? '...' : ''}"`);
    }

    // Count INDENT and DEDENT tokens
    const indentCount = tokens.filter(t => t.tokenType?.name === 'INDENT').length;
    const dedentCount = tokens.filter(t => t.tokenType?.name === 'DEDENT').length;
    console.log(`INDENT tokens: ${indentCount}`);
    console.log(`DEDENT tokens: ${dedentCount}`);

    // Check if INDENT and DEDENT tokens are balanced
    if (indentCount === dedentCount) {
        console.log('INDENT and DEDENT tokens are balanced.');
    } else {
        console.log('WARNING: INDENT and DEDENT tokens are not balanced!');
    }
}

// Run the test
testIndentationPreprocessor().catch(error => {
    console.error('Error:', error);
    process.exit(1);
});
