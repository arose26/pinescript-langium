// Test the transpilePineToJavascript function
import { transpilePineToJavascript } from './out/index.js';

async function testTranspile() {
    const pineScriptCode = `
// Simple arrow function with expression
simpleArrow(a, b) => a + b

// Arrow function with default parameters
defaultParams(a, b=10) => a + b

// Test usage
var result1 = simpleArrow(5, 10)
var result2 = defaultParams(5)
`;

    const jsCode = await transpilePineToJavascript(pineScriptCode);
    console.log('Transpiled JavaScript:');
    console.log(jsCode);
}

testTranspile().catch(error => {
    console.error('Error:', error);
});
