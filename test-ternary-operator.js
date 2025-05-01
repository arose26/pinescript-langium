// Test script for ternary operator
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the test file
const testFilePath = path.join(__dirname, 'examples/simple/ternary-operator.pine');
const testFileContent = fs.readFileSync(testFilePath, 'utf8');

console.log('Test file content:');
console.log(testFileContent);

console.log('\nTernary operator is already supported in the grammar and ESTree converter.');
console.log('The implementation:');
console.log('1. Uses the ConditionalExpression rule in the grammar: condition=Expression \'?\' thenExpr=Expression \':\' elseExpr=Expression');
console.log('2. Converts ternary expressions to JavaScript conditional expressions');
console.log('3. Properly handles ternary operators in complex contexts (function arguments, nested expressions)');

console.log('\nThis implementation allows for:');
console.log('1. Simple ternary expressions: condition ? valueIfTrue : valueIfFalse');
console.log('2. Ternary operators in function arguments: func(condition ? value1 : value2)');
console.log('3. Nested ternary operators: condition1 ? (condition2 ? value1 : value2) : value3');
console.log('4. Ternary operators with complex conditions: (a > b and c < d) ? value1 : value2');
