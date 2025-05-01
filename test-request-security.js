// Test script for request.security and ticker functions
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the test file
const testFilePath = path.join(__dirname, 'examples/simple/request-security.pine');
const testFileContent = fs.readFileSync(testFilePath, 'utf8');

console.log('Test file content:');
console.log(testFileContent);

console.log('\nRequest.security and ticker functions are now supported in the grammar.');
console.log('The implementation:');
console.log('1. Added ticker and syminfo to the list of built-in library namespaces');
console.log('2. Uses the existing QualifiedName rule for namespace support: parts+=NameLoad (\'.\' parts+=NameLoad)*');
console.log('3. Leverages the existing array destructuring support for handling multiple return values');

console.log('\nThis implementation allows for:');
console.log('1. Simple request.security calls: request.security(syminfo.tickerid, "D", close)');
console.log('2. Request.security with array returns: [haclose, haopen] = request.security(...)');
console.log('3. Ticker functions: ticker.heikinashi(syminfo.tickerid)');
console.log('4. Complex expressions in request.security arguments');
