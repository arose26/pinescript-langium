# PineScript Langium

A Langium-based parser for PineScript.

## Overview

This project aims to provide a Langium-based parser for PineScript, the scripting language used in TradingView.

## Features

- Indentation-aware parsing
- Support for PineScript syntax
- JavaScript code generation
- Array support (experimental)

## Known Issues

### Less Than Operator

There is a known issue with the less than operator (`<`) in the parser. As a workaround, you can use one of the following alternatives:

1. Reverse the comparison: `5 > x` instead of `x < 5`
2. Use logical negation: `not (x >= 5)` instead of `x < 5`

### Array Support

Array support is currently experimental. The parser can generate JavaScript code for arrays, but there are still issues with parsing array literals in some contexts.

## Examples

```pine
// Function declaration
add(a, b) =>
    a + b

// Variable declaration
var x = 5
var y = 10

// Function call
var sum = add(x, y)

// While loop with greater than
var counter = 10
while counter > 0
    counter := counter - 1

// While loop with less than (workaround)
var i = 0
while 5 > i
    i := i + 1

// If statement
if sum > 20
    sum := 20
else
    sum := sum + 5

// Array example (experimental)
var emptyArray = []
var numbers = [1, 2, 3, 4, 5]
var mixed = [1, "hello", true]

// Array access
var firstNumber = numbers[0]

// Array modification
numbers[0] := 10
```

## Development

### Building

```bash
npm run build
```

### Running Tests

```bash
node test-simple.js
```

## Roadmap

- Fix issues with the less than operator
- Improve array support
- Add support for more advanced language features
- Improve error recovery and error messages
- Add comprehensive testing with a wider variety of PineScript code
