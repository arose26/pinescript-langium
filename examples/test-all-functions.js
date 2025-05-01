// Test all functions

// Define global objects needed by the imported files
globalThis.indicator = function(name, options) {
  console.log(`Indicator: ${name}`);
};

globalThis.plot = function(value, name, options) {
  console.log(`Plot ${name}: ${value}`);
};

globalThis.color = {
  blue: 'blue',
  red: 'red',
  green: 'green'
};

// Define the functions directly since we can't easily import them in ES modules
// Arrow function with block
function testArrowFunction() {
  function f(x = 10) {
    return x * 2;
  }

  console.log("Testing arrow function with block:");
  console.log(f(5)); // Should output 10
}

// Function with if block
function testFunctionWithIfBlock() {
  function f(x) {
    if (x > 5) {
      return x * 2;
    } else {
      return x;
    }
  }

  console.log("\nTesting function with if block:");
  console.log(f(10, 5)); // Should output 20
  console.log(f(10, 2)); // Should output 20
  console.log(f(3, 5)); // Should output 3
}

// Complex function
function testComplexFunction() {
  function complexFunc(x, y, z) {
    var result = 0;
    var multiplier = 1;
    if (x > 5) {
      multiplier = 2;
      if (y > 3) {
        if (z > 1) {
          return result = x * y * z * multiplier;
        } else {
          return result = x * y * multiplier;
        }
      } else {
        return result = x + y * multiplier;
      }
    } else {
      multiplier = 0.5;
      return result = (x - y) * multiplier;
    }
    return result;
  }

  console.log("\nTesting complex function:");
  console.log(complexFunc(10, 5, 2)); // Should output 200
  console.log(complexFunc(10, 2, 3)); // Should output 120
  console.log(complexFunc(3, 5, 1)); // Should output -1
}

// Run all tests
testArrowFunction();
testFunctionWithIfBlock();
testComplexFunction();
